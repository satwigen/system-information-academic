import { AttendanceRecord, AttendanceStatus } from '../types';

// =====================================================================
// HYDRATION-SAFE: deterministic seeded PRNG (Mulberry32)
// Ensures server-rendered and client-hydrated outputs are identical.
// =====================================================================
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dates = ['2024-10-01', '2024-10-08', '2024-10-15', '2024-10-22', '2024-10-29'];

function generateRecords(): AttendanceRecord[] {
  const rand = seeded(20240101); // deterministic seed
  const records: AttendanceRecord[] = [];
  const studentIds = Array.from({ length: 88 }, (_, i) => `std-${String(i + 1).padStart(3, '0')}`);

  const classSubjectMap: Record<string, string[]> = {
    'class-it-1a': ['subj-it-web', 'subj-it-db'],
    'class-it-1b': ['subj-it-net', 'subj-it-os'],
    'class-it-3a': ['subj-it-web', 'subj-it-net'],
    'class-inf-1a': ['subj-inf-algo', 'subj-inf-oop'],
    'class-inf-1b': ['subj-inf-se', 'subj-inf-oop'],
    'class-inf-3a': ['subj-inf-ai', 'subj-inf-se'],
    'class-db-1a': ['subj-db-dm', 'subj-db-ec'],
    'class-db-1b': ['subj-db-ba', 'subj-db-ui'],
    'class-db-3a': ['subj-db-dm', 'subj-db-ba'],
  };

  const classStudentMap: Record<string, string[]> = {
    'class-it-1a': studentIds.slice(0, 10),
    'class-it-1b': studentIds.slice(10, 20),
    'class-it-3a': studentIds.slice(20, 30),
    'class-inf-1a': studentIds.slice(30, 40),
    'class-inf-1b': studentIds.slice(40, 50),
    'class-inf-3a': studentIds.slice(50, 60),
    'class-db-1a': studentIds.slice(60, 70),
    'class-db-1b': studentIds.slice(70, 80),
    'class-db-3a': studentIds.slice(80, 88),
  };

  let recordId = 1;

  for (const [classId, subjectList] of Object.entries(classSubjectMap)) {
    const classStudents = classStudentMap[classId];
    for (const subjectId of subjectList) {
      for (const date of dates) {
        for (const studentId of classStudents) {
          // Weighted: 70% present, 10% late, 10% sick, 10% absent
          const r = rand();
          let status: AttendanceStatus;
          if (r < 0.7) status = 'present';
          else if (r < 0.8) status = 'late';
          else if (r < 0.9) status = 'sick';
          else status = 'absent';

          records.push({
            id: `att-${String(recordId++).padStart(4, '0')}`,
            studentId,
            classId,
            subjectId,
            date,
            status,
            recordedBy: 'usr-dosen-001',
          });
        }
      }
    }
  }

  return records;
}

export const attendanceRecords: AttendanceRecord[] = generateRecords();
