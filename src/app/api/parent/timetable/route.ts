import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const requestedChildId = searchParams.get('childId');

    // Get parent children
    const relations = await prisma.parentStudent.findMany({
      where: { parentId: user.id },
      include: {
        student: {
          include: {
            profile: true,
            enrollments: {
              where: { status: 'ENROLLED' },
              include: {
                class: {
                  include: {
                    primaryTeachers: {
                      include: { profile: true },
                    },
                  },
                },
                section: {
                  include: {
                    classTeachers: {
                      include: { profile: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (relations.length === 0) {
      return NextResponse.json({
        success: true,
        data: { children: [], activeChild: null, timetable: [], classTeacher: null },
      });
    }

    const children = relations.map((r) => {
      const enr = r.student.enrollments[0];
      return {
        id: r.student.id,
        name: `${r.student.profile?.firstName} ${r.student.profile?.lastName}`,
        rollNumber: enr?.rollNumber || 'N/A',
        classId: enr?.classId,
        className: enr?.class?.name || 'Unassigned',
        sectionId: enr?.sectionId,
        sectionName: enr?.section?.name || 'Unassigned',
      };
    });

    const activeChild = children.find((c) => c.id === requestedChildId) || children[0];
    const targetRelation = relations.find((r) => r.student.id === activeChild.id);
    const enrollment = targetRelation?.student.enrollments[0];

    let classTeacher = null;
    if (enrollment) {
      // Find assigned Class Teacher from Section or Class
      const teacher = enrollment.section?.classTeachers?.[0] || enrollment.class?.primaryTeachers?.[0];
      if (teacher) {
        classTeacher = {
          id: teacher.id,
          name: `${teacher.profile?.firstName} ${teacher.profile?.lastName}`,
          email: teacher.email,
          phone: teacher.profile?.phone || 'Campus Extension',
          assignedTo: `${enrollment.class.name} (${enrollment.section.name})`,
        };
      }
    }

    // Fetch weekly timetable periods
    let timetable: any[] = [];
    if (enrollment?.classId && enrollment?.sectionId) {
      timetable = await prisma.timetableSlot.findMany({
        where: {
          classId: enrollment.classId,
          sectionId: enrollment.sectionId,
        },
        include: {
          subject: true,
          teacher: {
            include: { profile: true },
          },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        children,
        activeChild,
        classTeacher,
        timetable,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
