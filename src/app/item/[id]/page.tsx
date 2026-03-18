import React from 'react';
import { createSupabaseServer } from '@/utils/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import CommentSection from '@/components/CommentSection';

export const revalidate = 0;

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createSupabaseServer();
    const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

    if (!item) {
        return { title: 'Not Found | PNA' };
    }

    const title = item.summary?.split('\n')[0]?.slice(0, 60) || 'PNA Knowledge';
    const description = item.summary?.slice(0, 160) || '';
    const url = `https://pna-builders.vercel.app/item/${id}`;

    return {
        title: `${title} | PNA`,
        description,
        openGraph: {
            title,
            description,
            url,
            siteName: 'PNA - Penguins Never Alone',
            type: 'article',
            publishedTime: item.published_at || item.created_at,
            authors: [item.author],
        },
        twitter: {
            card: 'summary',
            title,
            description,
        },
        alternates: {
            canonical: url,
        },
    };
}

export default async function ItemPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

    if (!item) {
        return <div>Item not found</div>;
    }

    const displayTitle = item.summary?.split('\n')[0]?.slice(0, 100) || '(제목 없음)';
    const domain = item.url ? (() => { try { return new URL(item.url).hostname; } catch { return null; } })() : null;
    const displayDate = new Date(item.published_at || item.created_at).toLocaleDateString();

    return (
        <article>
            <h1 className="text-lg font-semibold">
                {item.url ? (
                    <Link href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {displayTitle}
                    </Link>
                ) : (
                    displayTitle
                )}
                {domain && (
                    <span className="text-xs text-gray-500 font-normal ml-2">({domain})</span>
                )}
            </h1>
            <div className="text-xs text-gray-500 mt-1 mb-4">
                {item.author} &middot; {displayDate}
            </div>

            {item.summary && (
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t pt-4">
                    {item.summary}
                </div>
            )}

            <CommentSection itemId={item.id} />
        </article>
    );
}
