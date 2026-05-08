'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, Plus, Trash2, Shield, MapPin, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Room, RoomType } from '@/lib/types';
import { getRoleBadgeColor } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

export default function AdminRoomsPage() {
  const { role } = useAuth();
  const {
    rooms,
    roomMappings,
    subjects,
    classes,
    departments,
    addRoom,
    deleteRoom,
    addRoomMapping,
    deleteRoomMapping,
  } = useData();

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddMapping, setShowAddMapping] = useState(false);

  if (role !== 'ADMIN') {
    return (
      <div>
        <Header title="Room Mapping" description="Admin access required." />
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Admin Access Required</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Switch to the Admin role to manage room mappings.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const getRoomName = (id: string) => {
    const r = rooms.find((x) => x.id === id);
    return r ? `${r.name} · ${r.building} · Fl ${r.floor}` : '—';
  };
  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? '—';
  const getClassName = (id: string) => classes.find((c) => c.id === id)?.name ?? '—';

  return (
    <div>
      <Header title="Room Mapping System" description="Assign subjects to specific rooms, buildings, and time slots.">
        <Badge className={getRoleBadgeColor('ADMIN')}>Admin Only</Badge>
        <Button variant="secondary" onClick={() => setShowAddRoom((v) => !v)}>
          <Plus className="w-4 h-4" /> Add Room
        </Button>
        <Button variant="primary" onClick={() => setShowAddMapping((v) => !v)}>
          <Plus className="w-4 h-4" /> Add Mapping
        </Button>
      </Header>

      <AnimatePresence>
        {showAddRoom && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <AddRoomForm onDone={() => setShowAddRoom(false)} onSubmit={(r) => addRoom(r)} />
          </motion.div>
        )}
        {showAddMapping && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <AddMappingForm
              onDone={() => setShowAddMapping(false)}
              onSubmit={(m) => addRoomMapping(m)}
              rooms={rooms}
              subjects={subjects}
              classes={classes}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rooms grid */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Rooms ({rooms.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {rooms.map((room) => (
          <Card key={room.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md">
                  <DoorOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{room.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {room.building}, Floor {room.floor}
                  </p>
                </div>
              </div>
              <button onClick={() => deleteRoom(room.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" aria-label="Delete room">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge className={TYPE_BADGE[room.type]}>{room.type.replace('_', ' ')}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Users className="w-3 h-3" /> Cap {room.capacity}
              </span>
            </div>
            {room.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{room.notes}</p>}
          </Card>
        ))}
      </div>

      {/* Mappings table */}
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Subject-to-Room Mappings ({roomMappings.length})</h2>
      <Card className="p-0 overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.6fr_0.4fr] px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
          <span>Room</span><span>Subject</span><span>Class</span><span>Day</span><span>Time</span><span></span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {roomMappings.map((m) => (
            <div key={m.id} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_0.8fr_0.6fr_0.4fr] gap-2 px-4 md:px-6 py-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{getRoomName(m.roomId)}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{getSubjectName(m.subjectId)}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{getClassName(m.classId)}</span>
              <Badge>{DAYS[m.dayOfWeek]}</Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">{m.startTime}–{m.endTime}</span>
              <div className="flex justify-end">
                <button onClick={() => deleteRoomMapping(m.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {roomMappings.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No mappings yet. Click "Add Mapping" to create one.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

// =====================================================================
// Sub-forms
// =====================================================================

function AddRoomForm({ onDone, onSubmit }: { onDone: () => void; onSubmit: (r: Omit<Room, 'id'>) => void }) {
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('1');
  const [capacity, setCapacity] = useState('30');
  const [type, setType] = useState<RoomType>('CLASSROOM');
  const [notes, setNotes] = useState('');

  const canSubmit = name && building && floor && capacity;

  return (
    <Card className="mb-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Add Room</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Name"     value={name}     onChange={setName}     placeholder="e.g., Lab 1" />
        <Field label="Building" value={building} onChange={setBuilding} placeholder="e.g., Building A" />
        <Field label="Floor"    value={floor}    onChange={setFloor}    placeholder="2" type="number" />
        <Field label="Capacity" value={capacity} onChange={setCapacity} placeholder="30" type="number" />
        <Select label="Type" options={ROOM_TYPES.map((t) => ({ value: t.value, label: t.label }))} value={type} onChange={(v) => setType(v as RoomType)} />
        <Field label="Notes (optional)" value={notes} onChange={setNotes} placeholder="Short description" />
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          variant="primary"
          disabled={!canSubmit}
          onClick={() => {
            onSubmit({ name, building, floor: Number(floor), capacity: Number(capacity), type, notes });
            onDone();
          }}
        >
          Save Room
        </Button>
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
      </div>
    </Card>
  );
}

function AddMappingForm({
  onDone, onSubmit, rooms, subjects, classes,
}: {
  onDone: () => void;
  onSubmit: (m: { roomId: string; subjectId: string; classId: string; dayOfWeek: number; startTime: string; endTime: string }) => void;
  rooms: any[]; subjects: any[]; classes: any[];
}) {
  const [roomId, setRoomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [day, setDay] = useState('1');
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('10:00');

  const canSubmit = roomId && subjectId && classId;

  return (
    <Card className="mb-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Add Mapping</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select label="Room"    options={rooms.map((r: Room) => ({ value: r.id, label: `${r.name} · ${r.building}` }))} value={roomId} onChange={setRoomId} placeholder="Select room" />
        <Select label="Subject" options={subjects.map((s: any) => ({ value: s.id, label: s.name }))}                     value={subjectId} onChange={setSubjectId} placeholder="Select subject" />
        <Select label="Class"   options={classes.map((c: any) => ({ value: c.id, label: c.name }))}                       value={classId} onChange={setClassId} placeholder="Select class" />
        <Select label="Day"     options={DAYS.map((d, i) => ({ value: String(i), label: d }))}                           value={day} onChange={setDay} />
        <Field  label="Start Time" value={start} onChange={setStart} type="time" />
        <Field  label="End Time"   value={end}   onChange={setEnd}   type="time" />
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          variant="primary"
          disabled={!canSubmit}
          onClick={() => {
            onSubmit({ roomId, subjectId, classId, dayOfWeek: Number(day), startTime: start, endTime: end });
            onDone();
          }}
        >
          Save Mapping
        </Button>
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
      </div>
    </Card>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
}
