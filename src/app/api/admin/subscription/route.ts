import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'SCHOOL_ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const schoolId = user.schoolId || (await prisma.school.findFirst())?.id;
    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        _count: {
          select: {
            users: true,
            classes: true,
          },
        },
      },
    });

    if (!school) {
      return NextResponse.json({ success: false, error: 'School record missing' }, { status: 404 });
    }

    const [studentsCount, facultyCount] = await Promise.all([
      prisma.user.count({ where: { schoolId, role: 'STUDENT' } }),
      prisma.user.count({ where: { schoolId, role: 'TEACHER' } }),
    ]);

    const now = new Date();
    const expiry = school.subscriptionExpiryDate ? new Date(school.subscriptionExpiryDate) : new Date(now.getTime() + 365 * 86400000);
    const start = school.subscriptionStartDate ? new Date(school.subscriptionStartDate) : new Date(now.getTime() - 30 * 86400000);
    const daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const isExpired = expiry.getTime() < now.getTime();
    const effectiveStatus = isExpired ? 'EXPIRED' : (school.subscriptionStatus || 'ACTIVE');

    return NextResponse.json({
      success: true,
      data: {
        school: {
          id: school.id,
          name: school.name,
          code: school.code,
          plan: school.subscriptionPlan || 'PROFESSIONAL',
          status: effectiveStatus,
          startDate: start,
          expiryDate: expiry,
          renewalPrice: school.renewalPrice ?? 299.0,
          billingCycle: school.billingCycle || 'ANNUAL',
          autoRenew: school.autoRenew ?? true,
          daysRemaining,
        },
        usage: {
          studentsCount,
          facultyCount,
          classesCount: school._count.classes,
          storageUsedMb: 1420,
          storageLimitMb: 10240,
        },
        plans: [
          {
            id: 'STARTER',
            name: 'Starter Plan',
            priceMonthly: 99,
            priceAnnual: 990,
            features: ['Up to 250 Students', 'Up to 20 Faculty Staff', 'Basic Gradebook & Attendance', 'Standard Web Portal', 'Email Support'],
          },
          {
            id: 'PROFESSIONAL',
            name: 'Professional Plan',
            priceMonthly: 299,
            priceAnnual: 2990,
            features: ['Up to 1,500 Students', 'Up to 100 Faculty Staff', 'Editable Timetable & Exam Hub', 'Fee Engine & Receipts', 'PWA Offline Capabilities', 'Priority Support'],
          },
          {
            id: 'ENTERPRISE',
            name: 'Enterprise Plan',
            priceMonthly: 599,
            priceAnnual: 5990,
            features: ['Unlimited Students', 'Unlimited Faculty & Staff', 'Custom Domain & Dedicated SLA', 'Custom Fee Pipelines & Audits', 'Full PWA & Native Notifications', '24/7 Dedicated Account Manager'],
          },
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const schoolId = user.schoolId;
    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'School not linked' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
    }

    if (action === 'RENEW') {
      const currentExpiry = school.subscriptionExpiryDate ? new Date(school.subscriptionExpiryDate) : new Date();
      const baseDate = currentExpiry.getTime() > Date.now() ? currentExpiry : new Date();
      const extensionDays = school.billingCycle === 'MONTHLY' ? 30 : 365;
      const newExpiry = new Date(baseDate.getTime() + extensionDays * 86400000);

      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: {
          subscriptionExpiryDate: newExpiry,
          subscriptionStatus: 'ACTIVE',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription successfully renewed until ' + newExpiry.toLocaleDateString(),
        data: updated,
      });
    }

    if (action === 'TOGGLE_AUTORENEW') {
      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: {
          autoRenew: !school.autoRenew,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Auto-renewal preference updated',
        data: updated,
      });
    }

    if (action === 'UPDATE_SETTINGS') {
      const { plan, billingCycle, autoRenew } = body;
      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: {
          ...(plan ? { subscriptionPlan: plan } : {}),
          ...(billingCycle ? { billingCycle } : {}),
          ...(autoRenew !== undefined ? { autoRenew: Boolean(autoRenew) } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription settings updated successfully',
        data: updated,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
