import { createSupabaseServer } from "@/utils/supabase/server";
import Link from "next/link";
import CategoryFilter from "@/components/CategoryFilter";
import KnowledgeViewToggle from "@/components/KnowledgeViewToggle";
import OntologyGraph from "@/components/OntologyGraph";
import InfiniteItemList from "@/components/InfiniteItemList";

export const revalidate = 0;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categorySlug = typeof params.category === 'string' ? params.category : undefined;
  const tagSlug = typeof params.tag === 'string' ? params.tag : undefined;
  const view = typeof params.view === 'string' ? params.view : 'list';

  const supabase = await createSupabaseServer();

  // 카테고리 + 인기 태그 + 최신 댓글 병렬 조회
  const [categoriesRes, popularTagsRes, commentsRes] = await Promise.all([
    supabase.from('categories').select('id, slug, name, parent_id, sort_order').is('parent_id', null).order('sort_order'),
    supabase.from('tags').select('slug, name').order('usage_count', { ascending: false }).limit(10),
    supabase.from('comments').select('id, content, author_name, created_at, item_id').order('created_at', { ascending: false }).limit(10),
  ]);

  const categories = categoriesRes.data ?? [];
  const popularTags = popularTagsRes.data;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <KnowledgeViewToggle />
        <Link href="/submit" className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600">
          Submit
        </Link>
      </div>

      {view === 'graph' ? (
        <OntologyGraph />
      ) : (
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

            <InfiniteItemList />
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
