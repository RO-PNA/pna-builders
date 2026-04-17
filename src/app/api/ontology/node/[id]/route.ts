import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/utils/supabase/server'

type Props = {
    params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Props) {
    const { id } = await params
    const nodeId = parseInt(id)
    if (isNaN(nodeId)) {
        return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const supabase = await createSupabaseServer()

    const { data: node, error } = await supabase
        .from('ontology_nodes')
        .select('*')
        .eq('id', nodeId)
        .single()

    if (error || !node) {
        return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const { data: edges } = await supabase
        .from('ontology_edges')
        .select('id, from_node, to_node, relation, weight')
        .or(`from_node.eq.${nodeId},to_node.eq.${nodeId}`)

    const neighborIds = new Set<number>()
    edges?.forEach((e) => {
        if (e.from_node !== nodeId) neighborIds.add(e.from_node)
        if (e.to_node !== nodeId) neighborIds.add(e.to_node)
    })

    let neighbors: typeof node[] = []
    if (neighborIds.size > 0) {
        const { data } = await supabase
            .from('ontology_nodes')
            .select('id, node_type, ref_id, slug, name, description')
            .in('id', [...neighborIds])
        if (data) neighbors = data
    }

    return NextResponse.json({ node, edges: edges ?? [], neighbors })
}
