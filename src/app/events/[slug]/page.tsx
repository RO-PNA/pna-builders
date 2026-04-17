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
  "pna-monthly-apr-2026": {
    slug: "pna-monthly-apr-2026",
    title: "PNA Monthly — 4월 정기모임",
    category: "meetup",
    summary: "프로덕트 직군 동문 네트워킹 정기모임. AI 트렌드 공유 및 자유 네트워킹",
    description: `## 프로그램 소개

매월 마지막 금요일, PNA 멤버들이 모여 최근 프로덕트·AI 트렌드를 공유하고 네트워킹하는 정기모임입니다.

## 프로그램 구성

| 시간 | 내용 |
|------|------|
| 19:00 | 오프닝 & 아이스브레이킹 |
| 19:20 | 라이트닝 토크 (2-3명, 각 10분) |
| 20:00 | 자유 네트워킹 |
| 21:00 | 클로징 |

## 이번 달 토크 주제

- AI Agents 실무 적용기
- 사이드 프로젝트에서 PMF 찾기

누구나 참여 가능합니다. 대학 동문 프로덕트 직군이라면 환영합니다.`,
    thumbnailUrl: "/images/about/about_2.jpg",
    eventDate: "2026-04-25T19:00:00+09:00",
    eventEndDate: "2026-04-25T21:00:00+09:00",
    location: "서울 성수동",
    isFree: true,
    registrationUrl: "https://forms.gle/example",
    status: "upcoming",
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
