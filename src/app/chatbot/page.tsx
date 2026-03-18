"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import Avatar, { genConfig } from "react-nice-avatar";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Phase = "setup" | "chat";
type Message = { role: "user" | "assistant"; content: string };
type TeamMember = { name: string; type: string };

type GameState = {
  phase: Phase;
  teamName: string;
  members: TeamMember[];
  domain: string | null;
  messages: Message[];
  currentPhase: number;

  sessionId: string | null;
  currentStageKey: string;
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
  { key: "A", emoji: "💳", name: "페이플로(PayFlo)", desc: "핀테크 간편결제 — Activation→Retention 병목" },
  { key: "B", emoji: "🥬", name: "프레시마켓(FreshMarket)", desc: "이커머스 멤버십 — Revenue 전환율 저조" },
  { key: "C", emoji: "🎬", name: "클립비(ClipB)", desc: "숏폼 플랫폼 — 양면 Growth Loop 붕괴" },
  { key: "D", emoji: "📊", name: "애드포커스(AdFocus)", desc: "광고 SaaS — B2B Acquisition 둔화" },
];

const PHASES = [
  { id: 1, name: "문제 감지", time: 15 },
  { id: 2, name: "문제 탐색", time: 15 },
  { id: 3, name: "문제 분해", time: 15 },
  { id: 4, name: "원인 추적", time: 20 },
  { id: 5, name: "가설 검증", time: 25 },
  { id: 6, name: "종합", time: 15 },
];

type VipInfo = {
  emoji: string;
  name: string;
  role: string;
  concern: string;
  avatarSeed: string;
  sex: "man" | "woman";
  /** 이 VIP가 메인으로 등장하는 Phase ID 목록 */
  mainPhases: number[];
  raiseActions: string;
  lowerActions: string;
  initialComment: string;
};
type MetricTrend = {
  label: string;
  value: string;
  trend: [string, string, string, string]; // 3개월 전, 2개월 전, 1개월 전, 현재
};
type DomainDetail = {
  vips: VipInfo[];
  metrics: MetricTrend[];
};

const DOMAIN_INFO: Record<string, DomainDetail> = {
  A: {
    vips: [
      { emoji: "👔", name: "박진호", role: "대표", concern: "MAU 성장, 투자 스토리", avatarSeed: "parkjinho-ceo", sex: "man", mainPhases: [1, 6], raiseActions: "성장 루프 확장, 공격적 KPI", lowerActions: "보수적 전략", initialComment: "MAU가 3개월째 제자리입니다. 투자 미팅이 다음 달인데..." },
      { emoji: "👩‍💼", name: "이수연", role: "가맹점 대표", concern: "가맹점 매출, 수수료", avatarSeed: "leesuyeon-store", sex: "woman", mainPhases: [4, 5], raiseActions: "가맹점 혜택 강화", lowerActions: "유저만 우대", initialComment: "가맹점을 2배 늘렸는데 왜 매출은 그대로죠? 수수료만 나가요." },
      { emoji: "📱", name: "김도윤", role: "파워유저", concern: "리워드, UX, 속도", avatarSeed: "kimdoyun-user", sex: "man", mainPhases: [2, 3], raiseActions: "UX·리워드 개선", lowerActions: "리워드 축소", initialComment: "요즘 리워드가 줄었어요. 다른 페이 앱도 써보기 시작했습니다." },
    ],
    metrics: [
      { label: "MAU", value: "42만", trend: ["44만", "43만", "42.5만", "42만"] },
      { label: "DAU", value: "8.2만", trend: ["9.1만", "8.8만", "8.5만", "8.2만"] },
      { label: "일 신규 유입", value: "1,400명", trend: ["1,700명", "1,600명", "1,500명", "1,400명"] },
      { label: "월 이탈률", value: "~10%", trend: ["7.8%", "8.5%", "9.2%", "10%"] },
      { label: "가맹점", value: "12,000개", trend: ["10,800개", "11,200개", "11,600개", "12,000개"] },
      { label: "리텐션 M1", value: "48%", trend: ["54%", "52%", "50%", "48%"] },
    ],
  },
  B: {
    vips: [
      { emoji: "👔", name: "한지원", role: "CFO", concern: "멤버십 매출, LTV, 유료 전환율", avatarSeed: "hanjiwon-cfo", sex: "woman", mainPhases: [1, 6], raiseActions: "수익성 개선, 멤버십 확대", lowerActions: "무료 확대, 비용 증가", initialComment: "비멤버 89%가 3개월 내 이탈. 마케팅비를 태우는 거나 같아요." },
      { emoji: "🛒", name: "최예린", role: "비멤버 유저", concern: "무료 체험, 큐레이션 정확도", avatarSeed: "choiyerin-user", sex: "woman", mainPhases: [2, 3], raiseActions: "무료 체험 혜택, 큐레이션 강화", lowerActions: "무료 기능 축소", initialComment: "첫 주문은 해봤는데, 매달 4,900원 낼 이유를 모르겠어요." },
      { emoji: "🌾", name: "박소미", role: "농가 대표", concern: "공정 노출, 수수료", avatarSeed: "parksomi-farm", sex: "woman", mainPhases: [4, 5], raiseActions: "소규모 농가 우선 노출", lowerActions: "대형 브랜드만 우대", initialComment: "대형 브랜드만 상단이에요. 소규모 농가는 노출이 안 됩니다." },
    ],
    metrics: [
      { label: "MAU", value: "18만", trend: ["20만", "19.5만", "18.8만", "18만"] },
      { label: "유료 멤버", value: "1.44만", trend: ["1.6만", "1.56만", "1.50만", "1.44만"] },
      { label: "멤버 M3 리텐션", value: "68%", trend: ["74%", "72%", "70%", "68%"] },
      { label: "비멤버 M3 리텐션", value: "12%", trend: ["16%", "15%", "13%", "12%"] },
      { label: "일 신규 유입", value: "950명", trend: ["1,200명", "1,100명", "1,020명", "950명"] },
      { label: "비멤버 이탈률", value: "2.8%/일", trend: ["2.0%/일", "2.2%/일", "2.5%/일", "2.8%/일"] },
    ],
  },
  C: {
    vips: [
      { emoji: "👔", name: "정민규", role: "대표", concern: "DAU, 시청 시간, 글로벌", avatarSeed: "jeongminkyu-ceo", sex: "man", mainPhases: [1, 6], raiseActions: "성장 지표 개선, 글로벌 진출", lowerActions: "보수적 전략, 비용 증가만", initialComment: "시청 시간이 떨어지고 있어요. 글로벌 진출을 준비해야 하는데..." },
      { emoji: "🎬", name: "한새별", role: "탑 크리에이터", concern: "수익 분배, 알고리즘", avatarSeed: "hansaebyeol-creator", sex: "woman", mainPhases: [4, 5], raiseActions: "수익 분배 인상, 창작 도구 제공", lowerActions: "알고리즘 편향, 수익 동결", initialComment: "경쟁 플랫폼에서 독점 계약 제안이 왔어요. 수익 분배를 재고해주셔야..." },
      { emoji: "📱", name: "이하은", role: "Z세대 시청자", concern: "추천 다양성, 커뮤니티", avatarSeed: "leehaeun-viewer", sex: "woman", mainPhases: [2, 3], raiseActions: "추천 다양성, 커뮤니티 기능", lowerActions: "상위 크리에이터만 노출", initialComment: "요즘 매번 비슷한 영상만 떠서 좀 지루해졌어요." },
    ],
    metrics: [
      { label: "시청자 MAU", value: "85만", trend: ["98만", "95만", "90만", "85만"] },
      { label: "크리에이터 MAU", value: "1.2만", trend: ["1.6만", "1.5만", "1.35만", "1.2만"] },
      { label: "시청 시간", value: "38분/일", trend: ["48분/일", "45분/일", "42분/일", "38분/일"] },
      { label: "업로드", value: "4,200건/일", trend: ["5,800건/일", "5,400건/일", "4,800건/일", "4,200건/일"] },
      { label: "시청자 이탈률", value: "1.4%/일", trend: ["0.7%/일", "0.9%/일", "1.1%/일", "1.4%/일"] },
      { label: "수익 분배율", value: "40%", trend: ["40%", "40%", "40%", "40%"] },
    ],
  },
  D: {
    vips: [
      { emoji: "👔", name: "윤석진", role: "대표", concern: "ARR, 엔터프라이즈 레퍼런스", avatarSeed: "yoonseokjin-ceo", sex: "man", mainPhases: [1, 6], raiseActions: "엔터프라이즈 확대, 글로벌 진출", lowerActions: "SMB만 유지", initialComment: "ARR 100억 달성하려면 엔터프라이즈를 뚫어야 합니다." },
      { emoji: "🏪", name: "강다은", role: "고객사 마케터", concern: "ROAS, 대시보드, CS", avatarSeed: "kangdaeun-marketer", sex: "woman", mainPhases: [4, 5], raiseActions: "기능 개선, CS 강화", lowerActions: "엔터프라이즈만 신경, SMB 무시", initialComment: "대시보드 로딩이 느려요. 메타 데이터도 하루 늦게 반영되고요." },
      { emoji: "📊", name: "김준", role: "Meta 파트너", concern: "API 정책, 데이터 정합성", avatarSeed: "kimjun-partner", sex: "man", mainPhases: [2, 3], raiseActions: "API 정합성 개선, 정책 준수", lowerActions: "API 정책 무시, 데이터 불일치 방치", initialComment: "API v19 전환 기한이 2개월 남았습니다. 미대응 시 연동 중단됩니다." },
    ],
    metrics: [
      { label: "활성 고객사", value: "340개사", trend: ["298개사", "310개사", "325개사", "340개사"] },
      { label: "월 신규 도입", value: "25개사", trend: ["32개사", "30개사", "28개사", "25개사"] },
      { label: "월 이탈", value: "3개사", trend: ["1개사", "2개사", "2개사", "3개사"] },
      { label: "ARPU", value: "월 89만원", trend: ["월 94만원", "월 92만원", "월 90만원", "월 89만원"] },
      { label: "TAM", value: "~2,000개사", trend: ["2,000개사", "2,000개사", "2,000개사", "2,000개사"] },
      { label: "핵심 타겟", value: "~800개사", trend: ["800개사", "800개사", "800개사", "800개사"] },
    ],
  },
};

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

function detectPhase(messages: Message[]): number {
  let phase = 1;
  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    const match = msg.content.match(/Phase\s*(\d)/i);
    if (match) {
      const n = parseInt(match[1]);
      if (n > phase && n <= 6) phase = n;
    }
  }
  return phase;
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
  const [currentPhase, setCurrentPhase] = useState(1);
  const [streamingContent, setStreamingContent] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStageKey, setCurrentStageKey] = useState("P1");
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [selectedVip, setSelectedVip] = useState<VipInfo | null>(null);
  const [systemPassword, setSystemPassword] = useState("");
  const [systemError, setSystemError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  const phaseTime = PHASES.find((p) => p.id === currentPhase)?.time ?? 15;
  const timer = useTimer(phaseTime, phase === "chat");

  // Restore state
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setPhase(saved.phase);
      setTeamName(saved.teamName);
      setMembers(saved.members);
      setDomain(saved.domain);
      setMessages(saved.messages);
      setCurrentPhase(saved.currentPhase);
      setSessionId(saved.sessionId);
      setCurrentStageKey(saved.currentStageKey);
    }
    setInitialized(true);
  }, []);

  // Persist state
  useEffect(() => {
    if (!initialized) return;
    saveState({
      phase, teamName, members, domain, messages, currentPhase, sessionId,
      currentStageKey,
    });
  }, [phase, teamName, members, domain, messages, currentPhase, sessionId, currentStageKey, initialized]);

  // Track phase changes
  useEffect(() => {
    if (messages.length > 0) {
      const detected = detectPhase(messages);
      if (detected !== currentPhase) {
        setCurrentPhase(detected);
        setCurrentStageKey(`P${detected}`);
        timer.reset(PHASES.find((p) => p.id === detected)?.time ?? 15);
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

  function fixMarkdownBold(text: string): string {
    // 기호/이모지 바로 뒤에 **가 붙어있으면 공백 삽입: 🚨**text** → 🚨 **text**
    // 기호/이모지: 이모지, 괄호, 따옴표 등 비문자/비공백 뒤에 ** 시작
    let result = text.replace(/([^\s\w*])(\*\*)/g, '$1 $2');
    // **가 닫힌 뒤 기호/이모지가 바로 붙어있으면 공백 삽입: **text**🚨 → **text** 🚨
    result = result.replace(/(\*\*)([^\s\w*])/g, '$1 $2');
    return result;
  }

  async function sendMessage(
    content: string,
    overrides?: { domain?: string; members?: TeamMember[]; sessionId?: string; stageKey?: string }
  ) {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    const activeDomain = overrides?.domain ?? domain;
    const activeMembers = overrides?.members ?? members;
    const activeSessionId = overrides?.sessionId ?? sessionId;
    const activeStageKey = overrides?.stageKey ?? currentStageKey;

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          domain: activeDomain,
          teamMembers: activeMembers.filter((m) => m.name.trim()),
          sessionId: activeSessionId,
          currentStage: activeStageKey,
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

            if (parsed.stage) {
              setCurrentStageKey(parsed.stage);
            }

            if (parsed.text) {
              accumulated += parsed.text;
              setStreamingContent(fixMarkdownBold(accumulated));
            }
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
              // skip parse errors from partial chunks
            }
          }
        }
      }

      setMessages([...newMessages, { role: "assistant", content: fixMarkdownBold(accumulated) }]);
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
          `${m.name} / ${FRAMEWORK_EMOJI[m.type]} ${FRAMEWORK_TYPES.find((t) => t.value === m.type)?.label
          }`
      )
      .join("\n");

    const domainInfo = DOMAINS.find((d) => d.key === domain);
    const initMessage = `팀 등록합니다.\n\n팀 이름: ${teamName}\n팀원:\n${memberList}\n\n선택한 도메인: ${domainInfo?.emoji} ${domainInfo?.name}\n\n게임을 시작해주세요!`;

    try {
      const sessionRes = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          domain,
        }),
      });

      if (!sessionRes.ok) {
        const data = await sessionRes.json();
        throw new Error(data.error || "세션 생성 실패");
      }

      const sessionData = await sessionRes.json();

      const newSessionId = sessionData.sessionId;
      const newStageKey = sessionData.currentStage || "P1";

      setSessionId(newSessionId);
      setCurrentStageKey(newStageKey);

      setPhase("chat");
      setCurrentPhase(1);
      timer.reset(PHASES[0].time);

      await sendMessage(initMessage, { sessionId: newSessionId, stageKey: newStageKey });
    } catch (err) {
      console.error(err);
      alert("게임 세션을 시작하지 못했습니다. 다시 시도해주세요.");
    }
  }

  function resetGame() {
    if (!confirm("게임을 초기화하시겠습니까?")) return;
    setPhase("setup");
    setMessages([]);
    setDomain(null);
    setTeamName("");
    setMembers([{ name: "", type: "discovery" }]);
    setCurrentPhase(1);
    setStreamingContent("");
    setSessionId(null);
    setCurrentStageKey("P1");
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

  async function handleSystemStart() {
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
          `${m.name} / ${FRAMEWORK_EMOJI[m.type]} ${FRAMEWORK_TYPES.find((t) => t.value === m.type)?.label
          }`
      )
      .join("\n");

    const domainInfo = DOMAINS.find((d) => d.key === DEFAULT_DOMAIN);
    const initMessage = `팀 등록합니다.\n\n팀 이름: ${DEFAULT_TEAM_NAME}\n팀원:\n${memberList}\n\n선택한 도메인: ${domainInfo?.emoji} ${domainInfo?.name}\n\n게임을 시작해주세요!`;

    try {
      const sessionRes = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: DEFAULT_TEAM_NAME,
          domain: DEFAULT_DOMAIN,
        }),
      });

      if (!sessionRes.ok) {
        const data = await sessionRes.json();
        throw new Error(data.error || "세션 생성 실패");
      }

      const sessionData = await sessionRes.json();

      const newSessionId = sessionData.sessionId;
      const newStageKey = sessionData.currentStage || "P1";

      setSessionId(newSessionId);
      setCurrentStageKey(newStageKey);

      setPhase("chat");
      setCurrentPhase(1);
      timer.reset(PHASES[0].time);

      await sendMessage(initMessage, {
        domain: DEFAULT_DOMAIN,
        members: DEFAULT_MEMBERS,
        sessionId: newSessionId,
        stageKey: newStageKey,
      });
    } catch (err) {
      console.error(err);
      alert("시스템 시작 중 오류가 발생했습니다.");
    }
  }

  function exportResults() {
    const domainInfo = DOMAINS.find((d) => d.key === domain);
    const lines = [
      `# Product Autopsy 결과 - ${teamName}`,
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
    a.download = `product-autopsy-${teamName}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!initialized) return null;

  // ─── SETUP PHASE ───
  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">🏥 Product Autopsy</h1>
          <p className="text-gray-600">
            성장이 멈춘 제품을 부검하여 근본 원인을 밝혀내는 팀 기반 시뮬레이션 게임입니다.
            팀 정보를 입력하고 도메인을 선택하세요.
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
                className={`text-left p-4 rounded-lg border-2 transition-all ${domain === d.key
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
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${systemError ? "border-red-400" : "border-gray-300"
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
  const domainDetail = domain ? DOMAIN_INFO[domain] : null;

  return (
    <div
      className="fixed inset-0 top-[40px] flex flex-col overflow-hidden z-10 bg-[var(--background)]"
      style={{
        paddingLeft: 40,
        paddingRight: 40,
      }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm truncate">
            🏥 {teamName} | {domainInfo?.emoji} {domainInfo?.name}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Timer */}
            <div
              className={`text-sm font-mono px-2 py-0.5 rounded ${timer.isExpired
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

        {/* Phase Progress */}
        <div className="flex gap-1 mt-2">
          {PHASES.map((p) => (
            <div
              key={p.id}
              className={`flex-1 text-center text-[10px] sm:text-xs py-1 rounded transition-colors ${p.id === currentPhase
                ? "bg-orange-500 text-white font-semibold"
                : p.id < currentPhase
                  ? "bg-orange-200 text-orange-800"
                  : "text-gray-400"
                }`}
              title={`P${p.id}: ${p.name} (${p.time}분)`}
            >
              <span className="hidden sm:inline">P{p.id} {p.name}</span>
              <span className="sm:hidden">P{p.id}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content: sidebar + chat */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar (1/3) */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col overflow-y-auto">
          {/* VIP Section */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">핵심 이해관계자</h3>
            <div className="space-y-2">
              {domainDetail?.vips.map((vip, i) => {
                const isMain = vip.mainPhases.includes(currentPhase);
                const config = genConfig(vip.avatarSeed);
                return (
                  <div key={i} className="cursor-pointer" onClick={() => setSelectedVip(vip)}>
                    {isMain ? (
                      <div className="rounded-xl border border-gray-200 p-3 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/40 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-[108px] h-[108px] shrink-0 rounded-lg" shape="rounded" {...config} />
                          <div className="flex-1 min-w-0 py-0.5">
                            <div className="font-bold text-sm">{vip.name}</div>
                            <div className="text-xs text-gray-500">{vip.role}</div>
                            <div className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                              {vip.concern}
                            </div>
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-500">만족도</span>
                              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: "50%" }} />
                              </div>
                              <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-gray-400">50</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 px-3 py-1.5 flex items-center gap-2 opacity-40 hover:opacity-60 transition-opacity">
                        <span className="text-[10px] text-gray-500">{vip.role}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Situation Data Section */}
          <div className="p-4 flex-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">상황 데이터</h3>
            {domainDetail && (
              <div className="space-y-2">
                {domainDetail.metrics.map((m, i) => (
                  <div key={i} className="flex justify-between items-baseline text-sm">
                    <span className="text-gray-500 text-xs">{m.label}</span>
                    <span className="font-medium text-xs">{m.value}</span>
                  </div>
                ))}
                <button
                  onClick={() => setShowTrendModal(true)}
                  className="w-full mt-3 text-xs font-medium py-1.5 rounded-lg border transition-colors"
                  style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}
                >
                  자세히 보기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Chat Area (2/3) */}
        <div className="w-2/3 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user"
                    ? "bg-orange-500 text-white"
                    : "border border-gray-300 chat-assistant"
                    }`}
                >
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-wrap leading-relaxed" style={{ fontSize: 16 }}>
                      {msg.content}
                    </div>
                  ) : (
                    <Streamdown
                      controls={false}
                      className="prose dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-table:my-2 prose-hr:my-2 text-base text-gray-900 dark:text-gray-100"
                      mode="static"
                    >
                      {msg.content}
                    </Streamdown>
                  )}
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 border border-gray-300 chat-assistant">
                  <Streamdown
                    className="prose dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-table:my-2 prose-hr:my-2 text-base text-gray-900 dark:text-gray-100"
                    mode="streaming"
                  >
                    {streamingContent}
                  </Streamdown>
                </div>
              </div>
            )}

            {/* Loading indicator */}
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
          <div className="border-t border-gray-200 px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim() && !isLoading) sendMessage(input.trim());
              }}
              className="flex gap-2"
            >
              <textarea
                ref={(el) => {
                  if (el) {
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 200) + "px";
                  }
                }}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 200) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) sendMessage(input.trim());
                  }
                }}
                placeholder="팀 액션을 입력하세요..."
                rows={3}
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 [&]:scrollbar-none [&]:[-ms-overflow-style:none] [&]:[-webkit-overflow-scrolling:touch]"
                style={{ fontSize: 16, maxHeight: 200, overflowY: "auto", scrollbarWidth: "none" }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="self-end bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 disabled:cursor-not-allowed transition-colors font-semibold"
                style={{
                  ...((!input.trim() || isLoading) ? {
                    backgroundColor: 'var(--btn-disabled-bg)',
                    color: 'var(--btn-disabled-text)',
                  } : {}),
                  fontSize: 16,
                }}
              >
                전송
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Trend Modal */}
      {showTrendModal && domainDetail && (() => {
        const parseNum = (s: string) => {
          const m = s.match(/([\d,.]+)/);
          return m ? parseFloat(m[1].replace(/,/g, '')) : 0;
        };
        const months = ['3개월 전', '2개월 전', '1개월 전', '현재'];
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowTrendModal(false)}>
            <div
              className="rounded-xl border shadow-lg w-[95%] max-w-2xl max-h-[90vh] overflow-y-auto p-6"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-default)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>3개월 추이</h2>
                <button onClick={() => setShowTrendModal(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>
              <div className="space-y-8">
                {domainDetail.metrics.map((m, i) => {
                  const chartData = months.map((month, j) => ({
                    month,
                    value: parseNum(m.trend[j]),
                    label: m.trend[j],
                  }));
                  const first = chartData[0].value;
                  const last = chartData[3].value;
                  const changeRate = first !== 0 ? ((last - first) / first) * 100 : 0;
                  const changeStr = changeRate === 0 ? '0%' : `${changeRate > 0 ? '+' : ''}${changeRate.toFixed(1)}%`;
                  const changeColor = changeRate > 0 ? '#22c55e' : changeRate < 0 ? '#ef4444' : 'var(--text-muted)';
                  return (
                    <div key={i}>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{m.label}</span>
                        <span className="text-sm font-bold" style={{ color: changeColor }}>{changeStr}</span>
                      </div>
                      <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                          <YAxis hide domain={['dataMin - dataMin * 0.1', 'dataMax + dataMax * 0.1']} />
                          <Tooltip
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(_v: any, _n: any, entry: any) => [entry?.payload?.label ?? _v, m.label]}
                            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 13 }}
                            labelStyle={{ color: 'var(--text-secondary)' }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#f97316"
                            strokeWidth={2.5}
                            dot={{ r: 5, fill: '#f97316', strokeWidth: 0 }}
                            activeDot={{ r: 7, fill: '#f97316' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* VIP Detail Modal */}
      {selectedVip && (() => {
        const config = genConfig(selectedVip.avatarSeed);
        const isActive = selectedVip.mainPhases.includes(currentPhase);
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setSelectedVip(null)}>
            <div
              className="rounded-xl border shadow-lg w-[90%] max-w-md p-5"
              style={{ background: 'var(--surface)', borderColor: 'var(--border-default)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14 shrink-0" shape="circle" {...config} />
                  <div>
                    <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{selectedVip.name}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedVip.role}</div>
                    {isActive && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-medium">
                        현재 활성
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedVip(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg p-3" style={{ background: 'var(--surface-secondary)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>첫 마디</div>
                  <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>
                    &ldquo;{selectedVip.initialComment}&rdquo;
                  </p>
                </div>

                <div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>관심사</div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedVip.concern}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3 border" style={{ borderColor: '#22c55e33', background: '#22c55e0a' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: '#22c55e' }}>만족도 상승</div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedVip.raiseActions}</p>
                  </div>
                  <div className="rounded-lg p-3 border" style={{ borderColor: '#ef444433', background: '#ef44440a' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: '#ef4444' }}>만족도 하락</div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{selectedVip.lowerActions}</p>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>등장 Phase</div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map((p) => (
                      <span
                        key={p}
                        className="text-xs font-mono px-2 py-0.5 rounded"
                        style={{
                          background: selectedVip.mainPhases.includes(p) ? 'var(--brand-primary)' : 'var(--surface-secondary)',
                          color: selectedVip.mainPhases.includes(p) ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        P{p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
