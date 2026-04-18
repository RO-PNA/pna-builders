import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/utils/supabase/server'

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const categorySlug = searchParams.get('category')
    const tagSlug = searchParams.get('tag')

    const supabase = await createSupabaseServer()

    // resolve category
    let categoryIds: number[] | undefined
    if (categorySlug) {
        const { data: cat } = await supabase
            .from('categories').select('id').eq('slug', categorySlug).single()
        if (cat) {
            const { data: children } = await supabase
                .from('categories').select('id').eq('parent_id', cat.id)
            categoryIds = [cat.id, ...(children?.map(c => c.id) ?? [])]
        }
    }

    // resolve tag → item_ids
    let tagItemIds: number[] | undefined
    if (tagSlug) {
        const { data: tag } = await supabase
            .from('tags').select('id').eq('slug', tagSlug).single()
        if (tag) {
            const { data: itemTags } = await supabase
                .from('item_tags').select('item_id').eq('tag_id', tag.id)
            tagItemIds = itemTags?.map(it => it.item_id) ?? []
        }
    }

    // 아이템 쿼리 — 조인 없이 단독 조회로 정렬 보장
    let query = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE + 1)

    if (cursor) {
        query = query.lt('created_at', cursor)
    }
    if (categoryIds) {
        query = query.in('category_id', categoryIds)
    }
    if (tagItemIds !== undefined) {
        query = query.in('id', tagItemIds.length > 0 ? tagItemIds : [-1])
    }

    const { data: rawItems, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = rawItems ?? []
    const hasMore = items.length > PAGE_SIZE
    const pageItems = hasMore ? items.slice(0, PAGE_SIZE) : items

    // 카테고리 + 태그 병렬 조회
    const itemIds = pageItems.map(i => i.id)
    const categoryIdSet = [...new Set(pageItems.map(i => i.category_id).filter(Boolean))]

    const [categoriesRes, itemTagsRes] = await Promise.all([
        categoryIdSet.length > 0
            ? supabase.from('categories').select('id, slug, name').in('id', categoryIdSet)
            : Promise.resolve({ data: null }),
        itemIds.length > 0
            ? supabase.from('item_tags').select('item_id, tags(slug, name)').in('item_id', itemIds)
            : Promise.resolve({ data: null }),
    ])

    const categoryMap: Record<number, { slug: string; name: string }> = {}
    categoriesRes.data?.forEach((c: { id: number; slug: string; name: string }) => {
        categoryMap[c.id] = { slug: c.slug, name: c.name }
    })

    const itemTagsMap: Record<number, { slug: string; name: string }[]> = {}
    if (itemTagsRes.data) {
        for (const row of itemTagsRes.data) {
            if (!itemTagsMap[row.item_id]) itemTagsMap[row.item_id] = []
            const tag = row.tags as unknown as { slug: string; name: string } | null
            if (tag) itemTagsMap[row.item_id].push(tag)
        }
    }

    const enriched = pageItems.map(item => ({
        ...item,
        categoryInfo: item.category_id ? categoryMap[item.category_id] : undefined,
        tagInfos: itemTagsMap[item.id] ?? [],
    }))

    const nextCursor = hasMore && pageItems.length > 0
        ? pageItems[pageItems.length - 1].created_at
        : null

    return NextResponse.json({ items: enriched, nextCursor })
}
