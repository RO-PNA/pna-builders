'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import NewsItem, { type NewsItemProps } from './NewsItem';

type Category = {
  id: number;
  slug: string;
  name: string;
  children?: { slug: string }[];
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
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchItems = useCallback(async (reset: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const cursorVal = reset ? null : cursorRef.current;
      if (cursorVal) params.set('cursorId', cursorVal);

      const res = await fetch(`/api/items/list?${params}`);
      if (!res.ok) return;
      const data = await res.json();

      if (reset) {
        setItems(data.items);
      } else {
        setItems((prev) => [...prev, ...data.items]);
      }
      cursorRef.current = data.nextCursor;
      hasMoreRef.current = !!data.nextCursor;
      setHasMore(!!data.nextCursor);
    } catch {
      // ignore
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(true);
  }, [fetchItems]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          fetchItems(false);
        }
      },
      { rootMargin: '300px 0px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [initialLoading, hasMore, fetchItems]);

  const categoryMatchMap = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    for (const c of categories) {
      const set = new Set<string>([c.slug]);
      for (const ch of c.children ?? []) set.add(ch.slug);
      m[c.slug] = set;
    }
    return m;
  }, [categories]);

  const filteredItems = useMemo(() => {
    if (!activeCategory && !activeTag) return items;
    return items.filter((item) => {
      if (activeCategory) {
        const matchSet = categoryMatchMap[activeCategory];
        if (!matchSet || !item.categoryInfo || !matchSet.has(item.categoryInfo.slug)) return false;
      }
      if (activeTag) {
        if (!item.tagInfos?.some((t) => t.slug === activeTag)) return false;
      }
      return true;
    });
  }, [items, activeCategory, activeTag, categoryMatchMap]);

  function selectCategory(slug: string) {
    setActiveCategory((prev) => (prev === slug ? '' : slug));
  }

  function selectTag(slug: string) {
    setActiveTag((prev) => (prev === slug ? '' : slug));
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
            {filteredItems.map((item) => (
              <li key={item.id}>
                <NewsItem
                  {...item}
                  categoryInfo={item.categoryInfo}
                  tagInfos={item.tagInfos}
                />
              </li>
            ))}
            {filteredItems.length === 0 && (
              <div className="p-4 text-gray-400">
                {activeCategory || activeTag
                  ? '해당 필터에 맞는 항목이 없습니다.'
                  : 'No items found.'}
              </div>
            )}
          </ul>

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-6">
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
