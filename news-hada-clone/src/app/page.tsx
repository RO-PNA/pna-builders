import NewsItem from "@/components/NewsItem";
import { createSupabaseServer } from "@/utils/supabase/server";
import { Item } from "@/types";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";

export const revalidate = 0; // Disable caching for now to see updates immediately

export default async function Home() {
  const supabase = await createSupabaseServer();

  // Fetch User
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Items
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  return (
    <div className="bg-white">
      <div className="flex justify-end mb-4">
        {user ? <LogoutButton /> : <LoginButton />}
      </div>

      <h1 className="text-2xl font-bold mb-6">최신 글</h1>

      <ul className="divide-y divide-gray-100">
        {items?.map((item: Item) => (
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
    </div>
  );
}
