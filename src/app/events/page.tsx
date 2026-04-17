import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import HeroCarousel from "@/components/HeroCarousel";

export const metadata: Metadata = {
  title: "Events | PNA",
  description: "PNA 오프라인 프로그램 — 컨퍼런스, 워크샵, 정기모임, 스터디",
};

type EventStatus = "upcoming" | "ongoing" | "ended";
type EventCategory = "conference" | "workshop" | "meetup" | "study" | "social";

type EventItem = {
  slug: string;
  title: string;
  category: EventCategory;
  summary: string;
  thumbnailUrl: string | null;
  eventDate: string;
  eventEndDate?: string;
  location: string;
  isFree: boolean;
  price?: string;
  registrationUrl?: string;
  status: EventStatus;
  isFeatured: boolean;
  reviewCount: number;
  galleryUrls: string[];
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

const EVENTS: EventItem[] = [
  {
    slug: "ax-lab-26-1q",
    title: "AX Lab — Problem Mining Framework 워크샵",
    category: "workshop",
    summary: "성장이 멈춘 제품의 문제를 발굴하고 근본 원인을 밝혀내는 팀 기반 AI 시뮬레이션 워크샵",
    thumbnailUrl: "/images/about/about_1.jpeg",
    eventDate: "2026-03-21T14:00:00+09:00",
    eventEndDate: "2026-03-21T17:00:00+09:00",
    location: "서울 강남구",
    isFree: true,
    registrationUrl: undefined,
    status: "ended",
    isFeatured: false,
    reviewCount: 0,
    galleryUrls: ["/images/about/about_1.jpeg", "/images/about/about_2.jpg", "/images/about/about_3.png"],
  },
  {
    slug: "first-penguin-career-study",
    title: "PNA 퍼스트펭귄 이직 스터디",
    category: "study",
    summary: "경험 정리 → 공고 분석 → 이력서/포트폴리오 → 면접 연습까지, 실제 지원으로 이어지는 실행형 이직 스터디",
    thumbnailUrl: "/images/about/about_2.jpg",
    eventDate: "2026-04-11T14:00:00+09:00",
    eventEndDate: "2026-05-23T17:00:00+09:00",
    location: "신촌 스터디룸",
    isFree: false,
    price: "10만원 (100% 환급 가능)",
    registrationUrl: "https://forms.gle/example",
    status: "ongoing",
    isFeatured: true,
    reviewCount: 0,
    galleryUrls: [],
  },
  {
    slug: "ai-agent-workshop-26-may",
    title: "무조건 만드는 나만의 기획 에이전트 워크샵",
    category: "workshop",
    summary: "비용을 최소화하며 24시간 업무를 도와주는 기획 에이전트를 8시간 만에 직접 구축하는 프라이빗 워크샵",
    thumbnailUrl: "/images/about/about_3.png",
    eventDate: "2026-05-17T10:00:00+09:00",
    eventEndDate: "2026-05-17T18:00:00+09:00",
    location: "서울 (추후 안내)",
    isFree: false,
    price: "4만원 (정가 8만원)",
    registrationUrl: "https://forms.gle/example",
    status: "upcoming",
    isFeatured: false,
    reviewCount: 0,
    galleryUrls: [],
  },
  {
    slug: "uospn-yearend-2025",
    title: "2025 UOSPN 송년회 — 1인 창업 시대, 모두의 바이브코딩",
    category: "conference",
    summary: "외부 연사 2인 초청 세미나 + 네트워킹 파티. 바이브코딩 6-Pager 제작기, AI 시대 기획 트렌드",
    thumbnailUrl: null,
    eventDate: "2025-12-06T15:30:00+09:00",
    eventEndDate: "2025-12-06T20:00:00+09:00",
    location: "마루360 (서울 강남구 역삼로 172)",
    isFree: false,
    price: "4만원 (저녁 포함)",
    status: "ended",
    isFeatured: false,
    reviewCount: 0,
    galleryUrls: [],
  },
  {
    slug: "prototype-workshop-25-3q",
    title: "AI 시대의 Prototype, 프로덕트 직무의 새 역할",
    category: "workshop",
    summary: "프로토타입 제작 역량과 AI 툴 활용 방안을 탐색하는 워크샵. 0→1 vs 1→10 단계별 접근",
    thumbnailUrl: null,
    eventDate: "2025-09-05T15:30:00+09:00",
    eventEndDate: "2025-09-05T17:30:00+09:00",
    location: "서울",
    isFree: true,
    status: "ended",
    isFeatured: false,
    reviewCount: 0,
    galleryUrls: [],
  },
  {
    slug: "seminar-25-2q",
    title: "25-2분기 정기 세미나 — 현실 너머, 나의 고민을 그리는 여정",
    category: "meetup",
    summary: "네트워킹을 통한 커리어 개발, 사이드 프로젝트, 포트폴리오 제작 노하우 등 4인 발표",
    thumbnailUrl: null,
    eventDate: "2025-06-14T15:30:00+09:00",
    eventEndDate: "2025-06-14T17:30:00+09:00",
    location: "서울",
    isFree: true,
    status: "ended",
    isFeatured: false,
    reviewCount: 0,
    galleryUrls: [],
  },
  {
    slug: "social-25-1q",
    title: "친목 모임",
    category: "social",
    summary: "UOSPN 멤버 간 자유 네트워킹 및 친목 모임",
    thumbnailUrl: null,
    eventDate: "2025-03-28T19:00:00+09:00",
    location: "서울",
    isFree: true,
    status: "ended",
    isFeatured: false,
    reviewCount: 0,
    galleryUrls: [],
  },
  {
    slug: "first-meetup-yearend-2024",
    title: "첫 오프라인 모임 - 송년회",
    category: "social",
    summary: "UOSPN 첫 번째 오프라인 모임. 동문 프로덕트 직군 네트워킹의 시작",
    thumbnailUrl: null,
    eventDate: "2024-12-14T15:00:00+09:00",
    location: "서울",
    isFree: true,
    status: "ended",
    isFeatured: false,
    reviewCount: 0,
    galleryUrls: [],
  },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status, eventDate }: { status: EventStatus; eventDate: string }) {
  if (status === "ended") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
        종료됨
      </span>
    );
  }
  if (status === "ongoing") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 animate-pulse">
        진행 중
      </span>
    );
  }
  const daysUntil = Math.ceil((new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 3) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        마감 임박
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
      모집 중
    </span>
  );
}

function EventCard({ event, muted = false }: { event: EventItem; muted?: boolean }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className={`group block rounded-xl border overflow-hidden transition-all hover:shadow-md ${muted
        ? "border-gray-200 dark:border-gray-700 opacity-80 hover:opacity-100"
        : "border-gray-200 dark:border-gray-700"
        }`}
    >
      <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-800">
        {event.thumbnailUrl ? (
          <Image
            src={event.thumbnailUrl}
            alt={event.title}
            fill
            className={`object-cover ${muted ? "grayscale group-hover:grayscale-0 transition-all" : ""}`}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl text-gray-300">
            PNA
          </div>
        )}
        {event.reviewCount > 0 && event.status === "ended" && (
          <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full bg-black/60 text-white">
            후기 {event.reviewCount}건
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[event.category]}`}>
            {CATEGORY_LABELS[event.category]}
          </span>
          <StatusBadge status={event.status} eventDate={event.eventDate} />
          {!event.isFree && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              {event.price || "유료"}
            </span>
          )}
        </div>
        <h3 className="font-bold text-sm group-hover:text-orange-500 transition-colors line-clamp-2">
          {event.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {event.summary}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400 dark:text-gray-500">
          <span>{formatDate(event.eventDate)}</span>
          <span>{event.location}</span>
        </div>
      </div>
    </Link>
  );
}

function getStatusDisplay(status: EventStatus, eventDate: string): { label: string; color: string } {
  if (status === "ended") {
    return { label: "종료됨", color: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400" };
  }
  if (status === "ongoing") {
    return { label: "진행 중", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  }
  const daysUntil = Math.ceil((new Date(eventDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 3) {
    return { label: "마감 임박", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  }
  return { label: "모집 중", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
}

export default function EventsPage() {
  const upcoming = EVENTS.filter((e) => e.status === "upcoming");
  const ongoing = EVENTS.filter((e) => e.status === "ongoing");
  const past = EVENTS.filter((e) => e.status === "ended");

  const bannerPool = [
    ...upcoming.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()),
    ...ongoing.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()),
    ...past.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()),
  ].slice(0, 3);

  const carouselEvents = bannerPool.map((e) => {
    const statusDisplay = getStatusDisplay(e.status, e.eventDate);
    return {
      slug: e.slug,
      title: e.title,
      category: e.category,
      categoryLabel: CATEGORY_LABELS[e.category],
      categoryColor: CATEGORY_COLORS[e.category],
      summary: e.summary,
      thumbnailUrl: e.thumbnailUrl,
      eventDate: e.eventDate,
      location: e.location,
      isFree: e.isFree,
      price: e.price,
      statusLabel: statusDisplay.label,
      statusColor: statusDisplay.color,
    };
  });

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel events={carouselEvents} />

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            예정 행사
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Ongoing Events */}
      {ongoing.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            진행 중인 행사
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoing.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Past Events */}
      {past.length > 0 && (
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            지난 행사
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((event) => (
              <EventCard key={event.slug} event={event} muted />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">아직 등록된 행사가 없습니다.</p>
          <p className="text-sm">곧 새로운 프로그램이 올라옵니다.</p>
        </div>
      )}
    </div>
  );
}
