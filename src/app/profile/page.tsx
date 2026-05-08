'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, Mail, Phone, MapPin, User as UserIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ClientOnly from '@/components/ui/ClientOnly';
import { useAuth } from '@/context/AuthContext';
import { getRoleBadgeColor, getRoleLabel } from '@/lib/utils';

export default function ProfilePage() {
  const { user, role, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user.profile.fullName);
  const [phone, setPhone] = useState(user.profile.phone ?? '');
  const [address, setAddress] = useState(user.profile.address ?? '');
  const [bio, setBio] = useState(user.profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.profile.avatarUrl ?? '');
  const [saved, setSaved] = useState(false);

  // Sync local state when switching roles.
  useEffect(() => {
    setFullName(user.profile.fullName);
    setPhone(user.profile.phone ?? '');
    setAddress(user.profile.address ?? '');
    setBio(user.profile.bio ?? '');
    setAvatarUrl(user.profile.avatarUrl ?? '');
    setSaved(false);
  }, [user.id]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const onPickImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({ fullName, phone, address, bio, avatarUrl });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <Header title="Profile" description="Manage your personal information.">
        <Badge className={getRoleBadgeColor(role)}>{getRoleLabel(role)}</Badge>
      </Header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Avatar column */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <ClientOnly
                fallback={<Avatar name={fullName} src={undefined} size="xl" />}
              >
                <Avatar name={fullName} src={avatarUrl || undefined} size="xl" />
              </ClientOnly>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
                aria-label="Upload avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickImage(f);
                }}
              />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{fullName || 'Your Name'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <Badge className={`mt-2 ${getRoleBadgeColor(role)}`}>{getRoleLabel(role)}</Badge>
          </div>
        </Card>

        {/* Details column */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field icon={<UserIcon className="w-4 h-4" />} label="Full Name" value={fullName} onChange={setFullName} />
            <Field icon={<Mail className="w-4 h-4" />}      label="Email"     value={user.email} onChange={() => {}} disabled />
            <Field icon={<Phone className="w-4 h-4" />}     label="Phone"     value={phone} onChange={setPhone} placeholder="+62 812-3456-7890" />
            <Field icon={<MapPin className="w-4 h-4" />}    label="Address"   value={address} onChange={setAddress} placeholder="Street, City" />
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full mt-1.5 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="A short bio..."
            />
          </div>

          <div className="flex items-center gap-3 mt-5">
            <Button variant="primary" onClick={handleSave}>
              <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({
  icon, label, value, onChange, placeholder, disabled,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}
