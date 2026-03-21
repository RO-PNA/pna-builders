import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt } from "@/lib/chatbot/systemPrompt";
import { createSupabaseAdmin } from "../../../utils/supabase/admin";
import { searchKnowledge } from "@/lib/chatbot/knowledge";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

function getNextStage(currentStage: string, content: string) {
  const text = content.trim();

  if (currentStage === "P1" && text.includes("원인 추적 시작")) return "P2";
  if (currentStage === "P2" && text.includes("문제 분해 시작")) return "P3";
  if (currentStage === "P3" && text.includes("문제 탐색 시작")) return "P4";
  if (currentStage === "P4" && text.includes("가설 검증 시작")) return "P5";
  if (currentStage === "P5" && text.includes("종합 시작")) return "P6";

  return currentStage;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, domain, teamMembers, sessionId, currentStage } =
      await request.json();

    if (!domain || !messages?.length || !sessionId || !currentStage) {
      return Response.json(
        { error: "domain, messages, sessionId, currentStage are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();

    const systemPrompt = buildSystemPrompt(domain, teamMembers);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const geminiHistory = messages
      .slice(0, -1)
      .map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    const lastMessage = messages[messages.length - 1].content;

    console.log("chatbot route called", {
      sessionId,
      currentStage,
      domain,
      messageCount: messages.length,
    });

    const { count, error: countError } = await supabase
      .from("workshop_messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    if (countError) {
      console.error("count error:", countError);
      return Response.json(
        { error: `message count failed: ${countError.message}` },
        { status: 500 }
      );
    }

    const nextTurnNo = (count ?? 0) + 1;

    const { error: teamInsertError } = await supabase
      .from("workshop_messages")
      .insert({
        session_id: sessionId,
        stage: currentStage,
        sender: "team",
        message_type: "normal",
        content: lastMessage,
        turn_no: nextTurnNo,
      });

    if (teamInsertError) {
      console.error("team message insert error:", teamInsertError);
      return Response.json(
        { error: `team message insert failed: ${teamInsertError.message}` },
        { status: 500 }
      );
    }

    const nextStage = getNextStage(currentStage, lastMessage);
    const stageChanged = nextStage !== currentStage;

    if (stageChanged) {
      const { error: stageUpdateError } = await supabase
        .from("workshop_sessions")
        .update({
          current_stage: nextStage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (stageUpdateError) {
        console.error("stage update error:", stageUpdateError);
      }
    }

    const knowledgeItems = await searchKnowledge(supabase, lastMessage);
    let userMessage = lastMessage;
    if (knowledgeItems.length > 0) {
      const refs = knowledgeItems
        .map(
          (item, i) =>
            `[참고자료 ${i + 1}] ${item.title || "(제목 없음)"}\n${item.summary || ""}\n${item.url ? `출처: ${item.url}` : ""}`
        )
        .join("\n\n");
      userMessage = `${lastMessage}\n\n---\n[Knowledge Base 참고자료 — 답변에 관련 내용이 있으면 자연스럽게 인용하세요]\n${refs}`;
    }

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessageStream(userMessage);

    const encoder = new TextEncoder();
    let fullAssistantText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullAssistantText += text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    text,
                    stage: nextStage,
                    stageChanged,
                  })}\n\n`
                )
              );
            }
          }

          const { error: systemInsertError } = await supabase
            .from("workshop_messages")
            .insert({
              session_id: sessionId,
              stage: nextStage,
              sender: "system",
              message_type: stageChanged ? "stage_transition" : "normal",
              content: fullAssistantText,
              turn_no: nextTurnNo + 1,
            });

          if (systemInsertError) {
            console.error("system message insert error:", systemInsertError);
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                stage: nextStage,
                stageChanged,
              })}\n\n`
            )
          );
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
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}