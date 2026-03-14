import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt } from "@/lib/chatbot/systemPrompt";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { messages, domain, teamMembers } = await request.json();

    if (!domain || !messages?.length) {
      return Response.json(
        { error: "domain and messages are required" },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(domain, teamMembers);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    // Convert messages from Anthropic format to Gemini format
    const geminiHistory = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessageStream(lastMessage);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chatbot API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
