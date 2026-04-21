'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import KnowledgeViewToggle from '@/components/KnowledgeViewToggle';
import OntologyGraph from '@/components/OntologyGraph';
import KnowledgeListView from '@/components/KnowledgeListView';

type Category = { id: number; slug: string; name: string; children?: { slug: string }[] };
type Tag = { slug: string; name: string };
type Comment = { id: number; content: string; author_name: string; created_at: string; item_id: number };

export default function Home() {
  const [view, setView] = useState('list');
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.ok ? r.json() : []),
      fetch('/api/tags').then(r => r.ok ? r.json() : []),
      fetch('/api/comments?limit=10').then(r => r.ok ? r.json() : []),
    ]).then(([cats, tags, cmts]) => {
      // categories API returns tree — keep parents + children slugs for client-side filter matching
      const parents = Array.isArray(cats) ? cats.map((c: Category & { children?: Category[] }) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        children: (c.children ?? []).map((ch) => ({ slug: ch.slug })),
      })) : [];
      setCategories(parents);
      setPopularTags(Array.isArray(tags) ? tags : []);
      setComments(Array.isArray(cmts) ? cmts : []);
    });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <KnowledgeViewToggle view={view} onViewChange={setView} />
        <Link href="/submit" className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600">
          Submit
        </Link>
      </div>

      {view === 'graph' ? (
        <OntologyGraph />
      ) : (
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <KnowledgeListView
              categories={categories}
              popularTags={popularTags}
            />
          </div>

          <aside className="hidden lg:block w-64 shrink-0">
            <div
              className="sticky top-[56px] rounded-lg p-3 border"
              style={{
                background: 'var(--surface-secondary)',
                borderColor: 'var(--border-light)',
              }}
            >
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                최신 댓글
              </h2>
              {comments.length > 0 ? (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li key={c.id}>
                      <Link href={`/item/${c.item_id}`} className="block group">
                        <p
                          className="text-xs line-clamp-2 group-hover:underline"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {c.content}
                        </p>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {c.author_name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  아직 댓글이 없습니다.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
