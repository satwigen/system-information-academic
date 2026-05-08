'use client';

import React, { useState, useRef, useTransition } from 'react';
import { Camera, Save, Mail, Phone, MapPin, User as UserIcon, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import ClientOnly from '@/components/ui/ClientOnly';
import { useToast } from '@/components/ui/Toast';
import { roleBadgeColor, roleLabel } from '@/lib/rbac';
import { updateProfileAction, setAvatarAction } from '@/actions/profile';
import type { ProfileRow } from '@/types/database';

interface Props {
  profile: ProfileRow;
}

export default function ProfileForm({ profile }: Props) {
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [address, setAddress] = useState(profile.address ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onPickAvatar = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast('Avatar exceeds 5 MB', 'error');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/avatars/upload', { method: 'POST', body: fd });
      const body = await res.json();
      if (!body.ok) {
        toast(body.error ?? 'Upload failed', 'error');
        return;
      }
      // Persist path -> profile.
      const result = await setAvatarAction({ path: body.data.path });
      if (!result.ok) {
        toast(result.error, 'error');
        return;
      }
      setAvatarUrl(result.data.avatar_url);
      toast('Avatar updated', 'success');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfileAction({ full_name: fullName, phone, address, bio });
      if (result.ok) toast('Profile saved', 'success');
      else toast(result.error, 'error');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <Card className="lg:col-span-1">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <ClientOnly fallback={<Avatar name={fullName} size="xl" />}>
              <Avatar name={fullName} src={avatarUrl} size="xl" />
            </ClientOnly>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
              aria-label="Upload avatar"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onPickAvatar(f); }}
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{fullName || 'Your Name'}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
          <Badge className={`mt-2 ${roleBadgeColor(profile.role)}`}>{roleLabel(profile.role)}</Badge>
          {profile.nim && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">NIM: {profile.nim}</p>
          )}
          {profile.nip && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">NIP: {profile.nip}</p>
          )}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input icon={<UserIcon className="w-3.5 h-3.5" />} label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={profile.email} disabled />
          <Input icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 812-3456-7890" />
          <Input icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City" />
        </div>
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="A short bio..."
            className="w-full mt-1.5 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <div className="flex items-center gap-3 mt-5">
          <Button onClick={handleSave} disabled={pending}>
            <Save className="w-4 h-4" /> {pending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
