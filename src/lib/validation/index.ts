import { z } from 'zod';
import {
  UUIDSchema,
  DateStringSchema,
  TimeStringSchema,
  UserRoleSchema,
  AttendanceStatusSchema,
  RoomTypeSchema,
  MaterialTypeSchema,
} from './common';

// -------------------- Auth --------------------

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const UpdatePasswordSchema = z.object({
  newPassword: z.string().min(8).max(200),
});

// -------------------- Profile --------------------

export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(1).max(120),
  phone: z.string().max(40).optional().nullable(),
  address: z.string().max(240).optional().nullable(),
  bio: z.string().max(400).optional().nullable(),
});

export const SetAvatarSchema = z.object({
  path: z.string().min(1).max(400),
});

// -------------------- Users (admin) --------------------

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  full_name: z.string().min(1).max(120),
  role: UserRoleSchema,
  department_id: UUIDSchema.nullable().optional(),
  class_id: UUIDSchema.nullable().optional(),
  nim: z.string().max(40).nullable().optional(),
  nip: z.string().max(40).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  address: z.string().max(240).nullable().optional(),
});

export const UpdateUserSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  role: UserRoleSchema.optional(),
  department_id: UUIDSchema.nullable().optional(),
  class_id: UUIDSchema.nullable().optional(),
  nim: z.string().max(40).nullable().optional(),
  nip: z.string().max(40).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  address: z.string().max(240).nullable().optional(),
});

export const ResetUserPasswordSchema = z.object({
  newPassword: z.string().min(8).max(200),
});

// -------------------- Departments --------------------

export const DepartmentSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(40).nullable().optional(),
  head_id: UUIDSchema.nullable().optional(),
});

// -------------------- Classes --------------------

export const ClassSchema = z.object({
  department_id: UUIDSchema,
  name: z.string().min(1).max(80),
  semester: z.number().int().min(1).max(14),
});

// -------------------- Subjects --------------------

export const SubjectSchema = z.object({
  department_id: UUIDSchema,
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(120),
  credits: z.number().int().min(1).max(10),
});

// -------------------- Rooms --------------------

export const RoomSchema = z.object({
  name: z.string().min(1).max(80),
  building: z.string().min(1).max(80),
  floor: z.number().int().min(-3).max(50),
  capacity: z.number().int().positive().max(1000),
  type: RoomTypeSchema,
  notes: z.string().max(400).nullable().optional(),
});

export const RoomMappingSchema = z
  .object({
    room_id: UUIDSchema,
    subject_id: UUIDSchema,
    class_id: UUIDSchema,
    day_of_week: z.number().int().min(0).max(6),
    start_time: TimeStringSchema,
    end_time: TimeStringSchema,
  })
  .refine((v) => v.start_time < v.end_time, {
    message: 'end_time must be after start_time',
    path: ['end_time'],
  });

// -------------------- Attendance --------------------

export const MarkAttendanceSchema = z.object({
  student_id: UUIDSchema,
  class_id: UUIDSchema,
  subject_id: UUIDSchema,
  session_date: DateStringSchema,
  status: AttendanceStatusSchema,
});

export const MarkAllPresentSchema = z.object({
  class_id: UUIDSchema,
  subject_id: UUIDSchema,
  session_date: DateStringSchema,
});

// -------------------- Tasks --------------------

export const CreateTaskSchema = z.object({
  class_id: UUIDSchema,
  subject_id: UUIDSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  due_date: z.string().datetime(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

// -------------------- Materials --------------------

export const FinalizeMaterialSchema = z.object({
  class_id: UUIDSchema,
  subject_id: UUIDSchema,
  session_date: DateStringSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  file_path: z.string().min(1).max(500),
  file_size_bytes: z.number().int().positive().max(52_428_800),
  mime_type: z.string().min(1).max(120),
  file_type: MaterialTypeSchema,
});

export const UpdateMaterialSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
});

// -------------------- Feed --------------------

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10_000),
  class_id: UUIDSchema.nullable().optional(),
  department_id: UUIDSchema.nullable().optional(),
  pinned: z.boolean().optional().default(false),
});

export const UpdateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10_000).optional(),
  pinned: z.boolean().optional(),
});

export const AddCommentSchema = z.object({
  announcement_id: UUIDSchema,
  body: z.string().min(1).max(2000),
});

export type SignInInput = z.infer<typeof SignInSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type DepartmentInput = z.infer<typeof DepartmentSchema>;
export type ClassInput = z.infer<typeof ClassSchema>;
export type SubjectInput = z.infer<typeof SubjectSchema>;
export type RoomInput = z.infer<typeof RoomSchema>;
export type RoomMappingInput = z.infer<typeof RoomMappingSchema>;
export type MarkAttendanceInput = z.infer<typeof MarkAttendanceSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type FinalizeMaterialInput = z.infer<typeof FinalizeMaterialSchema>;
export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementSchema>;
