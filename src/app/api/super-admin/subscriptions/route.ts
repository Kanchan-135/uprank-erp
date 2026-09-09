import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            users: true,
            classes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const enriched = await Promise.all(
      schools.map(async (s) => {
        const [studentsCount, facultyCount] = await Promise.all([
          prisma.user.count({ where: { schoolId: s.id, role: 'STUDENT' } }),
          prisma.user.count({ where: { schoolId: s.id, role: 'TEACHER' } }),
        ]);

        const expiry = s.subscriptionExpiryDate ? new Date(s.subscriptionExpiryDate) : new Date(now.getTime() + 365 * 86400000);
        const start = s.subscriptionStartDate ? new Date(s.subscriptionStartDate) : new Date(now.getTime() - 30 * 86400000);
        const daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const isExpired = expiry.getTime() < now.getTime();

        return {
          id: s.id,
          name: s.name,
          code: s.code,
          email: s.email,
          phone: s.phone,
          plan: s.subscriptionPlan || 'PROFESSIONAL',
          status: isExpired ? 'EXPIRED' : (s.subscriptionStatus || 'ACTIVE'),
          startDate: start,
          expiryDate: expiry,
          daysRemaining,
          renewalPrice: s.renewalPrice ?? 299.0,
          billingCycle: s.billingCycle || 'ANNUAL',
          autoRenew: s.autoRenew ?? true,
          studentsCount,
          facultyCount,
          classesCount: s._count.classes,
        };
      })
    );

    const totalActive = enriched.filter((s) => s.status === 'ACTIVE').length;
    const totalArr = enriched.reduce((acc, s) => acc + (s.billingCycle === 'ANNUAL' ? s.renewalPrice : s.renewalPrice * 12), 0);
    const expiringSoon = enriched.filter((s) => s.daysRemaining <= 30 && s.status === 'ACTIVE').length;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalSchools: schools.length,
          totalActive,
          totalArr,
          expiringSoon,
        },
        schools: enriched,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      schoolId,
      plan,
      status,
      startDate,
      expiryDate,
      renewalPrice,
      billingCycle,
      autoRenew,
    } = body;

    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'School ID required' }, { status: 400 });
    }

    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: {
        ...(plan ? { subscriptionPlan: plan } : {}),
        ...(status ? { subscriptionStatus: status } : {}),
        ...(startDate ? { subscriptionStartDate: new Date(startDate) } : {}),
        ...(expiryDate ? { subscriptionExpiryDate: new Date(expiryDate) } : {}),
        ...(renewalPrice !== undefined ? { renewalPrice: parseFloat(renewalPrice) } : {}),
        ...(billingCycle ? { billingCycle } : {}),
        ...(autoRenew !== undefined ? { autoRenew: Boolean(autoRenew) } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'School subscription updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
