/**
 * Supabase database types — mirror of supabase/migrations/0001_init.sql.
 *
 * In production we generate this with:
 *   supabase gen types typescript --project-id <id> > src/types/database.ts
 *
 * It's checked in manually here because the sandbox has no network access
 * to the Supabase CLI. Keep it in sync with the SQL.
 */

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type UserRole = 'ADMIN' | 'HEAD' | 'DOSEN' | 'STUDENT';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'SICK' | 'ABSENT';
export type RoomType = 'LAB' | 'CLASSROOM' | 'AUDITORIUM' | 'SEMINAR_ROOM';
export type MaterialType = 'PDF' | 'SLIDE' | 'VIDEO' | 'LINK' | 'DOCUMENT';

// ------------------------------ Row shapes ------------------------------

export interface ProfileRow {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  bio: string | null;
  class_id: string | null;
  department_id: string | null;
  nim: string | null;
  nip: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  head_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassRow {
  id: string;
  department_id: string;
  name: string;
  semester: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectRow {
  id: string;
  department_id: string;
  code: string;
  name: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface RoomRow {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: RoomType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomMappingRow {
  id: string;
  room_id: string;
  subject_id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecordRow {
  id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  session_date: string;
  status: AttendanceStatus;
  recorded_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialRow {
  id: string;
  class_id: string;
  subject_id: string;
  session_date: string;
  title: string;
  description: string | null;
  file_type: MaterialType;
  file_path: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  uploaded_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  class_id: string;
  subject_id: string;
  title: string;
  description: string;
  due_date: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
}

export interface StudentTaskRow {
  id: string;
  task_id: string;
  user_id: string;
  is_done: boolean;
  done_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementRow {
  id: string;
  author_id: string;
  class_id: string | null;
  department_id: string | null;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface LikeRow {
  id: string;
  announcement_id: string;
  user_id: string;
  created_at: string;
}

export interface CommentRow {
  id: string;
  announcement_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface RoomMappingExpandedRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room_id: string;
  room_name: string;
  building: string;
  floor: number;
  room_type: RoomType;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  class_id: string;
  class_name: string;
  semester: number;
  department_id: string;
}

// ------------------------------ Insert / Update ------------------------------

type Insert<R, K extends keyof R = never> = Partial<R> & Omit<R, 'id' | 'created_at' | 'updated_at' | K>;
type Update<R> = Partial<Omit<R, 'id' | 'created_at' | 'updated_at'>>;

// ------------------------------ Database type ------------------------------

export interface Database {
  public: {
    Tables: {
      profiles:            { Row: ProfileRow;          Insert: Insert<ProfileRow>;          Update: Update<ProfileRow> };
      departments:         { Row: DepartmentRow;       Insert: Insert<DepartmentRow>;       Update: Update<DepartmentRow> };
      classes:             { Row: ClassRow;            Insert: Insert<ClassRow>;            Update: Update<ClassRow> };
      subjects:            { Row: SubjectRow;          Insert: Insert<SubjectRow>;          Update: Update<SubjectRow> };
      rooms:               { Row: RoomRow;             Insert: Insert<RoomRow>;             Update: Update<RoomRow> };
      room_mappings:       { Row: RoomMappingRow;      Insert: Insert<RoomMappingRow>;      Update: Update<RoomMappingRow> };
      attendance_records:  { Row: AttendanceRecordRow; Insert: Insert<AttendanceRecordRow>; Update: Update<AttendanceRecordRow> };
      materials:           { Row: MaterialRow;         Insert: Insert<MaterialRow>;         Update: Update<MaterialRow> };
      tasks:               { Row: TaskRow;             Insert: Insert<TaskRow>;             Update: Update<TaskRow> };
      student_tasks:       { Row: StudentTaskRow;      Insert: Insert<StudentTaskRow>;      Update: Update<StudentTaskRow> };
      announcements:       { Row: AnnouncementRow;     Insert: Insert<AnnouncementRow>;     Update: Update<AnnouncementRow> };
      likes:               { Row: LikeRow;             Insert: Insert<LikeRow>;             Update: Update<LikeRow> };
      comments:            { Row: CommentRow;          Insert: Insert<CommentRow>;          Update: Update<CommentRow> };
    };
    Views: {
      room_mappings_expanded:    { Row: RoomMappingExpandedRow };
      attendance_stats_by_class: {
        Row: {
          class_id: string;
          subject_id: string;
          total: number;
          present: number;
          late: number;
          sick: number;
          absent: number;
          rate_pct: number;
        };
      };
    };
    Enums: {
      user_role: UserRole;
      attendance_status: AttendanceStatus;
      room_type: RoomType;
      material_type: MaterialType;
    };
  };
}
