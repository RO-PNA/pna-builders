
import React from 'react';
import NewsItem from '@/components/NewsItem';
import { createSupabaseServer } from '@/utils/supabase/server';
import { Item } from '@/types';

export const revalidate = 0;

export default async function ItemPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createSupabaseServer();

    // Fetch item
    const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

    if (!item) {
        return <div className="p-4">Item not found</div>;
    }

    // Fetch comments (children)
    const { data: comments } = await supabase
        .from('items')
        .select('*')
        .eq('parent_id', id)
        .order('created_at', { ascending: true });

    return (
        <div className="bg-white p-4">
            <NewsItem {...(item as Item)} isDetail={true} />

            {item.summary && (
                <div className="mt-4 text-sm text-gray-800 leading-relaxed mb-8 border-b pb-4">
                    {item.summary}
                </div>
            )}

            <div className="mt-4">
                <h3 className="font-bold text-sm mb-4">Comments</h3>
                <div className="space-y-4">
                    {comments?.map((comment: Item) => (
                        <div key={comment.id} className="text-sm">
                            <div className="text-gray-500 text-xs mb-1">
                                <span className="font-bold text-gray-700">{comment.author}</span> {new Date(comment.created_at).toLocaleDateString()}
                            </div>
                            <div className="mb-2">{comment.summary}</div>

                            {/* Nested comments not implemented fully in this fetch depth yet, just 1 level for now */}
                        </div>
                    ))}
                    {(!comments || comments.length === 0) && (
                        <div className="text-gray-500 text-sm">No comments yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
