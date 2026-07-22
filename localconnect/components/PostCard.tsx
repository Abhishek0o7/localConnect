"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TAG_STYLES, type PostWithMeta } from "@/lib/types/db";

export default function PostCard({
  post,
  me,
  isFriend,
  isOwner,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onDeletePost,
}: {
  post: PostWithMeta;
  me: string | null;
  isFriend: boolean;
  isOwner: boolean;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => void;
  onDeletePost: (postId: string) => void;
}) {
  const router = useRouter();
  const tag = TAG_STYLES[post.tag];
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSubmitComment() {
    const content = draft.trim();
    if (!content) return;
    setPosting(true);
    await onAddComment(post.id, content);
    setPosting(false);
    setDraft("");
  }

  return (
    <div className="bg-white border border-hairline rounded-card p-4">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold font-display flex-shrink-0"
          style={{ background: post.author.avatar_bg, color: post.author.avatar_fg }}
        >
          {post.author.initials}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium font-display text-ink">{post.author.name}</div>
          <div className="text-[11px] text-muted mt-0.5 flex gap-1.5 items-center">
            {timeAgo(post.created_at)}
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-lg"
              style={{ background: tag.bg, color: tag.col }}
            >
              {tag.label}
            </span>
          </div>
        </div>

        {isOwner &&
          (confirmingDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onDeletePost(post.id)}
                className="text-[11px] text-white bg-red border-none rounded-full px-2.5 py-1 font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-[11px] text-muted bg-transparent border-none"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="text-muted bg-transparent border-none p-1"
              aria-label="Delete post"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
          ))}
      </div>

      <div className="text-sm text-ink leading-relaxed mb-3">{post.content}</div>

      <div className="flex gap-4 items-center">
        <button
          onClick={() => onToggleLike(post.id)}
          className={`flex items-center gap-1.5 text-xs bg-transparent border-none ${
            post.liked_by_me ? "text-red" : "text-muted"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={post.liked_by_me ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <span>{post.like_count}</span>
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 text-xs text-muted bg-transparent border-none"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {post.comment_count}
        </button>
        {isFriend && (
          <button
            onClick={() => router.push(`/chat/${post.author.id}`)}
            className="ml-auto text-xs text-muted bg-transparent border-none"
          >
            Reply in chat →
          </button>
        )}
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-t border-hairline flex flex-col gap-2.5">
          {post.comments.length === 0 && (
            <p className="text-xs text-muted">No comments yet — be the first to reply.</p>
          )}
          {post.comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold font-display flex-shrink-0"
                style={{ background: c.author.avatar_bg, color: c.author.avatar_fg }}
              >
                {c.author.initials}
              </div>
              <div className="flex-1 bg-[#f7f7fb] rounded-xl px-3 py-2">
                <div className="text-[11px] font-medium text-ink font-display">{c.author.name}</div>
                <div className="text-xs text-ink mt-0.5 leading-relaxed">{c.content}</div>
              </div>
              {c.author_id === me && (
                <button
                  onClick={() => onDeleteComment(post.id, c.id)}
                  className="text-muted bg-transparent border-none text-[11px] mt-1.5"
                  aria-label="Delete comment"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <div className="flex gap-2 items-center mt-1">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              placeholder="Write a comment…"
              className="flex-1 bg-primary-light border-none rounded-full px-3.5 py-2 text-xs outline-none text-ink"
            />
            <button
              onClick={handleSubmitComment}
              disabled={posting || !draft.trim()}
              className="bg-primary text-white border-none rounded-full px-3.5 py-2 text-xs font-medium disabled:opacity-60"
            >
              {posting ? "…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
