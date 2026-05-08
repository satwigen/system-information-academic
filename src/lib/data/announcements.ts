import { Announcement, Comment, Like } from '../types';

export const announcements: Announcement[] = [
  {
    id: 'ann-001',
    authorId: 'usr-dosen-001',
    classId: 'class-it-1a',
    title: 'Midterm Exam Schedule Released',
    body:
      'The midterm exam for Web Development will take place on Nov 15 at 09:00 in Lab 1. Please bring your student ID and a laptop with a working development environment.',
    pinned: true,
    createdAt: '2024-10-25T09:00:00.000Z',
  },
  {
    id: 'ann-002',
    authorId: 'usr-head-001',
    deptId: 'dept-it',
    title: 'Department Seminar: Cloud Computing Trends',
    body:
      'Join us this Friday at 14:00 in the Auditorium for a seminar by our industry partner on emerging cloud computing trends. All IT students are encouraged to attend.',
    pinned: false,
    createdAt: '2024-10-22T10:30:00.000Z',
  },
  {
    id: 'ann-003',
    authorId: 'usr-dosen-002',
    classId: 'class-inf-1a',
    title: 'New Material: Big-O Cheat Sheet',
    body:
      'I just uploaded a new cheat sheet on Big-O notation. Make sure to review it before our next lecture.',
    pinned: false,
    createdAt: '2024-10-20T11:00:00.000Z',
  },
  {
    id: 'ann-004',
    authorId: 'usr-admin-001',
    title: 'Room Reassignment Notice',
    body:
      'Due to maintenance in Building A, all Monday sessions in Lab 1 will temporarily relocate to Lab 3 in Building C starting next week.',
    pinned: true,
    createdAt: '2024-10-18T08:00:00.000Z',
  },
];

export const initialComments: Comment[] = [
  {
    id: 'cmt-001',
    announcementId: 'ann-001',
    userId: 'usr-student-001',
    body: 'Thanks for the heads-up! Will the exam cover everything up to week 8?',
    createdAt: '2024-10-25T10:00:00.000Z',
  },
  {
    id: 'cmt-002',
    announcementId: 'ann-002',
    userId: 'usr-dosen-001',
    body: 'Highly recommended for all my students.',
    createdAt: '2024-10-22T11:15:00.000Z',
  },
];

export const initialLikes: Like[] = [
  { id: 'like-001', announcementId: 'ann-001', userId: 'usr-student-001' },
  { id: 'like-002', announcementId: 'ann-002', userId: 'usr-student-001' },
];
