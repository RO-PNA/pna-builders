'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import NewsItem, { type NewsItemProps } from './NewsItem';

type EnrichedItem = NewsItemProps & {
  categoryInfo?: { slug: string; name: string };
  tagInfos?: { slug: string; name: string }[];
};

export default function InfiniteItemList() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';

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
      if (category) params.set('category', category);
      if (tag) params.set('tag', tag);

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
  }, [category, tag]);

  // Reset on filter change
  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoading(true);
    fetchItems(null, true);
  }, [fetchItems]);

  // Intersection observer for infinite scroll
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

  if (initialLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
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
            {category || tag
              ? '해당 필터에 맞는 항목이 없습니다.'
              : 'No items found.'}
          </div>
        )}
      </ul>

      {/* Scroll trigger */}
      {hasMore && (
        <div ref={observerRef} className="flex justify-center py-6">
          {loading && (
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
    </>
  );
}
