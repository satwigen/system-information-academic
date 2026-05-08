import { User } from '../types';

// One sample user per role for role-switching demo.
// Extra users fill out the org chart.
export const users: User[] = [
  {
    id: 'usr-admin-001',
    email: 'admin@campus.ac.id',
    role: 'ADMIN',
    profile: {
      userId: 'usr-admin-001',
      fullName: 'Sarah Admin',
      phone: '+62 812-3456-7890',
      address: 'Jl. Merdeka No. 1, Jakarta',
      avatarUrl: '',
      bio: 'System administrator overseeing campus operations.',
    },
  },
  {
    id: 'usr-head-001',
    email: 'dr.wibowo@campus.ac.id',
    role: 'HEAD',
    deptId: 'dept-it',
    profile: {
      userId: 'usr-head-001',
      fullName: 'Dr. Ahmad Wibowo',
      phone: '+62 812-1111-2222',
      address: 'Jl. Sudirman No. 45, Jakarta',
      avatarUrl: '',
      bio: 'Head of Information Technology Department.',
    },
  },
  {
    id: 'usr-head-002',
    email: 'dr.pratama@campus.ac.id',
    role: 'HEAD',
    deptId: 'dept-inf',
    profile: {
      userId: 'usr-head-002',
      fullName: 'Dr. Rina Pratama',
      phone: '+62 812-3333-4444',
      address: 'Jl. Gatot Subroto No. 12, Jakarta',
      avatarUrl: '',
      bio: 'Head of Informatics Department.',
    },
  },
  {
    id: 'usr-head-003',
    email: 'dr.santoso@campus.ac.id',
    role: 'HEAD',
    deptId: 'dept-db',
    profile: {
      userId: 'usr-head-003',
      fullName: 'Dr. Budi Santoso',
      phone: '+62 812-5555-6666',
      address: 'Jl. Thamrin No. 88, Jakarta',
      avatarUrl: '',
      bio: 'Head of Digital Business Department.',
    },
  },
  {
    id: 'usr-dosen-001',
    email: 'yudi.permana@campus.ac.id',
    role: 'DOSEN',
    deptId: 'dept-it',
    profile: {
      userId: 'usr-dosen-001',
      fullName: 'Yudi Permana, M.Kom',
      phone: '+62 813-1111-2222',
      address: 'Jl. Kebon Jeruk No. 23, Jakarta',
      avatarUrl: '',
      bio: 'Lecturer in Web Development & Databases.',
    },
  },
  {
    id: 'usr-dosen-002',
    email: 'linda.kartika@campus.ac.id',
    role: 'DOSEN',
    deptId: 'dept-inf',
    profile: {
      userId: 'usr-dosen-002',
      fullName: 'Linda Kartika, M.T',
      phone: '+62 813-3333-4444',
      address: 'Jl. Pluit No. 7, Jakarta',
      avatarUrl: '',
      bio: 'Lecturer in Algorithms & AI.',
    },
  },
  {
    id: 'usr-student-001',
    email: 'ahmad.rizki@student.ac.id',
    role: 'STUDENT',
    classId: 'class-it-1a',
    deptId: 'dept-it',
    profile: {
      userId: 'usr-student-001',
      fullName: 'Ahmad Rizki Pratama',
      phone: '+62 822-1234-5678',
      address: 'Jl. Mangga Dua No. 56, Jakarta',
      avatarUrl: '',
      bio: 'IT student, semester 1.',
    },
  },
];

export const DEMO_USER_BY_ROLE = {
  ADMIN: users[0],
  HEAD: users[1],
  DOSEN: users[4],
  STUDENT: users[6],
} as const;
