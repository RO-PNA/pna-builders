'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type CarouselEvent = {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;
  summary: string;
  thumbnailUrl: string | null;
  eventDate: string;
  location: string;
  isFree: boolean;
  price?: string;
  statusLabel: string;
  statusColor: string;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

export default function HeroCarousel({ events }: { events: CarouselEvent[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % events.length);
  }, [events.length]);

  useEffect(() => {
    if (paused || events.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [paused, next, events.length]);

  if (events.length === 0) return null;

  const event = events[current];

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link href={`/events/${event.slug}`} className="group block">
        <div className="relative aspect-[21/9] sm:aspect-[3/1] bg-gray-900">
          {event.thumbnailUrl ? (
            <Image
              src={event.thumbnailUrl}
              alt={event.title}
              fill
              className="object-cover opacity-60 group-hover:opacity-70 transition-opacity"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.categoryColor}`}>
                {event.categoryLabel}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${event.statusColor}`}>
                {event.statusLabel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{event.title}</h2>
            <p className="text-sm text-gray-300 mb-3 line-clamp-2">{event.summary}</p>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>{formatDate(event.eventDate)} {formatTime(event.eventDate)}</span>
              <span>{event.location}</span>
              {event.isFree ? (
                <span className="text-green-400">무료</span>
              ) : (
                <span className="text-yellow-400">{event.price || '유료'}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Indicators */}
      {events.length > 1 && (
        <div className="absolute bottom-3 right-6 sm:right-8 flex items-center gap-1.5">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setCurrent(i); }}
              className={`rounded-full transition-all ${
                i === current
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
