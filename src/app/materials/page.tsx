'use client';

import React, { useMemo, useState } from 'react';
import { FileText, Download, Plus, Video, Link as LinkIcon, FileCode } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import ClientOnly from '@/components/ui/ClientOnly';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { MaterialType } from '@/lib/types';
import { formatRelative } from '@/lib/utils';

const TYPE_ICON: Record<MaterialType, React.ReactNode> = {
  PDF:      <FileText className="w-5 h-5" />,
  SLIDE:    <FileCode className="w-5 h-5" />,
  VIDEO:    <Video className="w-5 h-5" />,
  LINK:     <LinkIcon className="w-5 h-5" />,
  DOCUMENT: <FileText className="w-5 h-5" />,
};

const TYPE_COLOR: Record<MaterialType, string> = {
  PDF:      'from-red-500 to-rose-500',
  SLIDE:    'from-amber-500 to-orange-500',
  VIDEO:    'from-violet-500 to-fuchsia-500',
  LINK:     'from-sky-500 to-cyan-500',
  DOCUMENT: 'from-indigo-500 to-blue-500',
};

const TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'PDF',      label: 'PDF' },
  { value: 'SLIDE',    label: 'Slide' },
  { value: 'VIDEO',    label: 'Video' },
  { value: 'LINK',     label: 'Link' },
  { value: 'DOCUMENT', label: 'Document' },
];

export default function MaterialsPage() {
  const { role, user } = useAuth();
  const { materials, subjects, addMaterial } = useData();
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const filtered = useMemo(
    () => (subjectFilter ? materials.filter((m) => m.subjectId === subjectFilter) : materials),
    [materials, subjectFilter]
  );

  const canUpload = role === 'DOSEN' || role === 'ADMIN';

  return (
    <div>
      <Header title="Materials" description="Browse and download learning materials.">
        {canUpload && (
          <Button variant="primary" onClick={() => setShowUpload((v) => !v)}>
            <Plus className="w-4 h-4" /> Upload Material
          </Button>
        )}
      </Header>

      <Card className="mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <Select
            label="Filter by Subject"
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            value={subjectFilter}
            onChange={setSubjectFilter}
            placeholder="All Subjects"
            className="min-w-[240px]"
          />
        </div>
      </Card>

      {showUpload && canUpload && (
        <UploadForm
          subjects={subjects}
          onDone={() => setShowUpload(false)}
          onSubmit={(m) => addMaterial({ ...m, uploadedById: user.id })}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((m) => (
          <Card key={m.id} hover>
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TYPE_COLOR[m.fileType]} flex items-center justify-center text-white shadow-md`}>
                {TYPE_ICON[m.fileType]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{m.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {subjects.find((s) => s.id === m.subjectId)?.name ?? 'Unknown subject'}
                </p>
              </div>
            </div>
            {m.description && <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">{m.description}</p>}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <Badge>{m.fileType}</Badge>
              <ClientOnly fallback={<span className="text-xs text-slate-400">&nbsp;</span>}>
                <span className="text-xs text-slate-400">{formatRelative(m.createdAt)}</span>
              </ClientOnly>
            </div>
            <Button variant="secondary" className="w-full mt-3" onClick={() => alert('Demo: would download / open ' + m.fileUrl)}>
              <Download className="w-4 h-4" /> {m.fileType === 'LINK' ? 'Open Link' : 'Download'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function UploadForm({
  subjects, onDone, onSubmit,
}: {
  subjects: any[];
  onDone: () => void;
  onSubmit: (m: { subjectId: string; title: string; description: string; fileUrl: string; fileType: MaterialType }) => void;
}) {
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState<MaterialType>('PDF');

  const canSubmit = subjectId && title && fileUrl;

  return (
    <Card className="mb-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Upload New Material</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Subject"   options={subjects.map((s) => ({ value: s.id, label: s.name }))} value={subjectId} onChange={setSubjectId} placeholder="Select subject" />
        <Select label="Type"      options={TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))} value={fileType} onChange={(v) => setFileType(v as MaterialType)} />
        <Input  label="Title"     value={title}       onChange={setTitle}       placeholder="e.g., Week 5 — React Hooks" />
        <Input  label="File URL"  value={fileUrl}     onChange={setFileUrl}     placeholder="/files/react-hooks.pdf or https://..." />
        <div className="md:col-span-2">
          <Input label="Description (optional)" value={description} onChange={setDescription} placeholder="Short summary" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          variant="primary"
          disabled={!canSubmit}
          onClick={() => {
            onSubmit({ subjectId, title, description, fileUrl, fileType });
            onDone();
          }}
        >
          Upload
        </Button>
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
      </div>
    </Card>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
