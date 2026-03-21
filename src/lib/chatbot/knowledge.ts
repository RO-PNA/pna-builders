import { SupabaseClient } from "@supabase/supabase-js";

type KnowledgeItem = {
  title: string | null;
  summary: string | null;
  url: string | null;
};

function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "이", "그", "저", "것", "수", "등", "및", "를", "을", "에", "의", "가",
    "는", "은", "로", "으로", "와", "과", "에서", "까지", "부터", "하고",
    "입니다", "합니다", "있다", "없다", "하다", "되다", "이다",
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "shall", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "about", "like",
    "and", "or", "but", "if", "not", "no", "so", "it", "this", "that",
  ]);

  return text
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w.toLowerCase()))
    .slice(0, 8);
}

export async function searchKnowledge(
  supabase: SupabaseClient,
  userMessage: string
): Promise<KnowledgeItem[]> {
  const keywords = extractKeywords(userMessage);
  if (keywords.length === 0) return [];

  const orFilter = keywords
    .map((kw) => `title.ilike.%${kw}%,summary.ilike.%${kw}%`)
    .join(",");

  const { data, error } = await supabase
    .from("items")
    .select("title, summary, url")
    .or(orFilter)
    .limit(3);

  if (error) {
    console.error("knowledge search error:", error);
    return [];
  }

  return data ?? [];
}
