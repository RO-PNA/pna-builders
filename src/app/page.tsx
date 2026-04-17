import NewsItem from "@/components/NewsItem";
import { createSupabaseServer } from "@/utils/supabase/server";
import { NewsItemProps } from "@/components/NewsItem";
import Link from "next/link";
import CategoryFilter from "@/components/CategoryFilter";

export const revalidate = 0;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categorySlug = typeof params.category === 'string' ? params.category : undefined;
  const tagSlug = typeof params.tag === 'string' ? params.tag : undefined;

  const supabase = await createSupabaseServer();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, name, parent_id, sort_order')
    .is('parent_id', null)
    .order('sort_order');

  let categoryId: number | undefined;
  if (categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) categoryId = cat.id;
  }

  let itemIds: number[] | undefined;
  if (tagSlug) {
    const { data: tag } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', tagSlug)
      .single();
    if (tag) {
      const { data: itemTags } = await supabase
        .from('item_tags')
        .select('item_id')
        .eq('tag_id', tag.id);
      itemIds = itemTags?.map((it) => it.item_id) ?? [];
    }
  }

  const hasCategories = !!(await supabase.from('categories').select('id').limit(1)).data?.length;

  let itemsQuery = supabase
    .from('items')
    .select(hasCategories ? '*, categories(slug, name)' : '*')
    .order('created_at', { ascending: false });

  if (categoryId) {
    const { data: childCats } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId);
    const ids = [categoryId, ...(childCats?.map((c) => c.id) ?? [])];
    itemsQuery = itemsQuery.in('category_id', ids);
  }

  if (itemIds !== undefined) {
    if (itemIds.length === 0) {
      itemsQuery = itemsQuery.in('id', [-1]);
    } else {
      itemsQuery = itemsQuery.in('id', itemIds);
    }
  }

  const { data: items } = await itemsQuery;

  const hasTags = !!(await supabase.from('tags').select('id').limit(1)).data?.length;

  const itemIdsForTags = items?.map((i) => i.id) ?? [];
  let itemTagsMap: Record<number, { slug: string; name: string }[]> = {};
  if (hasTags && itemIdsForTags.length > 0) {
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

  const popularTags = hasTags
    ? (await supabase.from('tags').select('slug, name').order('usage_count', { ascending: false }).limit(10)).data
    : null;

  const { data: recentComments } = await supabase
    .from('comments')
    .select('id, content, author_name, created_at, item_id')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Knowledge</h1>
          <Link href="/submit" className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600">
            Submit
          </Link>
        </div>

        {/* Category Filter */}
        <CategoryFilter
          categories={categories ?? []}
          activeCategorySlug={categorySlug}
          activeTagSlug={tagSlug}
        />

        {/* Popular Tags */}
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

        {/* Active tag indicator */}
        {tagSlug && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              태그: <span className="font-semibold text-orange-500">#{tagSlug}</span>
            </span>
            <Link href="/" className="text-xs text-gray-400 hover:text-orange-500">✕ 해제</Link>
          </div>
        )}

        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {items?.map((item: NewsItemProps & { categories?: { slug: string; name: string } | null }) => (
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
          {recentComments && recentComments.length > 0 ? (
            <ul className="space-y-3">
              {recentComments.map((c) => (
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
  );
}
