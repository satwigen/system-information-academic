'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Heart, MessageCircle, Send, Pin, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Dialog from '@/components/ui/Dialog';
import ClientOnly from '@/components/ui/ClientOnly';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/time';
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  toggleLikeAction,
  addCommentAction,
  deleteCommentAction,
} from '@/actions/feed';
import type { AnnouncementRow, CommentRow, LikeRow } from '@/types/database';

interface AuthorLite {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

interface Props {
  announcements: AnnouncementRow[];
  comments: CommentRow[];
  likes: LikeRow[];
  authors: AuthorLite[];
  currentUserId: string;
  canPost: boolean;
  isAdmin: boolean;
}

export default function FeedClient({
  announcements, comments, likes, authors, currentUserId, canPost, isAdmin,
}: Props) {
  const { toast } = useToast();
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementRow | null>(null);

  const authorById = (id: string) => authors.find((a) => a.id === id);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    (async () => {
      const r = await deleteAnnouncementAction(id);
      if (r.ok) toast('Announcement deleted', 'success');
      else toast(r.error, 'error');
    })();
  };

  return (
    <div>
      {canPost && (
        <div className="mb-6">
          <Button onClick={() => setComposerOpen(true)}>
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>
      )}

      <div className="space-y-4 max-w-3xl">
        {announcements.map((a) => {
          const author = authorById(a.author_id);
          const postLikes = likes.filter((l) => l.announcement_id === a.id);
          const postComments = comments.filter((c) => c.announcement_id === a.id);
          const iLiked = postLikes.some((l) => l.user_id === currentUserId);
          const canEdit = a.author_id === currentUserId || isAdmin;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div className="flex items-start gap-3">
                  <Avatar name={author?.full_name ?? 'User'} src={author?.avatar_url} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {author?.full_name ?? 'User'}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400">· {author?.role}</span>
                      <ClientOnly fallback={<span className="text-xs text-slate-400">·</span>}>
                        <span className="text-xs text-slate-400">· {formatRelative(a.created_at)}</span>
                      </ClientOnly>
                      {a.pinned && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                          <Pin className="w-3 h-3 mr-1" /> Pinned
                        </Badge>
                      )}
                      {isAdmin && a.author_id !== currentUserId && (
                        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                          <Shield className="w-3 h-3 mr-1" /> Admin override
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-2">{a.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">{a.body}</p>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <LikeButton announcementId={a.id} liked={iLiked} count={postLikes.length} />
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400">
                        <MessageCircle className="w-4 h-4" /> {postComments.length}
                      </div>
                      {canEdit && (
                        <div className="ml-auto flex items-center gap-1">
                          <button onClick={() => setEditing(a)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {postComments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {postComments.map((c) => {
                          const cAuthor = authorById(c.user_id);
                          const canDelComment = c.user_id === currentUserId || isAdmin;
                          return (
                            <div key={c.id} className="flex items-start gap-2">
                              <Avatar name={cAuthor?.full_name ?? 'User'} src={cAuthor?.avatar_url} size="xs" />
                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{cAuthor?.full_name ?? 'User'}</p>
                                  {canDelComment && (
                                    <button
                                      onClick={async () => {
                                        const r = await deleteCommentAction(c.id);
                                        if (!r.ok) toast(r.error, 'error');
                                      }}
                                      className="text-slate-400 hover:text-red-500"
                                      aria-label="Delete comment"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300">{c.body}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <CommentInput announcementId={a.id} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <ComposerDialog
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        mode="create"
      />
      <ComposerDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        mode="edit"
        initial={editing ?? undefined}
      />
    </div>
  );
}

function LikeButton({ announcementId, liked, count }: { announcementId: string; liked: boolean; count: number }) {
  const [optimistic, setOptimistic] = useState({ liked, count });
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        setOptimistic((p) => ({ liked: !p.liked, count: p.count + (p.liked ? -1 : 1) }));
        startTransition(async () => {
          await toggleLikeAction(announcementId);
        });
      }}
      disabled={pending}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
        optimistic.liked
          ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
      )}
    >
      <Heart className={cn('w-4 h-4', optimistic.liked && 'fill-current')} />
      {optimistic.count}
    </button>
  );
}

function CommentInput({ announcementId }: { announcementId: string }) {
  const { toast } = useToast();
  const [value, setValue] = useState('');
  const [pending, startTransition] = useTransition();

  const send = () => {
    const body = value.trim();
    if (!body) return;
    setValue('');
    startTransition(async () => {
      const r = await addCommentAction({ announcement_id: announcementId, body });
      if (!r.ok) toast(r.error, 'error');
    });
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
        placeholder="Write a comment..."
        className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={send}
        disabled={pending || !value.trim()}
        className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        aria-label="Send comment"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ComposerProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initial?: AnnouncementRow;
}

function ComposerDialog({ open, onClose, mode, initial }: ComposerProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [pending, startTransition] = useTransition();

  React.useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setBody(initial?.body ?? '');
      setPinned(initial?.pinned ?? false);
    }
  }, [open, initial]);

  const canSubmit = title.trim() && body.trim();

  const submit = () => {
    if (!canSubmit) return;
    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createAnnouncementAction({ title, body, pinned })
          : await updateAnnouncementAction(initial!.id, { title, body, pinned });
      if (result.ok) {
        toast(mode === 'create' ? 'Posted' : 'Updated', 'success');
        onClose();
      } else {
        toast(result.error, 'error');
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={mode === 'create' ? 'New Post' : 'Edit Post'} maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Write your announcement..."
            className="w-full mt-1.5 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
          Pinned
        </label>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!canSubmit || pending}>{mode === 'create' ? 'Publish' : 'Save'}</Button>
      </div>
    </Dialog>
  );
}
