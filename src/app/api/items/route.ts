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

function toSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

export async function POST(req: Request) {
    const { url, summary, category_id, tags } = await req.json()
    const supabase = await createSupabaseServer()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const title = await extractTitle(url)

    const { data: item, error } = await supabase.from('items').insert({
        url,
        title,
        summary,
        category_id: category_id || null,
        created_by: user.id,
        author: user.email?.split('@')[0] || 'anonymous',
        points: 1
    }).select('id').single()

    if (error) {
        console.error('Submit Error:', error);
        return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }

    if (tags && Array.isArray(tags) && tags.length > 0 && item) {
        const tagNames = tags.slice(0, 5) as string[]

        for (const tagName of tagNames) {
            const slug = toSlug(tagName)
            if (!slug) continue

            const { data: existing } = await supabase
                .from('tags')
                .select('id')
                .eq('slug', slug)
                .single()

            let tagId: number

            if (existing) {
                tagId = existing.id
                await supabase
                    .from('tags')
                    .update({ usage_count: (await supabase.from('tags').select('usage_count').eq('id', tagId).single()).data?.usage_count + 1 })
                    .eq('id', tagId)
            } else {
                const { data: newTag, error: tagError } = await supabase
                    .from('tags')
                    .insert({ slug, name: tagName.trim(), usage_count: 1 })
                    .select('id')
                    .single()

                if (tagError || !newTag) continue
                tagId = newTag.id
            }

            await supabase.from('item_tags').insert({
                item_id: item.id,
                tag_id: tagId,
            }).select()
        }
    }

    return NextResponse.json({ ok: true })
}
