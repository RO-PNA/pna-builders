'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

type OntologyNode = {
  id: number;
  node_type: string;
  ref_id: number | null;
  slug: string | null;
  name: string;
  description: string | null;
};

type OntologyEdge = {
  id: number;
  from_node: number;
  to_node: number;
  relation: string;
  weight: number;
};

const NODE_COLORS: Record<string, string> = {
  concept: '#f97316',
  person: '#3b82f6',
  category: '#8b5cf6',
  tag: '#10b981',
  item: '#6b7280',
};

const NODE_TYPE_LABELS: Record<string, string> = {
  concept: 'Concept',
  person: 'Person',
  category: 'Category',
  tag: 'Tag',
  item: 'Item',
};

const RELATION_LABELS: Record<string, string> = {
  tagged_with: 'tagged',
  belongs_to: 'belongs to',
  is_subtype_of: 'subtype',
  related_to: 'related',
  precedes: 'precedes',
  mentions: 'mentions',
  authored_by: 'authored by',
  covers: 'covers',
};

function buildGraphData(
  apiNodes: OntologyNode[],
  apiEdges: OntologyEdge[]
): { nodes: Node[]; edges: Edge[] } {
  const edgeCountMap: Record<number, number> = {};
  apiEdges.forEach((e) => {
    edgeCountMap[e.from_node] = (edgeCountMap[e.from_node] || 0) + 1;
    edgeCountMap[e.to_node] = (edgeCountMap[e.to_node] || 0) + 1;
  });

  const sorted = [...apiNodes].sort(
    (a, b) => (edgeCountMap[b.id] || 0) - (edgeCountMap[a.id] || 0)
  );

  const centerX = 400;
  const centerY = 300;

  const nodes: Node[] = sorted.map((n, i) => {
    const connections = edgeCountMap[n.id] || 0;
    const angle = (2 * Math.PI * i) / sorted.length;
    const radius = 150 + Math.random() * 150;

    return {
      id: String(n.id),
      position: {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      },
      data: {
        label: n.name,
        nodeType: n.node_type,
        description: n.description,
        connections,
        slug: n.slug,
      },
      style: {
        background: NODE_COLORS[n.node_type] || '#6b7280',
        color: '#fff',
        border: 'none',
        borderRadius: n.node_type === 'person' ? '50%' : '8px',
        padding: '8px 12px',
        fontSize: Math.max(10, Math.min(14, 10 + connections)),
        fontWeight: connections >= 3 ? 700 : 500,
        minWidth: 60,
        textAlign: 'center' as const,
      },
    };
  });

  const edges: Edge[] = apiEdges.map((e) => ({
    id: String(e.id),
    source: String(e.from_node),
    target: String(e.to_node),
    label: RELATION_LABELS[e.relation] || e.relation,
    style: { stroke: '#9ca3af', strokeWidth: 1.5 },
    labelStyle: { fontSize: 9, fill: '#9ca3af' },
    animated: e.relation === 'is_subtype_of',
  }));

  return { nodes, edges };
}

export default function OntologyGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<OntologyNode | null>(null);
  const [neighbors, setNeighbors] = useState<OntologyNode[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (search) params.set('q', search);

      const res = await fetch(`/api/ontology/graph?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      if (!data.nodes?.length) {
        setNodes([]);
        setEdges([]);
        return;
      }

      const { nodes: graphNodes, edges: graphEdges } = buildGraphData(data.nodes, data.edges);
      setNodes(graphNodes);
      setEdges(graphEdges);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search, setNodes, setEdges]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const handleNodeClick = useCallback(async (_: React.MouseEvent, node: Node) => {
    try {
      const res = await fetch(`/api/ontology/node/${node.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedNode(data.node);
      setNeighbors(data.neighbors || []);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="flex gap-4" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Graph */}
      <div className="flex-1 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
        {/* Filters */}
        <div
          className="flex items-center gap-2 px-3 py-2 border-b"
          style={{ borderColor: 'var(--border-light)', background: 'var(--surface-secondary)' }}
        >
          <select
            className="text-xs border rounded px-2 py-1"
            style={{ borderColor: 'var(--border-default)', background: 'var(--surface)', color: 'var(--text-primary)' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="concept">Concept</option>
            <option value="person">Person</option>
            <option value="category">Category</option>
            <option value="tag">Tag</option>
            <option value="item">Item</option>
          </select>
          <input
            type="text"
            className="text-xs border rounded px-2 py-1 flex-1 max-w-[200px]"
            style={{ borderColor: 'var(--border-default)', background: 'var(--surface)', color: 'var(--text-primary)' }}
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {NODE_TYPE_LABELS[type]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
            Loading...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500 text-sm">
            {error}
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--text-muted)' }}>
            <p className="text-lg mb-2">노드가 없습니다</p>
            <p className="text-sm">온톨로지 마이그레이션을 실행해주세요</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.3}
            maxZoom={2}
          >
            <Background color="var(--border-light)" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(n) => NODE_COLORS[n.data?.nodeType as string] || '#6b7280'}
              style={{ background: 'var(--surface-secondary)' }}
            />
          </ReactFlow>
        )}
      </div>

      {/* Sidebar */}
      {selectedNode && (
        <div
          className="w-64 shrink-0 rounded-xl border p-4 overflow-y-auto hidden lg:block"
          style={{ borderColor: 'var(--border-default)', background: 'var(--surface-secondary)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white"
              style={{ background: NODE_COLORS[selectedNode.node_type] }}
            >
              {NODE_TYPE_LABELS[selectedNode.node_type]}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs hover:text-orange-500"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>

          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
            {selectedNode.name}
          </h3>

          {selectedNode.description && (
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              {selectedNode.description}
            </p>
          )}

          {neighbors.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                연결된 노드 ({neighbors.length})
              </h4>
              <div className="space-y-1.5">
                {neighbors.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:opacity-80"
                    onClick={() => {
                      setSelectedNode(n);
                      fetch(`/api/ontology/node/${n.id}`)
                        .then((r) => r.json())
                        .then((d) => setNeighbors(d.neighbors || []))
                        .catch(() => {});
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ background: NODE_COLORS[n.node_type] }}
                    />
                    <span style={{ color: 'var(--text-primary)' }}>{n.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
