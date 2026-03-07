import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/chatbot/systemPrompt";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const { messages, domain } = await request.json();

  if (!domain || !messages?.length) {
    return NextResponse.json(
      { error: "domain and messages are required" },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(domain);

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages,
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  return NextResponse.json({ content: text });
}
