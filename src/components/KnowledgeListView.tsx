'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import NewsItem, { type NewsItemProps } from './NewsItem';
import Link from 'next/link';

type Category = {
  id: number;
  slug: string;
  name: string;
};

type Tag = {
  slug: string;
  name: string;
};

type EnrichedItem = NewsItemProps & {
  categoryInfo?: { slug: string; name: string };
  tagInfos?: { slug: string; name: string }[];
};

export default function KnowledgeListView({
  categories,
  popularTags,
}: {
  categories: Category[];
  popularTags: Tag[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string>('');
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(async (cursorVal: string | null, reset: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cursorVal) params.set('cursorId', cursorVal);
      if (activeCategory) params.set('category', activeCategory);
      if (activeTag) params.set('tag', activeTag);

      const res = await fetch(`/api/items/list?${params}`);
      if (!res.ok) return;
      const data = await res.json();

      if (reset) {
        setItems(data.items);
      } else {
        setItems(prev => [...prev, ...data.items]);
      }
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [activeCategory, activeTag]);

  // Reset on filter change
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoading(true);
    fetchItems(null, true);
  }, [fetchItems]);

  // Intersection observer
  useEffect(() => {
    if (!observerRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchItems(cursor, false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [cursor, hasMore, loading, fetchItems]);

  function selectCategory(slug: string) {
    setActiveCategory(prev => prev === slug ? '' : slug);
  }

  function selectTag(slug: string) {
    setActiveTag(prev => prev === slug ? '' : slug);
  }

  return (
    <>
      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={() => setActiveCategory('')}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            !activeCategory
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/20'
          }`}
          style={activeCategory ? { color: 'var(--text-secondary)' } : undefined}
        >
          전체
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => selectCategory(cat.slug)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              activeCategory === cat.slug
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/20'
            }`}
            style={activeCategory !== cat.slug ? { color: 'var(--text-secondary)' } : undefined}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Popular tags */}
      {popularTags.length > 0 && !activeTag && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {popularTags.map((t) => (
            <button
              key={t.slug}
              onClick={() => selectTag(t.slug)}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              #{t.name}
            </button>
          ))}
        </div>
      )}

      {/* Active tag indicator */}
      {activeTag && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            태그: <span className="font-semibold text-orange-500">#{activeTag}</span>
          </span>
          <button onClick={() => setActiveTag('')} className="text-xs text-gray-400 hover:text-orange-500">
            ✕ 해제
          </button>
        </div>
      )}

      {/* Items */}
      {initialLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => (
              <li key={item.id}>
                <NewsItem
                  {...item}
                  categoryInfo={item.categoryInfo}
                  tagInfos={item.tagInfos}
                />
              </li>
            ))}
            {items.length === 0 && (
              <div className="p-4 text-gray-400">
                {activeCategory || activeTag
                  ? '해당 필터에 맞는 항목이 없습니다.'
                  : 'No items found.'}
              </div>
            )}
          </ul>

          {hasMore && (
            <div ref={observerRef} className="flex justify-center py-6">
              {loading && (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
