import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/utils/supabase/server'

export async function GET() {
    const supabase = await createSupabaseServer()

    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, slug, name, parent_id, sort_order')
        .order('sort_order')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const parents = categories?.filter((c) => !c.parent_id) ?? []
    const tree = parents.map((p) => ({
        ...p,
        children: categories?.filter((c) => c.parent_id === p.id) ?? [],
    }))

    return NextResponse.json(tree, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
}
