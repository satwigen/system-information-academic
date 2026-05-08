# API Routes — SIAKAD v3.0

> **Contract document.** Every write path in the application is listed here as either a **Server Action** (preferred for small payloads) or a **Route Handler** (required for file uploads, streaming, and OAuth callbacks). Reads are done in Server Components directly via `createServerClient()` and are not enumerated here.

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Server Actions by Entity](#2-server-actions-by-entity)
3. [Route Handlers](#3-route-handlers)
4. [Validation (Zod) Summary](#4-validation-zod-summary)
5. [Error Model](#5-error-model)
6. [Revalidation Map](#6-revalidation-map)

---

## 1. Conventions

| Concern | Rule |
|---|---|
| Default mutation surface | **Server Action** (`'use server'`) |
| File upload / streaming | **Route Handler** (`route.ts`) |
| Auth | Every action reads session via `createServerClient()`; unauthenticated → throw |
| Authorization | Client-friendly pre-check by role **in addition to** RLS at DB |
| Input validation | Zod schema co-located in `src/lib/validation/` |
| Response shape | Actions return `{ ok: true, data? } \| { ok: false, error }` |
| Side effects | `revalidatePath` / `revalidateTag` after every successful mutation |
| Logging | Server-side structured log (`console.error`) — never leak internals to client |
| Folder | Actions live in `src/actions/{entity}.ts`; route handlers in `src/app/api/.../route.ts` |

### 1.1 Standard Return Type

```ts
export type ActionResult<T = null> =
  | { ok: true;  data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

### 1.2 Standard Session Check

Every action starts with:

```ts
const supabase = createServerClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return { ok: false, error: 'Not authenticated' };

const { data: profile } = await supabase
  .from('profiles')
  .select('role, department_id, class_id')
  .eq('id', user.id)
  .single();
if (!profile) return { ok: false, error: 'Profile missing' };
```

---

## 2. Server Actions by Entity

Every action below lives in the `src/actions/` folder with `'use server'` at the top.

### 2.1 Auth — `src/actions/auth.ts`

| Action | Signature | Roles | Notes |
|---|---|---|---|
| `signIn` | `(email, password) → ActionResult<{ redirectTo: string }>` | public | Returns `/` on success |
| `signOut` | `() → ActionResult` | any | Clears cookies, redirects to `/login` |
| `requestPasswordReset` | `(email) → ActionResult` | public | Triggers magic-link email |
| `updatePassword` | `(newPassword) → ActionResult` | authenticated | Invalidates other sessions |

### 2.2 Profile — `src/actions/profile.ts`

| Action | Signature | Roles | Notes |
|---|---|---|---|
| `updateProfile` | `(patch: ProfileUpdateInput) → ActionResult<Profile>` | self | Admin updates via `updateUser` |
| `setAvatar` | `(fileName: string) → ActionResult<Profile>` | self | Upload goes through `/api/avatars/upload`; this only stores the resulting path |

### 2.3 Users — `src/actions/users.ts` (ADMIN ONLY)

| Action | Signature | Notes |
|---|---|---|
| `createUser` | `(input: CreateUserInput) → ActionResult<Profile>` | Uses `supabase.auth.admin.createUser()` (service role). Trigger fills `profiles`. Then PATCH profile with role/class/dept/NIM/NIP. |
| `updateUser` | `(id, patch: UpdateUserInput) → ActionResult<Profile>` | Admin may update role, department, class, NIM/NIP. |
| `deleteUser` | `(id) → ActionResult` | Uses `supabase.auth.admin.deleteUser()`. Cascades via FK. |
| `resetUserPassword` | `(id, newPassword) → ActionResult` | Admin action; updates via admin API. |

### 2.4 Departments — `src/actions/departments.ts` (ADMIN)

| Action | Signature |
|---|---|
| `createDepartment` | `(input) → ActionResult<Department>` |
| `updateDepartment` | `(id, patch) → ActionResult<Department>` |
| `deleteDepartment` | `(id) → ActionResult` |

### 2.5 Classes — `src/actions/classes.ts` (ADMIN)

| Action | Signature |
|---|---|
| `createClass` | `(input) → ActionResult<Class>` |
| `updateClass` | `(id, patch) → ActionResult<Class>` |
| `deleteClass` | `(id) → ActionResult` |

### 2.6 Subjects (Courses) — `src/actions/subjects.ts` (ADMIN)

| Action | Signature |
|---|---|
| `createSubject` | `(input) → ActionResult<Subject>` |
| `updateSubject` | `(id, patch) → ActionResult<Subject>` |
| `deleteSubject` | `(id) → ActionResult` |

### 2.7 Rooms — `src/actions/rooms.ts` (ADMIN)

| Action | Signature |
|---|---|
| `createRoom` | `(input) → ActionResult<Room>` |
| `updateRoom` | `(id, patch) → ActionResult<Room>` |
| `deleteRoom` | `(id) → ActionResult` — cascades mappings |

### 2.8 Room Mappings — `src/actions/roomMappings.ts` (ADMIN)

| Action | Signature | Notes |
|---|---|---|
| `createRoomMapping` | `(input) → ActionResult<RoomMapping>` | Zod validates `start_time < end_time`. DB unique constraint catches conflicts. |
| `updateRoomMapping` | `(id, patch) → ActionResult<RoomMapping>` | — |
| `deleteRoomMapping` | `(id) → ActionResult` | — |

### 2.9 Attendance — `src/actions/attendance.ts` (DOSEN + ADMIN)

| Action | Signature | Notes |
|---|---|---|
| `markAttendance` | `({ studentId, classId, subjectId, sessionDate, status }) → ActionResult<AttendanceRecord>` | Upsert on unique `(student, class, subject, date)`. RLS blocks STUDENT attempts. |
| `markAllPresent` | `({ classId, subjectId, sessionDate }) → ActionResult<{ count: number }>` | Bulk-upserts all students in class as `PRESENT`. |
| `deleteAttendance` | `(id) → ActionResult` | ADMIN only via RLS. |

### 2.10 Tasks — `src/actions/tasks.ts` (DOSEN + ADMIN create/edit; STUDENT toggle)

| Action | Signature | Roles | Notes |
|---|---|---|---|
| `createTask` | `(input) → ActionResult<Task>` | DOSEN, ADMIN | `created_by_id = auth.uid()` |
| `updateTask` | `(id, patch) → ActionResult<Task>` | author or ADMIN | — |
| `deleteTask` | `(id) → ActionResult` | author or ADMIN | — |
| `toggleTaskDone` | `(taskId) → ActionResult<{ done: boolean }>` | STUDENT | Upsert `student_tasks(task_id, user_id)`; flip `is_done` and set `done_at`. **Not** callable by DOSEN (enforced by RLS). |

### 2.11 Feed — `src/actions/feed.ts`

| Action | Signature | Roles | Notes |
|---|---|---|---|
| `createAnnouncement` | `(input) → ActionResult<Announcement>` | ADMIN, HEAD, DOSEN | `author_id = auth.uid()` |
| `updateAnnouncement` | `(id, patch) → ActionResult<Announcement>` | author OR ADMIN | **Admin can edit ANY (PRD: ADM-FEED-01)** |
| `deleteAnnouncement` | `(id) → ActionResult` | author OR ADMIN | **Admin can delete ANY (PRD: ADM-FEED-02)** |
| `toggleLike` | `(announcementId) → ActionResult<{ liked: boolean }>` | any auth | Insert or delete row in `likes` |
| `addComment` | `(announcementId, body) → ActionResult<Comment>` | any auth | — |
| `deleteComment` | `(id) → ActionResult` | author OR ADMIN | — |

### 2.12 Materials — `src/actions/materials.ts`

| Action | Signature | Roles | Notes |
|---|---|---|---|
| `finalizeMaterial` | `({ classId, subjectId, sessionDate, title, description, filePath, fileSize, mimeType, fileType }) → ActionResult<Material>` | DOSEN, ADMIN | Called by the browser **after** the upload route handler returns a path. Inserts the `materials` row. |
| `updateMaterial` | `(id, patch) → ActionResult<Material>` | uploader OR ADMIN | — |
| `deleteMaterial` | `(id) → ActionResult` | uploader OR ADMIN | Also deletes the storage object. |

---

## 3. Route Handlers

### 3.1 `POST /api/auth/callback`

**Purpose:** Supabase PKCE code exchange after email confirmation / password reset.

| Field | Value |
|---|---|
| Method | GET (Supabase adds `?code=…`) |
| Auth | Public |
| Response | 302 → `/` on success, `/login?error=…` on failure |

```ts
// Pseudocode
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) return NextResponse.redirect(`${origin}/login?error=no_code`);

  const supabase = createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);

  return NextResponse.redirect(`${origin}/`);
}
```

---

### 3.2 `POST /api/materials/upload`

**Purpose:** Accept multipart upload (server action body limit ≈ 1 MB, insufficient for 50 MB).

| Field | Value |
|---|---|
| Method | POST |
| Auth | DOSEN or ADMIN |
| Body | `multipart/form-data` with fields `classId`, `subjectId`, `sessionDate`, `title`, `description?`, `fileType`, `file` |
| Size limit | 50 MB (server-checked before upload) |
| Response | `{ ok: true, data: { filePath, fileSize, mimeType } }` |

```ts
// Pseudocode
export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ ok: false, error: 'Unauthorized' }, 401);

  const { data: profile } = await supabase.from('profiles')
    .select('role').eq('id', user.id).single();
  if (!profile || !['DOSEN', 'ADMIN'].includes(profile.role))
    return json({ ok: false, error: 'Forbidden' }, 403);

  const form = await req.formData();
  const file = form.get('file') as File;
  if (!file)                        return json({ ok: false, error: 'No file' }, 400);
  if (file.size > 52_428_800)       return json({ ok: false, error: 'File exceeds 50 MB' }, 413);

  const classId     = String(form.get('classId'));
  const sessionDate = String(form.get('sessionDate'));
  const safeName    = crypto.randomUUID() + '-' + sanitize(file.name);
  const filePath    = `${classId}/${sessionDate}/${safeName}`;

  const { error: upErr } = await supabase.storage
    .from('materials')
    .upload(filePath, file, { contentType: file.type });
  if (upErr) return json({ ok: false, error: upErr.message }, 500);

  return json({
    ok: true,
    data: { filePath, fileSize: file.size, mimeType: file.type },
  });
}
```

> After the upload resolves on the client, the browser calls the `finalizeMaterial` Server Action with the returned `filePath` to insert the DB row. This keeps the small (row insertion) work as an action and the big (file) work as a handler.

---

### 3.3 `GET /api/materials/[id]/download`

**Purpose:** Issue a short-lived signed URL and redirect to it. Prevents leaking direct storage URLs and re-checks RLS server-side.

| Field | Value |
|---|---|
| Method | GET |
| Auth | Authenticated + material must be readable under RLS |
| Response | 302 → signed URL (60 s validity) |

```ts
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect('/login');

  // RLS will ensure only allowed rows come back
  const { data: material, error } = await supabase
    .from('materials').select('file_path').eq('id', params.id).single();
  if (error || !material) return new NextResponse('Not found', { status: 404 });

  const { data: signed, error: signErr } = await supabase.storage
    .from('materials')
    .createSignedUrl(material.file_path, 60);
  if (signErr) return new NextResponse('Error', { status: 500 });

  return NextResponse.redirect(signed.signedUrl);
}
```

---

### 3.4 `POST /api/avatars/upload`

**Purpose:** Upload avatar to `avatars/{userId}/avatar.{ext}` and return the public URL.

| Field | Value |
|---|---|
| Method | POST |
| Auth | Authenticated (any role, self only) |
| Body | `multipart/form-data` with `file` |
| Size limit | 5 MB |
| Response | `{ ok: true, data: { publicUrl, path } }` |

```ts
export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ ok: false, error: 'Unauthorized' }, 401);

  const form = await req.formData();
  const file = form.get('file') as File;
  if (!file || file.size > 5_242_880)
    return json({ ok: false, error: 'File invalid or exceeds 5 MB' }, 413);

  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/avatar.${ext}`;

  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) return json({ ok: false, error: error.message }, 500);

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  return json({ ok: true, data: { publicUrl: pub.publicUrl, path } });
}
```

The browser then calls the `setAvatar(path)` Server Action to persist the `avatar_url` in `profiles`.

---

### 3.5 `GET /api/reports/[type]/pdf`

**Purpose:** Stream a generated PDF using `@react-pdf/renderer`. Runs on server, bypasses hydration entirely.

| Field | Value |
|---|---|
| Method | GET |
| Path params | `type` ∈ `attendance-class`, `attendance-student`, `materials-class` |
| Query params | filter params per report (e.g. `classId`, `from`, `to`) |
| Auth | ADMIN, HEAD (dept scope), DOSEN (own classes) |
| Response | `application/pdf` with `Content-Disposition: attachment; filename="…pdf"` |

```ts
// Pseudocode
export async function GET(req: Request, { params }: { params: { type: string } }) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const { data: profile } = await supabase.from('profiles')
    .select('role, department_id').eq('id', user.id).single();
  if (!profile || !['ADMIN', 'HEAD', 'DOSEN'].includes(profile.role))
    return new NextResponse('Forbidden', { status: 403 });

  const url    = new URL(req.url);
  const input  = parseReportQuery(params.type, url.searchParams);
  const rows   = await fetchReportRows(supabase, params.type, input, profile);

  const stream = await pdf(<ReportDocument type={params.type} rows={rows} />).toBuffer();
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${safeName(params.type)}.pdf"`,
    },
  });
}
```

**Printing** is a client-only concern: the report page has a Print button that calls `window.print()`. Print stylesheet lives in `globals.css` under `@media print`.

---

### 3.6 `POST /api/admin/cron/revalidate-room-mappings` (optional)

**Purpose:** Nudge the `room-mappings` cache tag every 15 minutes so the auto-expiry filter stays fresh.

| Field | Value |
|---|---|
| Auth | Cron secret header `x-cron-secret` matching `CRON_SECRET` env |
| Response | `{ ok: true, revalidated: true }` |

```ts
export async function POST(req: Request) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET)
    return new NextResponse('Forbidden', { status: 403 });
  revalidateTag('room-mappings');
  return NextResponse.json({ ok: true, revalidated: true });
}
```

Vercel Cron config in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/admin/cron/revalidate-room-mappings", "schedule": "*/15 * * * *" }
  ]
}
```

---

## 4. Validation (Zod) Summary

Each entity has a schema file in `src/lib/validation/`. Key shapes:

```ts
// profiles.ts
export const ProfileUpdateSchema = z.object({
  full_name: z.string().min(1).max(120),
  phone: z.string().max(40).optional().nullable(),
  address: z.string().max(240).optional().nullable(),
  bio: z.string().max(400).optional().nullable(),
});

// rooms.ts
export const CreateRoomSchema = z.object({
  name:      z.string().min(1).max(80),
  building:  z.string().min(1).max(80),
  floor:     z.number().int().min(-3).max(50),
  capacity:  z.number().int().positive().max(1000),
  type:      z.enum(['LAB','CLASSROOM','AUDITORIUM','SEMINAR_ROOM']),
  notes:     z.string().max(400).optional().nullable(),
});

// roomMappings.ts
export const CreateRoomMappingSchema = z.object({
  room_id:     z.string().uuid(),
  subject_id:  z.string().uuid(),
  class_id:    z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  start_time:  z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  end_time:    z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
}).refine(v => v.start_time < v.end_time, { message: 'end_time must be after start_time' });

// attendance.ts
export const MarkAttendanceSchema = z.object({
  student_id:   z.string().uuid(),
  class_id:     z.string().uuid(),
  subject_id:   z.string().uuid(),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status:       z.enum(['PRESENT','LATE','SICK','ABSENT']),
});

// tasks.ts
export const CreateTaskSchema = z.object({
  class_id:    z.string().uuid(),
  subject_id:  z.string().uuid(),
  title:       z.string().min(1).max(200),
  description: z.string().max(5000),
  due_date:    z.string().datetime(),
});

// materials.ts
export const FinalizeMaterialSchema = z.object({
  class_id:     z.string().uuid(),
  subject_id:   z.string().uuid(),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title:        z.string().min(1).max(200),
  description:  z.string().max(2000).optional().nullable(),
  file_path:    z.string().min(1),
  file_size:    z.number().int().positive().max(52_428_800),
  mime_type:    z.string().min(1),
  file_type:    z.enum(['PDF','SLIDE','VIDEO','LINK','DOCUMENT']),
});

// announcements.ts
export const CreateAnnouncementSchema = z.object({
  title:         z.string().min(1).max(200),
  body:          z.string().min(1).max(10_000),
  class_id:      z.string().uuid().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  pinned:        z.boolean().optional().default(false),
});
```

---

## 5. Error Model

| Scenario | `error` string | HTTP (for route handlers) |
|---|---|---|
| Not logged in | `Not authenticated` | 401 |
| Insufficient role | `Forbidden` | 403 |
| Validation failure | `Invalid input` + `fieldErrors` map | 400 |
| Unique conflict | `Already exists` | 409 |
| RLS denied | `Forbidden` | 403 |
| Unknown DB error | Generic `Server error` (details logged) | 500 |
| File too large | `File exceeds <limit>` | 413 |

Actions never expose raw DB error messages; they translate via a small `mapDbError()` helper.

---

## 6. Revalidation Map

After every successful mutation, the action calls `revalidatePath` or `revalidateTag`:

| Action | Revalidate |
|---|---|
| `createUser`, `updateUser`, `deleteUser` | `/admin/users`, `/search` |
| `createDepartment`, `updateDepartment`, `deleteDepartment` | `/admin/departments`, `/` |
| `createClass`, `updateClass`, `deleteClass` | `/admin/classes`, `/attendance`, `/reports` |
| `createSubject`, `updateSubject`, `deleteSubject` | `/admin/subjects` |
| `createRoom`, `updateRoom`, `deleteRoom` | `/admin/rooms`; `tag:room-mappings` |
| `createRoomMapping`, `updateRoomMapping`, `deleteRoomMapping` | `/admin/rooms`, `/`; `tag:room-mappings` |
| `markAttendance`, `markAllPresent` | `/attendance`, `/reports` |
| `createTask`, `updateTask`, `deleteTask` | `/tasks` |
| `toggleTaskDone` | `/tasks`, `/` (student dashboard progress ring) |
| `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement` | `/feed`, `/` |
| `toggleLike`, `addComment`, `deleteComment` | `/feed` |
| `finalizeMaterial`, `updateMaterial`, `deleteMaterial` | `/materials` |
| `updateProfile`, `setAvatar` | `/profile`, `/` (nav avatar) |

---

## 7. Checklist for User Verification

Before coding begins, please confirm:

- [ ] Split between Server Actions (small JSON mutations) and Route Handlers (file uploads, PDF, auth callback) is acceptable.
- [ ] Students have **no** attendance-writing action — only `toggleTaskDone` (correct by PRD).
- [ ] Admin overrides for feed edit/delete are implemented at both the action layer and the RLS policy.
- [ ] The two-step material upload (route handler → action) is acceptable vs. a single action with streaming.
- [ ] PDF generation via `@react-pdf/renderer` (server) is the preferred approach over a client-only lib like jspdf.
- [ ] Room mappings are cached with tag `room-mappings` and revalidated every 15 minutes via Vercel Cron.
