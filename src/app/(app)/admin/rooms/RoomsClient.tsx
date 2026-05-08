'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Edit2, DoorOpen, MapPin, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Dialog from '@/components/ui/Dialog';
import Badge from '@/components/ui/Badge';
import ConfirmButton from '@/components/domain/ConfirmButton';
import { useToast } from '@/components/ui/Toast';
import { dayShort, formatTime } from '@/lib/time';
import {
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
  createRoomMappingAction,
  deleteRoomMappingAction,
} from '@/actions/rooms';
import type { RoomRow, RoomMappingRow, RoomType, SubjectRow, ClassRow } from '@/types/database';

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'LAB',          label: 'Lab' },
  { value: 'CLASSROOM',    label: 'Classroom' },
  { value: 'AUDITORIUM',   label: 'Auditorium' },
  { value: 'SEMINAR_ROOM', label: 'Seminar Room' },
];

const TYPE_BADGE: Record<RoomType, string> = {
  LAB:          'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  CLASSROOM:    'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  AUDITORIUM:   'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  SEMINAR_ROOM: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
};

interface Props {
  rooms: RoomRow[];
  mappings: RoomMappingRow[];
  subjects: SubjectRow[];
  classes: ClassRow[];
}

export default function RoomsClient({ rooms, mappings, subjects, classes }: Props) {
  const [editingRoom, setEditingRoom] = useState<RoomRow | null>(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [creatingMapping, setCreatingMapping] = useState(false);

  const roomLabel = (id: string) => {
    const r = rooms.find((x) => x.id === id);
    return r ? `${r.name} · ${r.building} · Fl ${r.floor}` : '—';
  };
  const subjectLabel = (id: string) => subjects.find((s) => s.id === id)?.name ?? '—';
  const classLabel = (id: string) => classes.find((c) => c.id === id)?.name ?? '—';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button variant="secondary" onClick={() => setCreatingRoom(true)}>
          <Plus className="w-4 h-4" /> Add Room
        </Button>
        <Button onClick={() => setCreatingMapping(true)}>
          <Plus className="w-4 h-4" /> Add Mapping
        </Button>
      </div>

      {/* Rooms */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Rooms ({rooms.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
        {rooms.map((room) => (
          <Card key={room.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{room.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3" /> {room.building}, Floor {room.floor}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingRoom(room)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <ConfirmButton
                  onConfirm={() => deleteRoomAction(room.id)}
                  title={`Delete ${room.name}?`}
                  description="All mappings that reference this room will cascade-delete."
                  small
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={TYPE_BADGE[room.type]}>{room.type.replace('_', ' ')}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Users className="w-3 h-3" /> Cap {room.capacity}
              </span>
            </div>
            {room.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{room.notes}</p>}
          </Card>
        ))}
      </div>

      {/* Mappings */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Subject-to-Room Mappings ({mappings.length})
      </h2>
      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_0.6fr_0.7fr_auto] px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
          <span>Room</span><span>Subject</span><span>Class</span><span>Day</span><span>Time</span><span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {mappings.map((m) => (
            <div key={m.id} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_0.6fr_0.7fr_auto] gap-2 px-4 md:px-6 py-3 items-center">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{roomLabel(m.room_id)}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{subjectLabel(m.subject_id)}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{classLabel(m.class_id)}</span>
              <Badge>{dayShort(m.day_of_week)}</Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatTime(m.start_time)}–{formatTime(m.end_time)}
              </span>
              <div className="flex justify-end">
                <ConfirmButton onConfirm={() => deleteRoomMappingAction(m.id)} title="Delete mapping?" small />
              </div>
            </div>
          ))}
          {mappings.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No mappings yet. Click &quot;Add Mapping&quot; to create one.
            </p>
          )}
        </div>
      </Card>

      <RoomEditor
        open={creatingRoom}
        onClose={() => setCreatingRoom(false)}
        mode="create"
      />
      <RoomEditor
        open={editingRoom !== null}
        onClose={() => setEditingRoom(null)}
        mode="edit"
        initial={editingRoom ?? undefined}
      />
      <MappingEditor
        open={creatingMapping}
        onClose={() => setCreatingMapping(false)}
        rooms={rooms}
        subjects={subjects}
        classes={classes}
      />
    </div>
  );
}

// ------------- Room editor -------------

function RoomEditor({
  open, onClose, mode, initial,
}: { open: boolean; onClose: () => void; mode: 'create' | 'edit'; initial?: RoomRow }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('1');
  const [capacity, setCapacity] = useState('30');
  const [type, setType] = useState<RoomType>('CLASSROOM');
  const [notes, setNotes] = useState('');
  const [pending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setBuilding(initial?.building ?? '');
      setFloor(String(initial?.floor ?? 1));
      setCapacity(String(initial?.capacity ?? 30));
      setType(initial?.type ?? 'CLASSROOM');
      setNotes(initial?.notes ?? '');
    }
  }, [open, initial]);

  const canSubmit = name && building && floor && capacity;

  const submit = () => {
    startTransition(async () => {
      const payload = {
        name, building, floor: Number(floor), capacity: Number(capacity), type,
        notes: notes || null,
      };
      const r = mode === 'create'
        ? await createRoomAction(payload)
        : await updateRoomAction(initial!.id, payload);
      if (r.ok) { toast('Saved', 'success'); onClose(); }
      else toast(r.error, 'error');
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={mode === 'create' ? 'Add Room' : 'Edit Room'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Lab 1" />
        <Input label="Building" value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="Building A" />
        <Input label="Floor" type="number" value={floor} onChange={(e) => setFloor(e.target.value)} />
        <Input label="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
        <Select label="Type" options={ROOM_TYPES as any} value={type} onChange={(v) => setType(v as RoomType)} />
        <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!canSubmit || pending}>{mode === 'create' ? 'Create' : 'Save'}</Button>
      </div>
    </Dialog>
  );
}

// ------------- Mapping editor -------------

function MappingEditor({
  open, onClose, rooms, subjects, classes,
}: {
  open: boolean; onClose: () => void;
  rooms: RoomRow[]; subjects: SubjectRow[]; classes: ClassRow[];
}) {
  const { toast } = useToast();
  const [roomId, setRoomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [day, setDay] = useState('1');
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('10:00');
  const [pending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setRoomId(''); setSubjectId(''); setClassId(''); setDay('1');
      setStart('08:00'); setEnd('10:00');
    }
  }, [open]);

  const canSubmit = roomId && subjectId && classId && start < end;

  const submit = () => {
    startTransition(async () => {
      const r = await createRoomMappingAction({
        room_id: roomId, subject_id: subjectId, class_id: classId,
        day_of_week: Number(day),
        start_time: start.length === 5 ? start + ':00' : start,
        end_time: end.length === 5 ? end + ':00' : end,
      });
      if (r.ok) { toast('Mapping created', 'success'); onClose(); }
      else toast(r.error, 'error');
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Mapping" description="Assign a subject/class to a room + time slot.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Room"
          options={rooms.map((r) => ({ value: r.id, label: `${r.name} · ${r.building} · Fl ${r.floor}` }))}
          value={roomId} onChange={setRoomId} placeholder="Select room"
        />
        <Select
          label="Subject"
          options={subjects.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))}
          value={subjectId} onChange={setSubjectId} placeholder="Select subject"
        />
        <Select
          label="Class"
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
          value={classId} onChange={setClassId} placeholder="Select class"
        />
        <Select
          label="Day"
          options={[0, 1, 2, 3, 4, 5, 6].map((i) => ({ value: String(i), label: dayShort(i) }))}
          value={day} onChange={setDay}
        />
        <Input label="Start Time" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        <Input label="End Time" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!canSubmit || pending}>Create</Button>
      </div>
    </Dialog>
  );
}
