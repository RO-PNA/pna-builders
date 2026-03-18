'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase/client';

interface Comment {
    id: number;
    created_at: string;
    item_id: number;
    user_id: string;
    author_name: string;
    content: string;
}

export default function CommentSection({ itemId }: { itemId: number }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        const res = await fetch(`/api/comments?itemId=${itemId}`);
        if (res.ok) {
            setComments(await res.json());
        }
    }, [itemId]);

    useEffect(() => {
        fetchComments();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserId(user?.id ?? null);
        });
    }, [fetchComments]);

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setLoading(true);
        const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId, content }),
        });
        if (res.ok) {
            setContent('');
            await fetchComments();
        }
        setLoading(false);
    };

    const handleDelete = async (commentId: number) => {
        const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
        if (res.ok) {
            await fetchComments();
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return '방금';
        if (mins < 60) return `${mins}분 전`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}시간 전`;
        const days = Math.floor(hours / 24);
        return `${days}일 전`;
    };

    return (
        <section className="mt-6 border-t pt-4" style={{ borderColor: 'var(--border-light)' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                댓글 {comments.length > 0 && <span style={{ color: 'var(--text-muted)' }}>{comments.length}</span>}
            </h2>

            {/* Comment list */}
            {comments.length > 0 && (
                <ul className="space-y-3 mb-4">
                    {comments.map((c) => (
                        <li key={c.id} className="text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {c.author_name}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {timeAgo(c.created_at)}
                                </span>
                                {userId === c.user_id && (
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="text-xs hover:underline"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                            <p className="mt-0.5 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                                {c.content}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            {/* Comment form */}
            {userId ? (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit();
                        }}
                        placeholder="댓글을 입력하세요"
                        className="flex-1 text-sm rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-orange-400"
                        style={{
                            background: 'var(--surface)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-default)',
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !content.trim()}
                        className="text-sm px-3 py-2 rounded-lg font-medium text-white disabled:cursor-not-allowed transition-colors"
                        style={{
                            backgroundColor: loading || !content.trim() ? 'var(--btn-disabled-bg)' : 'var(--brand-primary)',
                        }}
                    >
                        등록
                    </button>
                </div>
            ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    댓글을 작성하려면 로그인이 필요합니다.
                </p>
            )}
        </section>
    );
}
