"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Phase = "setup" | "chat";
type Message = { role: "user" | "assistant"; content: string };
type TeamMember = { name: string; type: string };

type GameState = {
  phase: Phase;
  teamName: string;
  members: TeamMember[];
  domain: string | null;
  messages: Message[];
  currentMission: number;
};

const FRAMEWORK_TYPES = [
  { value: "discovery", label: "고객 발견형 (현장 탐정)" },
  { value: "structure", label: "구조 분해형 (구조 설계자)" },
  { value: "causal", label: "원인 추적형 (인과 추적자)" },
  { value: "hypothesis", label: "가설 실험형 (속도전 실험가)" },
];

const FRAMEWORK_EMOJI: Record<string, string> = {
  discovery: "🔍",
  structure: "📐",
  causal: "🔗",
  hypothesis: "🧪",
};

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

const MISSIONS = [
  { id: 1, name: "현황 파악", time: 15 },
  { id: 2, name: "핵심 문제 정의", time: 15 },
  { id: 3, name: "AI 적용 가설 수립", time: 20 },
  { id: 4, name: "인과관계 설계", time: 20 },
  { id: 5, name: "최소 실험 설계", time: 20 },
  { id: 6, name: "전략 통합", time: 15 },
];

const STORAGE_KEY = "pna-chatbot-state";

function saveState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silently fail
  }
}

function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // silently fail
  }
  return null;
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}

function detectMission(messages: Message[]): number {
  let mission = 1;
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    const match = msg.content.match(/Mission\s*(\d)/i);
    if (match) {
      const n = parseInt(match[1]);
      if (n > mission && n <= 6) mission = n;
    }
  }
  return mission;
}

// Timer hook
function useTimer(initialMinutes: number, active: boolean) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => Math.max(0, s - 1));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, seconds]);

  const reset = useCallback((mins: number) => setSeconds(mins * 60), []);
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  const display = `${min}:${sec.toString().padStart(2, "0")}`;
  const isWarning = seconds <= 120 && seconds > 0;
  const isExpired = seconds === 0;

  return { display, isWarning, isExpired, reset, seconds };
}

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
  const [currentMission, setCurrentMission] = useState(1);
  const [streamingContent, setStreamingContent] = useState("");
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [systemPassword, setSystemPassword] = useState("");
  const [systemError, setSystemError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  const missionTime = MISSIONS.find((m) => m.id === currentMission)?.time ?? 15;
  const timer = useTimer(missionTime, phase === "chat");

  // Restore state from sessionStorage
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setPhase(saved.phase);
      setTeamName(saved.teamName);
      setMembers(saved.members);
      setDomain(saved.domain);
      setMessages(saved.messages);
      setCurrentMission(saved.currentMission);
    }
    setInitialized(true);
  }, []);

  // Persist state
  useEffect(() => {
    if (!initialized) return;
    saveState({ phase, teamName, members, domain, messages, currentMission });
  }, [phase, teamName, members, domain, messages, currentMission, initialized]);

  // Track mission changes
  useEffect(() => {
    if (messages.length > 0) {
      const detected = detectMission(messages);
      if (detected !== currentMission) {
        setCurrentMission(detected);
        timer.reset(MISSIONS.find((m) => m.id === detected)?.time ?? 15);
      }
    }
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  function addMember() {
    setMembers([...members, { name: "", type: "discovery" }]);
  }

  function removeMember(index: number) {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  }

  function updateMember(index: number, field: keyof TeamMember, value: string) {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  }

  async function sendMessage(
    content: string,
    overrides?: { domain?: string; members?: TeamMember[] }
  ) {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    const activeDomain = overrides?.domain ?? domain;
    const activeMembers = overrides?.members ?? members;

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          domain: activeDomain,
          teamMembers: activeMembers.filter((m) => m.name.trim()),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "API error");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            accumulated += parsed.text;
            setStreamingContent(accumulated);
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
              // skip parse errors from partial chunks
            }
          }
        }
      }

      setMessages([...newMessages, { role: "assistant", content: accumulated }]);
      setStreamingContent("");
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "오류가 발생했습니다. 다시 시도해주세요.",
        },
      ]);
      setStreamingContent("");
    } finally {
      setIsLoading(false);
    }
  }

  async function startGame() {
    if (!teamName.trim() || !domain) return;
    const validMembers = members.filter((m) => m.name.trim());
    if (validMembers.length === 0) return;

    const memberList = validMembers
      .map(
        (m) =>
          `${m.name} / ${FRAMEWORK_EMOJI[m.type]} ${FRAMEWORK_TYPES.find((t) => t.value === m.type)?.label}`
      )
      .join("\n");

    const domainInfo = DOMAINS.find((d) => d.key === domain);
    const initMessage = `팀 등록합니다.\n\n팀 이름: ${teamName}\n팀원:\n${memberList}\n\n선택한 도메인: ${domainInfo?.emoji} ${domainInfo?.name}\n\n게임을 시작해주세요!`;

    setPhase("chat");
    setCurrentMission(1);
    timer.reset(MISSIONS[0].time);
    await sendMessage(initMessage);
  }

  function resetGame() {
    if (!confirm("게임을 초기화하시겠습니까?")) return;
    setPhase("setup");
    setMessages([]);
    setDomain(null);
    setTeamName("");
    setMembers([{ name: "", type: "discovery" }]);
    setCurrentMission(1);
    setStreamingContent("");
    clearState();
  }

  const DEFAULT_TEAM_NAME = "PNA";
  const DEFAULT_MEMBERS: TeamMember[] = [
    { name: "Player 1", type: "discovery" },
    { name: "Player 2", type: "structure" },
    { name: "Player 3", type: "causal" },
    { name: "Player 4", type: "hypothesis" },
  ];
  const DEFAULT_DOMAIN = "A";

  function handleSystemStart() {
    if (systemPassword !== "0321") {
      setSystemError(true);
      return;
    }
    setShowSystemModal(false);
    setSystemPassword("");
    setSystemError(false);

    setTeamName(DEFAULT_TEAM_NAME);
    setMembers(DEFAULT_MEMBERS);
    setDomain(DEFAULT_DOMAIN);

    const memberList = DEFAULT_MEMBERS
      .map(
        (m) =>
          `${m.name} / ${FRAMEWORK_EMOJI[m.type]} ${FRAMEWORK_TYPES.find((t) => t.value === m.type)?.label}`
      )
      .join("\n");

    const domainInfo = DOMAINS.find((d) => d.key === DEFAULT_DOMAIN);
    const initMessage = `팀 등록합니다.\n\n팀 이름: ${DEFAULT_TEAM_NAME}\n팀원:\n${memberList}\n\n선택한 도메인: ${domainInfo?.emoji} ${domainInfo?.name}\n\n게임을 시작해주세요!`;

    setPhase("chat");
    setCurrentMission(1);
    timer.reset(MISSIONS[0].time);
    sendMessage(initMessage, { domain: DEFAULT_DOMAIN, members: DEFAULT_MEMBERS });
  }

  function exportResults() {
    const domainInfo = DOMAINS.find((d) => d.key === domain);
    const lines = [
      `# PNA 워크샵 결과 - ${teamName}`,
      `도메인: ${domainInfo?.emoji} ${domainInfo?.name}`,
      `날짜: ${new Date().toLocaleDateString("ko-KR")}`,
      "",
      "---",
      "",
    ];

    for (const msg of messages) {
      const label = msg.role === "user" ? `## [${teamName}]` : "## [GM]";
      lines.push(label);
      lines.push(msg.content);
      lines.push("");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pna-workshop-${teamName}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!initialized) return null;

  // ─── SETUP PHASE ───
  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">🎮 PNA 워크샵 챗봇</h1>
          <p className="text-gray-600">
            팀 정보를 입력하고 도메인을 선택하면 게임마스터(GM)가 워크샵을
            진행합니다.
          </p>
        </div>

        {/* Team Name */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">팀 이름</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="예: 알파팀"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
          <div className="space-y-2">
            {members.map((member, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMember(i, "name", e.target.value)}
                  placeholder="이름"
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <select
                  value={member.type}
                  onChange={(e) => updateMember(i, "type", e.target.value)}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {FRAMEWORK_TYPES.map((ft) => (
                    <option key={ft.value} value={ft.value}>
                      {FRAMEWORK_EMOJI[ft.value]} {ft.label}
                    </option>
                  ))}
                </select>
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(i)}
                    className="shrink-0 w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addMember}
            className="text-sm text-orange-600 hover:underline mt-2"
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
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  domain === d.key
                    ? "border-orange-500 shadow-sm"
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
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          게임 시작
        </button>

        {/* System Start */}
        <button
          onClick={() => {
            setShowSystemModal(true);
            setSystemPassword("");
            setSystemError(false);
          }}
          className="w-full mt-3 text-xs text-gray-400 hover:text-gray-500 transition-colors py-2"
        >
          system
        </button>

        {/* System Password Modal */}
        {showSystemModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-[var(--background)] border border-gray-300 rounded-xl p-6 w-80 shadow-xl">
              <h3 className="font-semibold text-sm mb-4">System Access</h3>
              <input
                type="password"
                value={systemPassword}
                onChange={(e) => {
                  setSystemPassword(e.target.value);
                  setSystemError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSystemStart();
                }}
                placeholder="비밀번호 입력"
                autoFocus
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  systemError ? "border-red-400" : "border-gray-300"
                }`}
              />
              {systemError && (
                <p className="text-xs text-red-500 mt-1">비밀번호가 틀렸습니다.</p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowSystemModal(false)}
                  className="flex-1 text-sm py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSystemStart}
                  className="flex-1 text-sm py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── CHAT PHASE ───
  const domainInfo = DOMAINS.find((d) => d.key === domain);

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)]">
      {/* Header */}
      <div className="border-b border-orange-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm truncate">
            🎮 {teamName} | {domainInfo?.emoji} {domainInfo?.name}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Timer */}
            <div
              className={`text-sm font-mono px-2 py-0.5 rounded ${
                timer.isExpired
                  ? "text-red-500 font-bold"
                  : timer.isWarning
                    ? "text-yellow-600 animate-pulse font-bold"
                    : "text-gray-500"
              }`}
            >
              ⏱ {timer.display}
            </div>
            <button
              onClick={exportResults}
              className="text-xs text-gray-500 hover:text-orange-600 transition-colors"
              title="결과 내보내기"
            >
              📥 내보내기
            </button>
            <button
              onClick={resetGame}
              className="text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>

        {/* Mission Progress */}
        <div className="flex gap-1 mt-2">
          {MISSIONS.map((m) => (
            <div
              key={m.id}
              className={`flex-1 text-center text-[10px] sm:text-xs py-1 rounded transition-colors ${
                m.id === currentMission
                  ? "bg-orange-500 text-white font-semibold"
                  : m.id < currentMission
                    ? "bg-orange-200 text-orange-800"
                    : "text-gray-400"
              }`}
              title={`M${m.id}: ${m.name} (${m.time}분)`}
            >
              <span className="hidden sm:inline">M{m.id} {m.name}</span>
              <span className="sm:hidden">M{m.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-orange-500 text-white"
                  : "border border-gray-300 text-inherit"
              }`}
            >
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-table:my-2 prose-hr:my-2 [&_table]:text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 border border-gray-300 text-inherit">
              <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-table:my-2 prose-hr:my-2 [&_table]:text-xs">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator (before streaming starts) */}
        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="border border-gray-300 rounded-2xl px-4 py-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-3 sm:px-4 py-3">
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
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (input.trim() && !isLoading) sendMessage(input.trim());
              }
            }}
            placeholder="팀 액션을 입력하세요..."
            rows={2}
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="self-end bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
