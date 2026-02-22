import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/utils/supabase/server'

async function extractTitle(url: string) {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })
        const html = await res.text()

        const og = html.match(/og:title["'] content=["']([^"']+)/i)
        if (og?.[1]) return og[1]

        const title = html.match(/<title>([^<]+)<\/title>/i)
        return title?.[1] ?? '제목 없음'
    } catch (e) {
        console.error('Error fetching URL:', e);
        return '제목 없음';
    }
}

export async function POST(req: Request) {
    const { url, summary, category } = await req.json()
    const supabase = await createSupabaseServer() // Fixed: await createSupabaseServer

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const title = await extractTitle(url)

    const { error } = await supabase.from('items').insert({
        url,
        title,
        summary,
        category,
        created_by: user.id,
        author: user.email?.split('@')[0] || 'anonymous', // We still need author text for display if not fetching from users table join
        points: 1
    })

    if (error) {
        console.error('Submit Error:', error);
        return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}
