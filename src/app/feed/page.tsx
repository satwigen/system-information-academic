'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Heart, MessageCircle, Send, Pin, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ClientOnly from '@/components/ui/ClientOnly';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { cn, formatRelative, getRoleLabel } from '@/lib/utils';

export default function FeedPage() {
  const { user, role, allUsers } = useAuth();
  const { announcements, likes, comments, toggleLike, addComment, addAnnouncement, students } = useData();

  const [showCompose, setShowCompose] = useState(false);
  const canPost = role === 'ADMIN' || role === 'HEAD' || role === 'DOSEN';

  const getAuthor = (id: string) => {
    const found = allUsers.find((u) => u.id === id);
    if (found) return { name: found.profile.fullName, role: getRoleLabel(found.role) };
    const stu = students.find((s) => s.id === id);
    if (stu) return { name: stu.name, role: 'Student' };
    return { name: 'Unknown', role: '' };
  };

  return (
    <div>
      <Header title="Feed" description="Announcements and class-wide updates.">
        {canPost && (
          <Button variant="primary" onClick={() => setShowCompose((v) => !v)}>
            <Plus className="w-4 h-4" /> New Post
          </Button>
        )}
      </Header>

      {showCompose && canPost && (
        <ComposeForm
          onDone={() => setShowCompose(false)}
          onSubmit={(title, body) => addAnnouncement({ authorId: user.id, title, body, pinned: false })}
        />
      )}

      <div className="space-y-4 max-w-3xl">
        {announcements.map((a) => {
          const author = getAuthor(a.authorId);
          const postLikes = likes.filter((l) => l.announcementId === a.id);
          const postComments = comments.filter((c) => c.announcementId === a.id);
          const iLiked = postLikes.some((l) => l.userId === user.id);

          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div className="flex items-start gap-3">
                  <Avatar name={author.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{author.name}</h3>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{author.role}</span>
                      <ClientOnly fallback={<span className="text-xs text-slate-400">·</span>}>
                        <span className="text-xs text-slate-400">· {formatRelative(a.createdAt)}</span>
                      </ClientOnly>
                      {a.pinned && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                          <Pin className="w-3 h-3 mr-1" /> Pinned
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white mt-2">{a.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">{a.body}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => toggleLike(a.id, user.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
                          iLiked
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                      >
                        <Heart className={cn('w-4 h-4', iLiked && 'fill-current')} />
                        {postLikes.length}
                      </button>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400">
                        <MessageCircle className="w-4 h-4" />
                        {postComments.length}
                      </div>
                    </div>

                    {/* Comments */}
                    {postComments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {postComments.map((c) => {
                          const cAuthor = getAuthor(c.userId);
                          return (
                            <div key={c.id} className="flex items-start gap-2">
                              <Avatar name={cAuthor.name} size="xs" />
                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
                                <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{cAuthor.name}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-300">{c.body}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <CommentInput onSend={(body) => addComment(a.id, user.id, body)} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ComposeForm({ onDone, onSubmit }: { onDone: () => void; onSubmit: (title: string, body: string) => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  return (
    <Card className="mb-6 max-w-3xl">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">New Post</h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your announcement..."
        rows={3}
        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      <div className="flex gap-2 mt-3">
        <Button
          variant="primary"
          disabled={!title || !body}
          onClick={() => {
            onSubmit(title, body);
            onDone();
          }}
        >
          Publish
        </Button>
        <Button variant="secondary" onClick={onDone}>Cancel</Button>
      </div>
    </Card>
  );
}

function CommentInput({ onSend }: { onSend: (body: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex items-center gap-2 mt-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            onSend(value.trim());
            setValue('');
          }
        }}
        placeholder="Write a comment..."
        className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        onClick={() => {
          if (value.trim()) {
            onSend(value.trim());
            setValue('');
          }
        }}
        className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        disabled={!value.trim()}
        aria-label="Send comment"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
