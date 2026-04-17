import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type EventCategory = "conference" | "workshop" | "meetup" | "study" | "social";
type EventStatus = "upcoming" | "ongoing" | "ended";

type EventDetail = {
  slug: string;
  title: string;
  category: EventCategory;
  summary: string;
  description: string;
  thumbnailUrl: string | null;
  eventDate: string;
  eventEndDate?: string;
  location: string;
  isFree: boolean;
  price?: string;
  registrationUrl?: string;
  status: EventStatus;
  galleryUrls: string[];
  reviews: { author: string; content: string; date: string }[];
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  conference: "Conference",
  workshop: "Workshop",
  meetup: "Meetup",
  study: "Study",
  social: "Social",
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  conference: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  workshop: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  meetup: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  study: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  social: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

const EVENTS_DATA: Record<string, EventDetail> = {
  "ax-lab-26-1q": {
    slug: "ax-lab-26-1q",
    title: "AX Lab — Problem Mining Framework 워크샵",
    category: "workshop",
    summary: "성장이 멈춘 제품의 문제를 발굴하고 근본 원인을 밝혀내는 팀 기반 AI 시뮬레이션 워크샵",
    description: `## 프로그램 소개

성장이 멈춘 제품을 맡았을 때, 어디서부터 손대야 할지 막막한 경험이 있나요?

AX Lab의 **Problem Mining Framework(PMF)** 워크샵에서는 AI 게임마스터와 함께 가상 도메인의 PO가 되어, 6단계에 걸쳐 문제를 발굴하고 성장 전략을 수립합니다.

## 이런 분께 추천합니다

- 프레임워크를 강의가 아니라 **체험**으로 배우고 싶은 분
- 제품의 성장 정체를 **구조적으로 진단**하고 싶은 PM/PO
- AI를 활용한 **의사결정 시뮬레이션**에 관심 있는 분

## 타임테이블

| 시간 | 내용 |
|------|------|
| 14:00 | 아이스브레이킹 — 프레임워크 유형 테스트 |
| 14:15 | 팀 구성 & 도메인 선택 |
| 14:30 | Phase 1~2: 문제 감지 & 원인 추적 |
| 15:10 | 휴식 |
| 15:20 | Phase 3~5: 문제 분해 & 탐색 & 가설 검증 |
| 16:20 | Phase 6: 종합 — 1-Pager PRD 작성 |
| 16:40 | 팀별 피칭 & 크로스 피드백 |
| 17:00 | 클로징 |

## 사용 프레임워크

S-C-Q-A · MECE / Logic Tree · TDCC · 5-Whys · XYZ 가설`,
    thumbnailUrl: "/images/about/about_1.jpeg",
    eventDate: "2026-03-21T14:00:00+09:00",
    eventEndDate: "2026-03-21T17:00:00+09:00",
    location: "서울 강남구",
    isFree: true,
    registrationUrl: undefined,
    status: "ended",
    galleryUrls: ["/images/about/about_1.jpeg", "/images/about/about_2.jpg", "/images/about/about_3.png"],
    reviews: [],
  },
  "first-penguin-career-study": {
    slug: "first-penguin-career-study",
    title: "PNA 퍼스트펭귄 이직 스터디",
    category: "study",
    summary: "경험 정리 → 공고 분석 → 이력서/포트폴리오 → 면접 연습까지, 실제 지원으로 이어지는 실행형 이직 스터디",
    description: `## 프로그램 소개

혼자서는 망설이게 되는 이직 지원… PNA에서 이직 스터디를 준비했습니다.

서로를 응원만 하는 게 아닌, **실제 지원까지 갈 수밖에 없는 실행형 스터디!** '퍼스트펭귄'처럼 첫 정리, 첫 지원, 첫 시도를 서로 밀어주는 구조로 운영합니다.

## 왜 PNA 이직 스터디인가?

- 동문 네트워크의 공통된 맥락과 신뢰를 활용해, 내 경험을 채용 시장의 언어로 정확하게 바꿔줄 수 있습니다.
- **경험 정리 → 공고 분석 → 이력서/포트폴리오 정리 → 면접 연습 → 실제 지원**까지 이어지는 흐름 안에서 커리어를 업그레이드합니다.
- 직무별 결과물은 다를 수 있지만, 공통적으로 **프로젝트를 채용 관점에서 설명하는 힘**을 기릅니다.

## 이런 분께 추천합니다

- 이력서/포트폴리오를 혼자 다듬기 어려운 분
- 실제 지원까지 밀어붙일 환경이 필요한 분
- 다양한 직무/연차의 사람들과 피드백을 주고받고 싶은 분

## 커리큘럼

### 1회차 (4/11) — 자기소개 & 경험/역량 정리
- 내 경험/성과를 정리하고, 희망 공고 기준으로 필요한 역량을 분석합니다.
- 지원에 가장 유효한 프로젝트 후보 2~3개를 추립니다.

### 2회차 (4/25) — 목표 공고 분석 & 이력서 정리
- 이력서와 자기소개 메시지를 다듬고, 나만의 핵심 역량 한 줄을 정리합니다.
- "왜 이직하는지 / 왜 이 직무인지 / 왜 이 회사인지" 스토리라인 정리

### 3회차 (5/9) — 포트폴리오/경험 시각화 1
- 직무에 맞는 포트폴리오 또는 경력 소개 자료를 제작합니다.
- 프로젝트/성과 시각화 방법 정리 및 직무별 피드백

### 4회차 (5/23) — 포트폴리오/경험 시각화 2
- 채용자 입장에서 기억에 남을 만한 셀프 브랜딩 장표 제작
- 포트폴리오 발표 연습 및 피드백

**서류 합격 시, 이어서 면접/발표 연습 & 실제 지원 점검!**

## 직무가 달라도 참여 가능한 이유

직무는 달라도 이직 준비의 핵심 과정은 비슷합니다. 이번 스터디는 **내 경험을 채용공고에 맞게 정리하고 설득력 있게 전달하는 과정**에 집중합니다. 공통 피드백과 직무별 소그룹 피드백을 함께 운영합니다.

## 운영 방식

| 항목 | 내용 |
|------|------|
| 일정 | 격주 토요일 (4/11, 4/25, 5/9, 5/23) |
| 장소 | 신촌 스터디룸 |
| 인원 | 소수 정예 약 8~10명 |
| 참가비 | 10만원 |
| 환급 | 과제 제출 포함 회차 참여 시 1회당 2만원 환급 (전체 참여 시 100% 환급) |
| 환급일 | 5월 30일 일괄 환급 |
| 필수 조건 | 4회 동안 실제 지원 1회 이상 필수 |`,
    thumbnailUrl: "/images/about/about_2.jpg",
    eventDate: "2026-04-11T14:00:00+09:00",
    eventEndDate: "2026-05-23T17:00:00+09:00",
    location: "신촌 스터디룸",
    isFree: false,
    price: "10만원 (100% 환급 가능)",
    registrationUrl: "https://forms.gle/example",
    status: "ongoing",
    galleryUrls: [],
    reviews: [],
  },
  "ai-agent-workshop-26-may": {
    slug: "ai-agent-workshop-26-may",
    title: "무조건 만드는 나만의 기획 에이전트 워크샵",
    category: "workshop",
    summary: "비용을 최소화하며 24시간 업무를 도와주는 기획 에이전트를 8시간 만에 직접 구축하는 프라이빗 워크샵",
    description: `## 프로그램 소개

10명 정원의 프라이빗 워크샵입니다. 강연자가 직접 구축한 AI 에이전트 협업 시스템 GitHub 리포지토리를 기반으로, 기획 프로세스에 집중하며 **8시간 내에 완성도 있는 산출물을 확보**합니다.

## 본 워크샵의 차별성

- **최신 AI 기획 트렌드 반영** — 철 지난 오픈소스 팔이가 아닌, 2026년 최신 기준
- **실전 산출물 확보** — 사전 준비된 기반 프로젝트 및 레퍼런스로, 8시간 만에 내 실무에 맞춰 활용할 수 있는 결과물
- **4개월간의 노하우 공개** — 여러 워크샵/강의에서 확보한 에이전트 협업, 서비스, UX/UI, 챗봇의 모든 기획/논의 과정과 개발 프롬프트 공개

## 에이전트 협업 시스템 활용 사례

- **사례 1**: 1인 개발자 수익 실현 스프린트 전략
- **사례 2**: 1인 창업가 & AI 팀 협업 툴
- **사례 3**: 상권 미래 예측 시뮬레이션

## 가격 및 신청

| 항목 | 내용 |
|------|------|
| 정가 | 8만원 |
| 할인가 | **4만원** (정기모임 참여자 50% 할인) |
| 정원 | 10명 (선착순) |
| 입금 계좌 | 카카오뱅크 7942-09-47252 정승원 (UOSPN 모임통장) |

구글 폼 제출 후 입금하시면 자동으로 참여 확정됩니다.

## 환불 정책

- 별도 안내 없을 시 취소 100% 환불
- 구체적인 환불 기준은 워크샵 일정 확정 후 추후 안내
- 최소 인원이 모이지 않을 경우 워크샵 취소 및 일괄 환불될 수 있습니다

## 참고

- 시립대 동문 이외의 참여자도 모집합니다
- 추천하고 싶은 분이 있다면 카카오톡 오픈 프로필로 연락주세요`,
    thumbnailUrl: "/images/about/about_3.png",
    eventDate: "2026-05-17T10:00:00+09:00",
    eventEndDate: "2026-05-17T18:00:00+09:00",
    location: "서울 (추후 안내)",
    isFree: false,
    price: "4만원 (정가 8만원)",
    registrationUrl: "https://forms.gle/example",
    status: "upcoming",
    galleryUrls: [],
    reviews: [],
  },
  "uospn-yearend-2025": {
    slug: "uospn-yearend-2025",
    title: "2025 UOSPN 송년회 — 1인 창업 시대, 모두의 바이브코딩",
    category: "conference",
    summary: "외부 연사 2인 초청 세미나 + 네트워킹 파티. 바이브코딩 6-Pager 제작기, AI 시대 기획 트렌드",
    description: `## 프로그램 소개

2025년 UOSPN 송년회는 처음으로 외부 연사 두 분을 모시고, 세미나와 네트워킹 파티를 함께 진행했습니다.

## 세미나 세션

### 바이브코딩으로 6-Pager 작성 툴 제작기
- 연사: 정경진, 데이터방앗간 CEO
- 초기 개발 설정 및 리팩토링 과정에서의 시행착오와 롤백 경험, PMF 검증에 대한 실용적인 노하우

### AI 시대 기획 트렌드
- 연사: 정재용(당근대장), 더크림유니언 AX Lab 디렉터
- AI를 대하는 기존의 관념에서 벗어나 효과적으로 기술을 활용할 수 있는 다각적 관점, 향후 5년 AI 기술 변화 예측 인사이트

## 타임테이블

| 시간 | 내용 |
|------|------|
| 15:30 | 아이스브레이킹 — 자기소개 |
| 16:00 | 세션 1: 바이브코딩으로 6-Pager 작성 툴 제작기 |
| 16:50 | 세션 2: AI 시대 기획 트렌드 |
| 17:30 | 저녁 식사 이동 |
| 18:00 | 자유 네트워킹 파티 |

## 결과

- 세미나 만족도: 평균 4.4/5
- 재참여 의사: 평균 4.6/5
- 참가자 17명`,
    thumbnailUrl: null,
    eventDate: "2025-12-06T15:30:00+09:00",
    eventEndDate: "2025-12-06T20:00:00+09:00",
    location: "마루360 (서울 강남구 역삼로 172)",
    isFree: false,
    price: "4만원 (저녁 포함)",
    status: "ended",
    galleryUrls: [],
    reviews: [],
  },
  "prototype-workshop-25-3q": {
    slug: "prototype-workshop-25-3q",
    title: "AI 시대의 Prototype, 프로덕트 직무의 새 역할",
    category: "workshop",
    summary: "프로토타입 제작 역량과 AI 툴 활용 방안을 탐색하는 워크샵. 0→1 vs 1→10 단계별 접근",
    description: `## 프로그램 소개

프로덕트 분야의 동료들이 함께 모여, 더 나은 결과를 위해 치열하게 고민해온 과정을 나누는 자리입니다.

## 워크샵 구성

### 1. 문제 공감
실무에서 겪고 있는 현실적인 문제를 깊게 탐색합니다. 표면적인 현상에서 대화를 통해 근원적인 달성 목표를 문제 정의합니다.

### 2. 아이디에이션
정의한 문제에 대해 활용할 수 있는 AI 도구와 방안을 탐색합니다.

### 3. 솔루션 도출
보안, 예산, 리소스, 조직 문화 등을 종합적으로 고려하여, 현실적으로 실무에서 활용할 수 있는 MVP 형태를 구체화합니다.

### 4. 워크샵 이후
각자 MVP를 만들어볼 수 있는 방법과 관련 도구의 활용 노하우를 담은 실무 툴킷을 제작하여 공유합니다.

## 주요 토론 주제

- PM/디자이너로서 역할이 확대되고 있다고 느끼시나요?
- 프로토타입 결과가 실제 개발·시장 적용으로 이어지지 못한 이유는?
- 0→1에서는 어떤 툴이 가장 유용할까요? 1→10에서는?
- 향후 3년 안에 PM·Product Designer에게 가장 중요한 역량은?`,
    thumbnailUrl: null,
    eventDate: "2025-09-05T15:30:00+09:00",
    eventEndDate: "2025-09-05T17:30:00+09:00",
    location: "서울",
    isFree: true,
    status: "ended",
    galleryUrls: [],
    reviews: [],
  },
  "seminar-25-2q": {
    slug: "seminar-25-2q",
    title: "25-2분기 정기 세미나 — 현실 너머, 나의 고민을 그리는 여정",
    category: "meetup",
    summary: "네트워킹을 통한 커리어 개발, 사이드 프로젝트, 포트폴리오 제작 노하우 등 4인 발표",
    description: `## 프로그램 소개

일하는 누구나 한 번쯤 그려본 '아이디어와 목표'를 현실 속에서 실현하기 위해 어떤 과정을 거쳐왔는지 서로의 여정을 들려주고 나눕니다.

## 발표 주제

### 네트워킹을 통한 커리어 개발
- 정승원 · UOSPN
- UOSPN의 네트워크 구성과 추천 채용 사례

### 퇴근하고 사이드 프로젝트하는 사람들
- 우채윤 · 시대생

### 스피커가 되는 시대인
- 정희윤 · 그릿스탠다드

### 프로덕트 포트폴리오 잘 만드는 법
- 최희준 · 장밋빛오션
- 수 차례 전문 컨설팅을 받으며 깨달은 포트폴리오 제작 노하우

## 이런 분들에게 추천해요

- 작지만 강력한 문제의식을 공유하고 싶은 분
- 기업가 정신을 키우고 싶은 분
- 동료들의 피드백과 아이디어를 나누고 싶은 분`,
    thumbnailUrl: null,
    eventDate: "2025-06-14T15:30:00+09:00",
    eventEndDate: "2025-06-14T17:30:00+09:00",
    location: "서울",
    isFree: true,
    status: "ended",
    galleryUrls: [],
    reviews: [],
  },
  "social-25-1q": {
    slug: "social-25-1q",
    title: "친목 모임",
    category: "social",
    summary: "UOSPN 멤버 간 자유 네트워킹 및 친목 모임",
    description: `## 프로그램 소개

UOSPN 멤버들이 편안한 분위기에서 서로를 알아가는 자유 네트워킹 모임입니다. 직무 이야기부터 일상까지, 동문이라는 공통점 위에서 자연스럽게 대화를 나눕니다.`,
    thumbnailUrl: null,
    eventDate: "2025-03-28T19:00:00+09:00",
    location: "서울",
    isFree: true,
    status: "ended",
    galleryUrls: [],
    reviews: [],
  },
  "first-meetup-yearend-2024": {
    slug: "first-meetup-yearend-2024",
    title: "첫 오프라인 모임 - 송년회",
    category: "social",
    summary: "UOSPN 첫 번째 오프라인 모임. 동문 프로덕트 직군 네트워킹의 시작",
    description: `## 프로그램 소개

UOSPN의 첫 번째 오프라인 모임입니다. 서울시립대학교 동문 프로덕트 직군이 처음으로 한자리에 모여, 서로의 존재를 확인하고 네트워크의 시작을 알렸습니다.`,
    thumbnailUrl: null,
    eventDate: "2024-12-14T15:00:00+09:00",
    location: "서울",
    isFree: true,
    status: "ended",
    galleryUrls: [],
    reviews: [],
  },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function formatDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { weekday: "short" });
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = EVENTS_DATA[slug];
  if (!event) return { title: "Not Found | PNA" };

  return {
    title: `${event.title} | PNA Events`,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
      images: event.thumbnailUrl ? [event.thumbnailUrl] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = EVENTS_DATA[slug];
  if (!event) notFound();

  const isEnded = event.status === "ended";
  const isUpcoming = event.status === "upcoming";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <Link href="/events" className="text-sm text-gray-400 hover:text-orange-500 mb-4 inline-block">
        &larr; Events
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[event.category]}`}>
            {CATEGORY_LABELS[event.category]}
          </span>
          {isEnded && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              종료됨
            </span>
          )}
          {isUpcoming && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              모집 중
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          {event.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{event.summary}</p>
      </div>

      {/* Info bar */}
      <div
        className="flex flex-wrap gap-4 p-4 rounded-lg mb-8 text-sm"
        style={{ background: "var(--surface-secondary)", color: "var(--text-secondary)" }}
      >
        <div className="flex items-center gap-1.5">
          <span>📅</span>
          <span>{formatDate(event.eventDate)} ({formatDayOfWeek(event.eventDate)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🕐</span>
          <span>{formatTime(event.eventDate)}{event.eventEndDate ? ` ~ ${formatTime(event.eventEndDate)}` : ""}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>💰</span>
          <span>{event.isFree ? "무료" : event.price || "유료"}</span>
        </div>
      </div>

      {/* CTA */}
      {isUpcoming && event.registrationUrl && (
        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors mb-8"
        >
          신청하기
        </a>
      )}
      {isEnded && (
        <div className="w-full text-center py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm mb-8">
          이 행사는 종료되었습니다.
        </div>
      )}

      {/* Description (markdown-like) */}
      <div
        className="prose prose-sm dark:prose-invert max-w-none mb-10"
        style={{ color: "var(--text-primary)" }}
        dangerouslySetInnerHTML={{ __html: markdownToHtml(event.description) }}
      />

      {/* Gallery */}
      {event.galleryUrls.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            갤러리
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-lg overflow-hidden">
            {event.galleryUrls.map((url, i) => (
              <div key={i} className="relative aspect-[4/3]">
                <Image
                  src={url}
                  alt={`${event.title} 사진 ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          참가자 후기
        </h2>
        {event.reviews.length > 0 ? (
          <div className="space-y-4">
            {event.reviews.map((review, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border"
                style={{ borderColor: "var(--border-light)", background: "var(--surface-secondary)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {review.author}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {review.date}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">아직 후기가 없습니다.</p>
        )}
      </section>

      {/* Related link */}
      {event.slug === "ax-lab-26-1q" && (
        <div
          className="p-4 rounded-lg border text-sm"
          style={{ borderColor: "var(--border-light)", background: "var(--surface-secondary)" }}
        >
          <span style={{ color: "var(--text-secondary)" }}>이 워크샵의 AI 시뮬레이션 도구를 보려면 </span>
          <Link href="/26-1q-workshop" className="text-orange-500 hover:underline font-semibold">
            AX Lab
          </Link>
          <span style={{ color: "var(--text-secondary)" }}> 페이지를 확인하세요.</span>
        </div>
      )}
    </div>
  );
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-6 mb-2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\| (.+)$/gm, (line) => {
      const cells = line.split("|").filter(Boolean).map((c) => c.trim());
      const tds = cells.map((c) => `<td class="border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm">${c}</td>`).join("");
      return `<tr>${tds}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, (block) => `<table class="w-full border-collapse mb-4">${block}</table>`)
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm mb-1">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, (block) => `<ul class="mb-4">${block}</ul>`)
    .replace(/\n\n/g, '<br class="mb-2" />')
    .replace(/\n/g, "");
}
