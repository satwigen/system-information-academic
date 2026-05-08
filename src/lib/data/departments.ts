import { Department } from '../types';

export const departments: Department[] = [
  {
    id: 'dept-it',
    name: 'Information Technology',
    code: 'IT',
    description: 'Department of Information Technology focusing on software engineering, networking, and system administration.',
    studentCount: 45,
    classCount: 3,
    icon: 'Monitor',
  },
  {
    id: 'dept-inf',
    name: 'Informatics',
    code: 'INF',
    description: 'Department of Informatics specializing in computer science, algorithms, and data structures.',
    studentCount: 40,
    classCount: 3,
    icon: 'Code',
  },
  {
    id: 'dept-db',
    name: 'Digital Business',
    code: 'DB',
    description: 'Department of Digital Business combining technology with business strategy and digital marketing.',
    studentCount: 38,
    classCount: 3,
    icon: 'TrendingUp',
  },
];
