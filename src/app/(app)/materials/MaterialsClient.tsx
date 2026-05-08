'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { FileText, Download, Plus, Video, Link as LinkIcon, FileCode, Upload, Trash2, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Dialog from '@/components/ui/Dialog';
import ClientOnly from '@/components/ui/ClientOnly';
import { useToast } from '@/components/ui/Toast';
import { formatRelative, todayJakarta } from '@/lib/time';
import { formatFileSize } from '@/lib/utils';
import { finalizeMaterialAction, deleteMaterialAction } from '@/actions/materials';
import type { MaterialRow, MaterialType, ClassRow, SubjectRow, UserRole } from '@/types/database';

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

const TYPE_OPTIONS = [
  { value: 'PDF',      label: 'PDF' },
  { value: 'SLIDE',    label: 'Slide' },
  { value: 'VIDEO',    label: 'Video' },
  { value: 'LINK',     label: 'Link' },
  { value: 'DOCUMENT', label: 'Document' },
] as { value: MaterialType; label: string }[];

interface Props {
  materials: MaterialRow[];
  classes: ClassRow[];
  subjects: SubjectRow[];
  role: UserRole;
  userId: string;
}

export default function MaterialsClient({ materials, classes, subjects, role, userId }: Props) {
  const { toast } = useToast();
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(
    () =>
      materials.filter(
        (m) =>
          (!filterClass || m.class_id === filterClass) &&
          (!filterSubject || m.subject_id === filterSubject),
      ),
    [materials, filterClass, filterSubject],
  );

  const canUpload = role === 'DOSEN' || role === 'ADMIN';

  const handleDownload = (id: string) => {
    window.open(`/api/materials/${id}/download`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    const r = await deleteMaterialAction(id);
    if (r.ok) toast('Material deleted', 'success');
    else toast(r.error, 'error');
  };

  return (
    <div>
      <Card className="mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <Select
            label="Filter by Class"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
            value={filterClass}
            onChange={setFilterClass}
            placeholder="All Classes"
            className="min-w-[200px]"
          />
          <Select
            label="Filter by Subject"
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            value={filterSubject}
            onChange={setFilterSubject}
            placeholder="All Subjects"
            className="min-w-[220px]"
          />
          {canUpload && (
            <div className="ml-auto">
              <Button onClick={() => setUploadOpen(true)}>
                <Plus className="w-4 h-4" /> Upload Material
              </Button>
            </div>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-sm text-slate-500 dark:text-slate-400">No materials yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((m) => {
            const subject = subjects.find((s) => s.id === m.subject_id);
            const cls = classes.find((c) => c.id === m.class_id);
            const canDelete = m.uploaded_by_id === userId || role === 'ADMIN';
            return (
              <Card key={m.id}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TYPE_COLOR[m.file_type]} flex items-center justify-center text-white shadow-md`}>
                    {TYPE_ICON[m.file_type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{m.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {subject?.name ?? 'Subject'} · {cls?.name ?? 'Class'}
                    </p>
                  </div>
                </div>
                {m.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">{m.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Badge>{m.file_type}</Badge>
                    {m.file_size_bytes != null && (
                      <span className="text-xs text-slate-400">{formatFileSize(m.file_size_bytes)}</span>
                    )}
                  </div>
                  <ClientOnly fallback={<span className="text-xs text-slate-400">&nbsp;</span>}>
                    <span className="text-xs text-slate-400">{formatRelative(m.created_at)}</span>
                  </ClientOnly>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="secondary" className="flex-1" onClick={() => handleDownload(m.id)}>
                    <Download className="w-4 h-4" /> Download
                  </Button>
                  {canDelete && (
                    <Button variant="ghost" onClick={() => handleDelete(m.id)} aria-label="Delete">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        classes={classes}
        subjects={subjects}
      />
    </div>
  );
}

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  classes: ClassRow[];
  subjects: SubjectRow[];
}

function UploadDialog({ open, onClose, classes, subjects }: UploadDialogProps) {
  const { toast } = useToast();
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<MaterialType>('PDF');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setClassId(''); setSubjectId(''); setSessionDate(''); setTitle(''); setDescription('');
    setFileType('PDF'); setFile(null); setProgress(0); setUploading(false);
  };

  React.useEffect(() => {
    if (open && !sessionDate) setSessionDate(todayJakarta());
  }, [open, sessionDate]);

  const canSubmit = classId && subjectId && sessionDate && title && file;

  const submit = () => {
    if (!canSubmit || !file) return;
    if (file.size > 52_428_800) {
      toast('File exceeds 50 MB', 'error');
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('class_id', classId);
    fd.append('subject_id', subjectId);
    fd.append('session_date', sessionDate);
    fd.append('title', title);
    fd.append('description', description);
    fd.append('file_type', fileType);
    fd.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/materials/upload');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = async () => {
      setUploading(false);
      try {
        const body = JSON.parse(xhr.responseText);
        if (!body.ok) {
          toast(body.error ?? 'Upload failed', 'error');
          return;
        }
        // Finalize: insert the DB row.
        const finalize = await finalizeMaterialAction({
          class_id: classId,
          subject_id: subjectId,
          session_date: sessionDate,
          title,
          description: description || null,
          file_path: body.data.filePath,
          file_size_bytes: body.data.fileSize,
          mime_type: body.data.mimeType,
          file_type: fileType,
        });
        if (!finalize.ok) {
          toast(finalize.error, 'error');
          return;
        }
        toast('Material uploaded', 'success');
        reset();
        onClose();
      } catch {
        toast('Upload failed', 'error');
      }
    };
    xhr.onerror = () => { setUploading(false); toast('Network error', 'error'); };
    xhr.send(fd);
  };

  return (
    <Dialog
      open={open}
      onClose={() => { if (!uploading) { reset(); onClose(); } }}
      title="Upload Material"
      description="Max 50 MB. Materials are linked to a class + date."
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Class"
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
          value={classId} onChange={setClassId} placeholder="Select class"
        />
        <Select
          label="Subject"
          options={subjects.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))}
          value={subjectId} onChange={setSubjectId} placeholder="Select subject"
        />
        <Input label="Session Date" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
        <Select
          label="Type"
          options={TYPE_OPTIONS as any}
          value={fileType} onChange={(v) => setFileType(v as MaterialType)}
        />
        <div className="md:col-span-2">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Week 5 — React Hooks" />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3} placeholder="Short summary (optional)"
            className="w-full mt-1.5 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
            File (max 50 MB)
          </label>
          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-400 transition-colors">
            <Upload className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {file ? file.name : 'Click to choose a file'}
            </span>
            {file && <span className="ml-auto text-xs text-slate-500">{formatFileSize(file.size)}</span>}
            <input
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      {uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={() => { if (!uploading) { reset(); onClose(); } }} disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!canSubmit || uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </Dialog>
  );
}
