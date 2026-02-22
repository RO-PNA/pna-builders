import React from 'react';
import Link from 'next/link';

export interface NewsItemProps {
    id: number;
    title: string;
    url?: string | null;
    summary?: string | null;
    points: number;
    author: string;
    created_at: string;
    comments_count?: number;
    isDetail?: boolean;
}

export default function NewsItem({
    id,
    title,
    url,
    points,
    author,
    created_at,
    comments_count = 0,
    isDetail = false
}: NewsItemProps) {
    const domain = url ? new URL(url).hostname : null;
    const time_ago = new Date(created_at).toLocaleDateString();

    return (
        <div className="py-2 px-4 flex items-start space-x-2">
            <span className="text-gray-400 text-sm w-6 text-right font-mono">1.</span>
            <div>
                <div className="flex items-baseline space-x-1">
                    <Link href={isDetail ? `/item/${id}` : `/item/${id}`} className="text-md sm:text-lg font-medium leading-tight visited:text-gray-500 hover:text-blue-600">
                        {title}
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
