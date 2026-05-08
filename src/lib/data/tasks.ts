import { Task, TaskCompletion } from '../types';

// Deterministic ISO strings — NO Date.now() at module scope (hydration-safe).
export const tasks: Task[] = [
  {
    id: 'task-001',
    subjectId: 'subj-it-web',
    classId: 'class-it-1a',
    title: 'Build a Responsive Landing Page',
    description: 'Create a landing page using HTML, CSS, and Tailwind. Must be mobile-responsive.',
    dueDate: '2024-11-10T23:59:00.000Z',
    createdById: 'usr-dosen-001',
  },
  {
    id: 'task-002',
    subjectId: 'subj-it-db',
    classId: 'class-it-1a',
    title: 'ERD Design Assignment',
    description: 'Design an ERD for an e-commerce system with minimum 6 entities.',
    dueDate: '2024-11-15T23:59:00.000Z',
    createdById: 'usr-dosen-001',
  },
  {
    id: 'task-003',
    subjectId: 'subj-it-web',
    classId: 'class-it-1a',
    title: 'React Component Library',
    description: 'Build 5 reusable React components with TypeScript.',
    dueDate: '2024-11-20T23:59:00.000Z',
    createdById: 'usr-dosen-001',
  },
  {
    id: 'task-004',
    subjectId: 'subj-inf-algo',
    classId: 'class-inf-1a',
    title: 'Sorting Algorithms Benchmark',
    description: 'Implement and benchmark Quick Sort, Merge Sort, and Heap Sort.',
    dueDate: '2024-11-12T23:59:00.000Z',
    createdById: 'usr-dosen-002',
  },
  {
    id: 'task-005',
    subjectId: 'subj-inf-oop',
    classId: 'class-inf-1b',
    title: 'Java OOP Project',
    description: 'Build a library management system using OOP principles.',
    dueDate: '2024-11-25T23:59:00.000Z',
    createdById: 'usr-dosen-002',
  },
  {
    id: 'task-006',
    subjectId: 'subj-db-dm',
    classId: 'class-db-1a',
    title: 'Digital Marketing Campaign',
    description: 'Design a 1-month digital marketing plan for a fictional brand.',
    dueDate: '2024-11-18T23:59:00.000Z',
    createdById: 'usr-dosen-001',
  },
];

// Initial completions — empty by default; students toggle them via UI.
export const taskCompletions: TaskCompletion[] = [
  { taskId: 'task-001', userId: 'usr-student-001', done: true, doneAt: '2024-11-05T10:00:00.000Z' },
  { taskId: 'task-002', userId: 'usr-student-001', done: false },
  { taskId: 'task-003', userId: 'usr-student-001', done: false },
];
