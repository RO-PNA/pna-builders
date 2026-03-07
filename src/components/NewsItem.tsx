import React from 'react';
import Link from 'next/link';

export interface NewsItemProps {
    id: number;
    title?: string | null;
    url?: string | null;
    summary?: string | null;
    points?: number;
    author: string;
    created_at: string;
    published_at?: string | null;
    comments_count?: number;
    isDetail?: boolean;
}

export default function NewsItem({
    id,
    title,
    url,
    summary,
    points = 0,
    author,
    created_at,
    published_at,
    comments_count = 0,
    isDetail = false
}: NewsItemProps) {
    const displayTitle = title || summary?.split('\n')[0]?.slice(0, 100) || '(제목 없음)';
    const domain = url ? (() => { try { return new URL(url).hostname; } catch { return null; } })() : null;
    const displayDate = published_at || created_at;
    const time_ago = new Date(displayDate).toLocaleDateString();

    return (
        <div className="py-2">
            <div>
                <div className="flex items-baseline space-x-1">
                    <Link href={`/item/${id}`} className="text-md sm:text-lg font-medium leading-tight visited:text-gray-500 hover:text-blue-600">
                        {displayTitle}
                    </Link>
                    {domain && (
                        <Link href={url!} target="_blank" className="text-xs text-gray-500 hover:underline">
                            ({domain})
                        </Link>
                    )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {points} points by <span className="hover:underline cursor-pointer">{author}</span> {time_ago} | <Link href={`/item/${id}`} className="hover:underline">{comments_count} comments</Link>
                </div>
            </div>
        </div>
    );
}
