import { createSupabaseServer } from "@/utils/supabase/server";
import Link from "next/link";
import KnowledgeViewToggle from "@/components/KnowledgeViewToggle";
import OntologyGraph from "@/components/OntologyGraph";
import KnowledgeListView from "@/components/KnowledgeListView";

export const revalidate = 0;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const view = typeof params.view === 'string' ? params.view : 'list';

  const supabase = await createSupabaseServer();

  const [categoriesRes, popularTagsRes, commentsRes] = await Promise.all([
    supabase.from('categories').select('id, slug, name, parent_id, sort_order').is('parent_id', null).order('sort_order'),
    supabase.from('tags').select('slug, name').order('usage_count', { ascending: false }).limit(10),
    supabase.from('comments').select('id, content, author_name, created_at, item_id').order('created_at', { ascending: false }).limit(10),
  ]);

  const categories = categoriesRes.data ?? [];
  const popularTags = popularTagsRes.data ?? [];

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
