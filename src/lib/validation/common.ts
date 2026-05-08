import { z } from 'zod';

export const UUIDSchema = z.string().uuid();
export const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const TimeStringSchema = z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/);

export const UserRoleSchema = z.enum(['ADMIN', 'HEAD', 'DOSEN', 'STUDENT']);
export const AttendanceStatusSchema = z.enum(['PRESENT', 'LATE', 'SICK', 'ABSENT']);
export const RoomTypeSchema = z.enum(['LAB', 'CLASSROOM', 'AUDITORIUM', 'SEMINAR_ROOM']);
export const MaterialTypeSchema = z.enum(['PDF', 'SLIDE', 'VIDEO', 'LINK', 'DOCUMENT']);
