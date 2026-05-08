import { NextResponse, type NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import AttendanceReportDoc, { type ReportRow } from '@/lib/pdf/AttendanceReportDoc';
import { formatDateJakarta } from '@/lib/time';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Streams a PDF of an academic report. Supported types:
 *   - attendance-class   (per-class/subject aggregates)
 */
export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, department_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['ADMIN', 'HEAD', 'DOSEN'].includes(profile.role)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const departmentFilter = url.searchParams.get('department_id') ?? '';

  switch (params.type) {
    case 'attendance-class': {
      const [{ data: stats }, { data: classes }, { data: subjects }, { data: departments }] = await Promise.all([
        supabase.from('attendance_stats_by_class').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('subjects').select('*'),
        supabase.from('departments').select('*'),
      ]);

      let rows: ReportRow[] = (stats ?? []).map((s) => {
        const cls = classes?.find((c) => c.id === s.class_id);
        const subj = subjects?.find((x) => x.id === s.subject_id);
        const dept = departments?.find((d) => d.id === cls?.department_id);
        return {
          class_name: cls?.name ?? '—',
          department_name: dept?.name ?? '—',
          subject_name: subj?.name ?? '—',
          subject_code: subj?.code ?? '',
          total: s.total,
          present: s.present,
          late: s.late,
          sick: s.sick,
          absent: s.absent,
          rate_pct: Number(s.rate_pct),
        };
      });

      if (departmentFilter) {
        const dept = departments?.find((d) => d.id === departmentFilter);
        if (dept) {
          const classesInDept = new Set(classes?.filter((c) => c.department_id === dept.id).map((c) => c.id));
          rows = rows.filter((r) => classesInDept.has(
            classes?.find((c) => c.name === r.class_name && c.department_id === dept.id)?.id ?? '',
          ));
        }
      }

      rows.sort((a, b) =>
        a.department_name.localeCompare(b.department_name) ||
        a.class_name.localeCompare(b.class_name) ||
        a.subject_code.localeCompare(b.subject_code),
      );

      const filterLabel =
        departmentFilter
          ? `Department: ${departments?.find((d) => d.id === departmentFilter)?.name ?? '—'}`
          : 'All departments';

      const pdfBuffer = await renderToBuffer(
        React.createElement(AttendanceReportDoc, {
          title: 'Attendance Report',
          filterLabel,
          generatedAtLabel: formatDateJakarta(new Date().toISOString()),
          rows,
        }),
      );

      const filename = `attendance-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    default:
      return new NextResponse('Unknown report type', { status: 400 });
  }
}
