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
    categoryInfo?: { slug: string; name: string };
    tagInfos?: { slug: string; name: string }[];
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
    categoryInfo,
    tagInfos,
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
                <div className="flex items-center flex-wrap gap-x-1 gap-y-0.5 mt-1">
                    {categoryInfo && (
                        <Link
                            href={`/?category=${categoryInfo.slug}`}
                            className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 mr-1"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {categoryInfo.name}
                        </Link>
                    )}
                    <span className="text-xs text-gray-500">
                        {points} points by <span className="hover:underline cursor-pointer">{author}</span> {time_ago} | <Link href={`/item/${id}`} className="hover:underline">{comments_count} comments</Link>
                    </span>
                </div>
                {tagInfos && tagInfos.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {tagInfos.map((tag) => (
                            <Link
                                key={tag.slug}
                                href={`/?tag=${tag.slug}`}
                                className="text-xs px-1.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                            >
                                #{tag.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
