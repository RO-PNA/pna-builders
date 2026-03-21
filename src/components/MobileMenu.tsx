'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  isLoggedIn: boolean;
}

export default function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="md:hidden relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1 hover:opacity-70 transition-opacity"
        aria-label="메뉴"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-9 bg-white dark:bg-[var(--surface)] border border-[var(--border-default)] rounded-lg shadow-lg py-2 z-50 min-w-[160px]">
          <Link href="/" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-primary)]">
            knowledge
          </Link>
          <Link href="/26-1q-workshop" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-primary)]">
            26년-1분기 워크샵
          </Link>
          <Link href="/open-chat" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-primary)]">
            open chat
          </Link>
          <Link href="/about" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-primary)]">
            about
          </Link>
          {isLoggedIn && (
            <>
              <div className="border-t border-[var(--border-light)] my-1" />
              <Link href="/submit" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-primary)]">
                submit
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
