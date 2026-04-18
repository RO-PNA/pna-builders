import NewsItem from "@/components/NewsItem";
import { createSupabaseServer } from "@/utils/supabase/server";
import Link from "next/link";
import CategoryFilter from "@/components/CategoryFilter";
import KnowledgeViewToggle from "@/components/KnowledgeViewToggle";
import OntologyGraph from "@/components/OntologyGraph";

export const revalidate = 0;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categorySlug = typeof params.category === 'string' ? params.category : undefined;
  const tagSlug = typeof params.tag === 'string' ? params.tag : undefined;
  const view = typeof params.view === 'string' ? params.view : 'list';

  const supabase = await createSupabaseServer();

  // ── 1단계: 독립 쿼리 병렬 실행 ──
  const [categoriesRes, catLookupRes, tagLookupRes, commentsRes] = await Promise.all([
    supabase.from('categories').select('id, slug, name, parent_id, sort_order').is('parent_id', null).order('sort_order'),
    categorySlug
      ? supabase.from('categories').select('id').eq('slug', categorySlug).single()
      : Promise.resolve({ data: null }),
    tagSlug
      ? supabase.from('tags').select('id').eq('slug', tagSlug).single()
      : Promise.resolve({ data: null }),
    supabase.from('comments').select('id, content, author_name, created_at, item_id').order('created_at', { ascending: false }).limit(10),
  ]);

  const categories = categoriesRes.data ?? [];
  const categoryId = catLookupRes.data?.id as number | undefined;
  const tagId = tagLookupRes.data?.id as number | undefined;

  // ── 2단계: 필터 의존 쿼리 병렬 실행 ──
  const [childCatsRes, tagItemsRes, popularTagsRes] = await Promise.all([
    categoryId
      ? supabase.from('categories').select('id').eq('parent_id', categoryId)
      : Promise.resolve({ data: null }),
    tagId
      ? supabase.from('item_tags').select('item_id').eq('tag_id', tagId)
      : Promise.resolve({ data: null }),
    supabase.from('tags').select('slug, name').order('usage_count', { ascending: false }).limit(10),
  ]);

  const popularTags = popularTagsRes.data;

  // ── 3단계: 아이템 쿼리 ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let itemsQuery: any = supabase
    .from('items')
    .select('*, categories(slug, name)')
    .order('created_at', { ascending: false });

  if (categoryId) {
    const ids = [categoryId, ...(childCatsRes.data?.map((c: { id: number }) => c.id) ?? [])];
    itemsQuery = itemsQuery.in('category_id', ids);
  }

  if (tagId) {
    const itemIds = tagItemsRes.data?.map((it: { item_id: number }) => it.item_id) ?? [];
    itemsQuery = itemsQuery.in('id', itemIds.length > 0 ? itemIds : [-1]);
  }

  const { data: items } = await itemsQuery;

  // ── 4단계: 아이템별 태그 조회 ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemIdsForTags = items?.map((i: any) => i.id) ?? [];
  let itemTagsMap: Record<number, { slug: string; name: string }[]> = {};
  if (itemIdsForTags.length > 0) {
    const { data: allItemTags } = await supabase
      .from('item_tags')
      .select('item_id, tags(slug, name)')
      .in('item_id', itemIdsForTags);

    if (allItemTags) {
      for (const row of allItemTags) {
        if (!itemTagsMap[row.item_id]) itemTagsMap[row.item_id] = [];
        const tag = row.tags as unknown as { slug: string; name: string } | null;
        if (tag) itemTagsMap[row.item_id].push(tag);
      }
    }
  }

  return (
    <div>
      {/* Header: View Toggle + Submit */}
      <div className="flex items-center justify-between mb-4">
        <KnowledgeViewToggle />
        <Link href="/submit" className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600">
          Submit
        </Link>
      </div>

      {view === 'graph' ? (
        /* ── Graph View ── */
        <OntologyGraph />
      ) : (
        /* ── List View ── */
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <CategoryFilter
              categories={categories}
              activeCategorySlug={categorySlug}
              activeTagSlug={tagSlug}
            />

            {popularTags && popularTags.length > 0 && !tagSlug && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {popularTags.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/?tag=${t.slug}`}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            {tagSlug && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  태그: <span className="font-semibold text-orange-500">#{tagSlug}</span>
                </span>
                <Link href="/" className="text-xs text-gray-400 hover:text-orange-500">✕ 해제</Link>
              </div>
            )}

            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {items?.map((item: any) => (
                <li key={item.id}>
                  <NewsItem
                    {...item}
                    categoryInfo={item.categories ?? undefined}
                    tagInfos={itemTagsMap[item.id]}
                  />
                </li>
              ))}
              {(!items || items.length === 0) && (
                <div className="p-4 text-gray-400">
                  {categorySlug || tagSlug
                    ? '해당 필터에 맞는 항목이 없습니다.'
                    : 'No items found.'}
                </div>
              )}
            </ul>
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
              {commentsRes.data && commentsRes.data.length > 0 ? (
                <ul className="space-y-3">
                  {commentsRes.data.map((c) => (
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
