import { createSupabaseServer } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const itemId = req.nextUrl.searchParams.get('itemId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '0');

    const supabase = await createSupabaseServer();

    if (itemId) {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('item_id', itemId)
            .order('created_at', { ascending: true });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    }

    // 최신 댓글 (홈 사이드바용)
    const { data, error } = await supabase
        .from('comments')
        .select('id, content, author_name, created_at, item_id')
        .order('created_at', { ascending: false })
        .limit(limit || 10);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { itemId, content } = await req.json();
    if (!itemId || !content?.trim()) {
        return NextResponse.json({ error: 'itemId와 content는 필수입니다.' }, { status: 400 });
    }

    const authorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'anonymous';

    const { data, error } = await supabase
        .from('comments')
        .insert({
            item_id: itemId,
            user_id: user.id,
            author_name: authorName,
            content: content.trim(),
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
    const commentId = req.nextUrl.searchParams.get('id');
    if (!commentId) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
