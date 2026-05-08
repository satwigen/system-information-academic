import { Room, RoomMapping } from '../types';

export const rooms: Room[] = [
  { id: 'room-001', name: 'Lab 1',      building: 'Building A', floor: 2, capacity: 30, type: 'LAB',          notes: 'Computer lab with 30 workstations.' },
  { id: 'room-002', name: 'Lab 2',      building: 'Building A', floor: 2, capacity: 30, type: 'LAB',          notes: 'Network & security lab.' },
  { id: 'room-003', name: 'Room 304',   building: 'Building A', floor: 3, capacity: 45, type: 'CLASSROOM',    notes: 'Standard classroom with projector.' },
  { id: 'room-004', name: 'Room 305',   building: 'Building A', floor: 3, capacity: 40, type: 'CLASSROOM',    notes: 'Smart board equipped.' },
  { id: 'room-005', name: 'Auditorium', building: 'Building B', floor: 1, capacity: 200, type: 'AUDITORIUM',  notes: 'Used for guest lectures and seminars.' },
  { id: 'room-006', name: 'Seminar A',  building: 'Building B', floor: 2, capacity: 60, type: 'SEMINAR_ROOM', notes: 'Horseshoe configuration.' },
  { id: 'room-007', name: 'Lab 3',      building: 'Building C', floor: 1, capacity: 25, type: 'LAB',          notes: 'Design & UI/UX lab with Mac stations.' },
  { id: 'room-008', name: 'Room 201',   building: 'Building C', floor: 2, capacity: 35, type: 'CLASSROOM',    notes: 'Business department classroom.' },
];

export const roomMappings: RoomMapping[] = [
  { id: 'map-001', roomId: 'room-001', subjectId: 'subj-it-web',   classId: 'class-it-1a',  dayOfWeek: 1, startTime: '08:00', endTime: '10:00' },
  { id: 'map-002', roomId: 'room-002', subjectId: 'subj-it-net',   classId: 'class-it-1b',  dayOfWeek: 2, startTime: '10:00', endTime: '12:00' },
  { id: 'map-003', roomId: 'room-003', subjectId: 'subj-it-db',    classId: 'class-it-1a',  dayOfWeek: 3, startTime: '13:00', endTime: '15:00' },
  { id: 'map-004', roomId: 'room-001', subjectId: 'subj-inf-algo', classId: 'class-inf-1a', dayOfWeek: 1, startTime: '10:00', endTime: '12:00' },
  { id: 'map-005', roomId: 'room-004', subjectId: 'subj-inf-oop',  classId: 'class-inf-1b', dayOfWeek: 2, startTime: '08:00', endTime: '10:00' },
  { id: 'map-006', roomId: 'room-005', subjectId: 'subj-inf-ai',   classId: 'class-inf-3a', dayOfWeek: 4, startTime: '13:00', endTime: '16:00' },
  { id: 'map-007', roomId: 'room-008', subjectId: 'subj-db-dm',    classId: 'class-db-1a',  dayOfWeek: 1, startTime: '13:00', endTime: '15:00' },
  { id: 'map-008', roomId: 'room-007', subjectId: 'subj-db-ui',    classId: 'class-db-1b',  dayOfWeek: 3, startTime: '08:00', endTime: '10:00' },
  { id: 'map-009', roomId: 'room-006', subjectId: 'subj-db-ba',    classId: 'class-db-3a',  dayOfWeek: 5, startTime: '10:00', endTime: '12:00' },
];
