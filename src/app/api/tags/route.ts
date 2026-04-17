import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    const supabase = await createSupabaseServer()

    let query = supabase
        .from('tags')
        .select('id, slug, name, usage_count')
        .order('usage_count', { ascending: false })
        .limit(20)

    if (q) {
        query = query.ilike('name', `%${q}%`)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
