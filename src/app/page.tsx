import NewsItem from "@/components/NewsItem";
import { createSupabaseServer } from "@/utils/supabase/server";
import { NewsItemProps } from "@/components/NewsItem";
import Link from "next/link";

export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function Home() {
  const supabase = await createSupabaseServer();

  // Fetch Items
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch latest comments
  const { data: recentComments } = await supabase
    .from('comments')
    .select('id, content, author_name, created_at, item_id')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Knowledge</h1>
          <Link href="/submit" className="bg-orange-500 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600">
            submit
          </Link>
        </div>

        <ul className="divide-y divide-gray-100">
          {items?.map((item: NewsItemProps) => (
            <li key={item.id}>
              <NewsItem {...item} />
            </li>
          ))}
          {(!items || items.length === 0) && (
            <div className="p-4 text-gray-400">
              No items found. Please run the schema.sql in Supabase or use the Submit page.
            </div>
          )}
        </ul>
      </div>

      {/* Sidebar - latest comments */}
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
