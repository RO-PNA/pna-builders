'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type NeighborNode = {
  id: number;
  node_type: string;
  slug: string | null;
  name: string;
  description: string | null;
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

export default function RelatedConcepts({ itemId }: { itemId: number }) {
  const [neighbors, setNeighbors] = useState<NeighborNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const graphRes = await fetch('/api/ontology/graph?type=item&limit=200');
        if (!graphRes.ok) return;
        const graphData = await graphRes.json();

        const itemNode = graphData.nodes?.find(
          (n: { node_type: string; ref_id: number }) => n.node_type === 'item' && n.ref_id === itemId
        );
        if (!itemNode) return;

        const nodeRes = await fetch(`/api/ontology/node/${itemNode.id}`);
        if (!nodeRes.ok) return;
        const nodeData = await nodeRes.json();

        setNeighbors(
          (nodeData.neighbors || []).filter((n: NeighborNode) => n.node_type !== 'item')
        );
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    fetchRelated();
  }, [itemId]);

  if (loading || neighbors.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        연결된 개념
      </h3>
      <div className="flex flex-wrap gap-2">
        {neighbors.map((n) => (
          <Link
            key={n.id}
            href="/ontology"
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors hover:border-orange-400"
            style={{
              borderColor: 'var(--border-default)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <span
              className="w-2 h-2 rounded-sm shrink-0"
              style={{ background: NODE_COLORS[n.node_type] }}
            />
            <span>{n.name}</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {NODE_TYPE_LABELS[n.node_type]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
