import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

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
    slug: "pna-monthly-apr-2026",
    title: "PNA Monthly — 4월 정기모임",
    category: "meetup",
    summary: "프로덕트 직군 동문 네트워킹 정기모임. AI 트렌드 공유 및 자유 네트워킹",
    thumbnailUrl: "/images/about/about_2.jpg",
    eventDate: "2026-04-25T19:00:00+09:00",
    eventEndDate: "2026-04-25T21:00:00+09:00",
    location: "서울 성수동",
    isFree: true,
    registrationUrl: "https://forms.gle/example",
    status: "upcoming",
    isFeatured: true,
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

export default function EventsPage() {
  const featured = EVENTS.find((e) => e.isFeatured);
  const upcoming = EVENTS.filter((e) => e.status === "upcoming" || e.status === "ongoing");
  const past = EVENTS.filter((e) => e.status === "ended");

  return (
    <div>
      {/* Hero Banner */}
      {featured && (
        <Link
          href={`/events/${featured.slug}`}
          className="group block relative rounded-2xl overflow-hidden mb-10"
        >
          <div className="relative aspect-[21/9] sm:aspect-[3/1] bg-gray-900">
            {featured.thumbnailUrl && (
              <Image
                src={featured.thumbnailUrl}
                alt={featured.title}
                fill
                className="object-cover opacity-60 group-hover:opacity-70 transition-opacity"
                sizes="100vw"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[featured.category]}`}>
                  {CATEGORY_LABELS[featured.category]}
                </span>
                <StatusBadge status={featured.status} eventDate={featured.eventDate} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{featured.title}</h2>
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{featured.summary}</p>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>{formatDate(featured.eventDate)} {formatTime(featured.eventDate)}</span>
                <span>{featured.location}</span>
                {featured.isFree ? (
                  <span className="text-green-400">무료</span>
                ) : (
                  <span className="text-yellow-400">{featured.price || "유료"}</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      )}

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
