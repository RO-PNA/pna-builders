"use client";

import { useState, useRef, useEffect } from "react";

type Phase = "setup" | "chat";
type Message = { role: "user" | "assistant"; content: string };
type TeamMember = { name: string; type: string };

const FRAMEWORK_TYPES = [
  { value: "discovery", label: "🔍 고객 발견형 (현장 탐정)" },
  { value: "structure", label: "📐 구조 분해형 (구조 설계자)" },
  { value: "causal", label: "🔗 원인 추적형 (인과 추적자)" },
  { value: "hypothesis", label: "🧪 가설 실험형 (속도전 실험가)" },
];

const DOMAINS = [
  {
    key: "A",
    emoji: "🛒",
    name: '패션 커머스 "스타일핏"',
    desc: "AI 추천은 만능인가?",
  },
  {
    key: "B",
    emoji: "💼",
    name: 'B2B SaaS "태스크플로우"',
    desc: "온보딩에서 사라지는 고객사",
  },
  {
    key: "C",
    emoji: "📱",
    name: '뉴스레터 "모닝브리프"',
    desc: "구독자는 많은데 수익이 안 나는 미디어",
  },
  {
    key: "D",
    emoji: "🏥",
    name: '헬스케어 앱 "케어루틴"',
    desc: "습관이 안 만들어지는 건강관리 앱",
  },
];

const TYPE_EMOJI: Record<string, string> = {
  discovery: "🔍",
  structure: "📐",
  causal: "🔗",
  hypothesis: "🧪",
};

export default function ChatbotPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([
    { name: "", type: "discovery" },
  ]);
  const [domain, setDomain] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMember() {
    setMembers([...members, { name: "", type: "discovery" }]);
  }

  function removeMember(index: number) {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  }

  function updateMember(
    index: number,
    field: keyof TeamMember,
    value: string
  ) {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  }

  async function sendMessage(content: string) {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, domain }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...newMessages, { role: "assistant", content: data.content }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "오류가 발생했습니다. 다시 시도해주세요.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function startGame() {
    if (!teamName.trim() || !domain) return;
    const validMembers = members.filter((m) => m.name.trim());
    if (validMembers.length === 0) return;

    const memberList = validMembers
      .map((m) => `${m.name} / ${TYPE_EMOJI[m.type]} ${FRAMEWORK_TYPES.find((t) => t.value === m.type)?.label}`)
      .join("\n");

    const initMessage = `팀 등록합니다.

팀 이름: ${teamName}
팀원:
${memberList}

선택한 도메인: ${DOMAINS.find((d) => d.key === domain)?.emoji} ${DOMAINS.find((d) => d.key === domain)?.name}

게임을 시작해주세요!`;

    setPhase("chat");
    await sendMessage(initMessage);
  }

  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-2">🎮 PNA 워크샵 챗봇</h1>
        <p className="text-gray-600 mb-8">
          팀 정보를 입력하고 도메인을 선택하면 게임마스터(GM)가 워크샵을
          진행합니다.
        </p>

        {/* Team Name */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">팀 이름</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="예: 알파팀"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Team Members */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">
            팀원 (이름 + 프레임워크 유형)
          </label>
          <p className="text-sm text-gray-500 mb-3">
            아이스브레이킹 결과에 따라 각 팀원의 유형을 선택해주세요.
          </p>
          {members.map((member, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={member.name}
                onChange={(e) => updateMember(i, "name", e.target.value)}
                placeholder="이름"
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <select
                value={member.type}
                onChange={(e) => updateMember(i, "type", e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {FRAMEWORK_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
              {members.length > 1 && (
                <button
                  onClick={() => removeMember(i)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addMember}
            className="text-sm text-orange-600 hover:underline mt-1"
          >
            + 팀원 추가
          </button>
        </div>

        {/* Domain Selection */}
        <div className="mb-8">
          <label className="block font-semibold mb-2">도메인 선택</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOMAINS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDomain(d.key)}
                className={`text-left p-4 rounded border-2 transition-colors ${
                  domain === d.key
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <div className="font-semibold">
                  {d.emoji} {d.name}
                </div>
                <div className="text-sm text-gray-500 mt-1">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startGame}
          disabled={
            !teamName.trim() ||
            !domain ||
            members.every((m) => !m.name.trim())
          }
          className="w-full bg-orange-500 text-white font-bold py-3 rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          게임 시작
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center justify-between">
        <div className="font-semibold text-sm">
          🎮 {teamName} |{" "}
          {DOMAINS.find((d) => d.key === domain)?.emoji}{" "}
          {DOMAINS.find((d) => d.key === domain)?.name}
        </div>
        <button
          onClick={() => {
            if (confirm("게임을 초기화하시겠습니까?")) {
              setPhase("setup");
              setMessages([]);
              setDomain(null);
              setTeamName("");
              setMembers([{ name: "", type: "discovery" }]);
            }
          }}
          className="text-xs text-gray-500 hover:text-red-500"
        >
          초기화
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                msg.role === "user"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !isLoading) sendMessage(input.trim());
          }}
          className="flex gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) sendMessage(input.trim());
              }
            }}
            placeholder="팀 액션 카드를 작성하거나, 선택지를 입력하세요..."
            rows={2}
            className="flex-1 border border-gray-300 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-orange-500 text-white px-4 rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
