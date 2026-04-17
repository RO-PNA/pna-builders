import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const nodeType = searchParams.get('type')
    const search = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200)

    const supabase = await createSupabaseServer()

    let nodesQuery = supabase
        .from('ontology_nodes')
        .select('id, node_type, ref_id, slug, name, description')
        .limit(limit)

    if (nodeType) {
        nodesQuery = nodesQuery.eq('node_type', nodeType)
    }
    if (search) {
        nodesQuery = nodesQuery.ilike('name', `%${search}%`)
    }

    const { data: nodes, error: nodesError } = await nodesQuery

    if (nodesError) {
        return NextResponse.json({ error: nodesError.message }, { status: 500 })
    }

    if (!nodes || nodes.length === 0) {
        return NextResponse.json({ nodes: [], edges: [] })
    }

    const nodeIds = nodes.map((n) => n.id)

    const { data: edges } = await supabase
        .from('ontology_edges')
        .select('id, from_node, to_node, relation, weight')
        .or(`from_node.in.(${nodeIds.join(',')}),to_node.in.(${nodeIds.join(',')})`)

    const connectedNodeIds = new Set(nodeIds)
    edges?.forEach((e) => {
        connectedNodeIds.add(e.from_node)
        connectedNodeIds.add(e.to_node)
    })

    const missingIds = [...connectedNodeIds].filter((id) => !nodeIds.includes(id))
    let allNodes = [...nodes]

    if (missingIds.length > 0) {
        const { data: extraNodes } = await supabase
            .from('ontology_nodes')
            .select('id, node_type, ref_id, slug, name, description')
            .in('id', missingIds)

        if (extraNodes) allNodes = [...allNodes, ...extraNodes]
    }

    return NextResponse.json(
        { nodes: allNodes, edges: edges ?? [] },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
}
