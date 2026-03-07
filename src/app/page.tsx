import NewsItem from "@/components/NewsItem";
import { createSupabaseServer } from "@/utils/supabase/server";
import { NewsItemProps } from "@/components/NewsItem";
export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function Home() {
  const supabase = await createSupabaseServer();

  // Fetch Items
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Knowledge</h1>

      <ul className="divide-y divide-gray-100">
        {items?.map((item: NewsItemProps) => (
          <li key={item.id}>
            <NewsItem {...item} />
          </li>
        ))}
        {(!items || items.length === 0) && (
          <div className="p-4 text-gray-500">
            No items found. Please run the schema.sql in Supabase or use the Submit page.
          </div>
        )}
      </ul>
    </>
  );
}
