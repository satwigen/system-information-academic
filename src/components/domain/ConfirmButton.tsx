'use client';

import React, { useState, useTransition } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';

interface Props {
  onConfirm: () => Promise<{ ok: boolean; error?: string }>;
  confirmText?: string;
  label?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  small?: boolean;
}

export default function ConfirmButton({
  onConfirm,
  confirmText = 'Delete',
  label,
  title = 'Confirm delete',
  description = 'This action cannot be undone.',
  icon,
  small,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleConfirm = () => {
    startTransition(async () => {
      const r = await onConfirm();
      if (r.ok) {
        toast('Deleted', 'success');
        setOpen(false);
      } else {
        toast(r.error ?? 'Delete failed', 'error');
      }
    });
  };

  return (
    <>
      {small ? (
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={label ?? 'Delete'}
        >
          {icon ?? <Trash2 className="w-3.5 h-3.5" />}
        </button>
      ) : (
        <Button variant="ghost" onClick={() => setOpen(true)}>
          {icon ?? <Trash2 className="w-4 h-4 text-red-500" />} {label}
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title={title} description={description} maxWidth="max-w-md">
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirm} disabled={pending}>
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
