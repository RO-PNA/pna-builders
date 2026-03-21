import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { createSupabaseServer } from '@/utils/supabase/server';

export default async function Navbar() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="bg-orange-500 text-black px-2 h-10 fixed top-0 left-0 right-0 z-50 flex items-center">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" title="PNA">
            <Image src="/logo.png" alt="PNA" width={28} height={28} className="rounded-sm" />
          </Link>
          <span className="font-bold">PNA</span>
          <nav className="hidden md:flex space-x-2 text-sm">
            <Link href="/" className="hover:underline">knowledge</Link>
            <span>|</span>
            <Link href="/26-1q-workshop" className="hover:underline">26년-1분기 워크샵</Link>
            <span>|</span>
            <Link href="/open-chat" className="hover:underline">open chat</Link>
            <span>|</span>
            <Link href="/about" className="hover:underline">about</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="hidden md:flex items-center space-x-2">
            {user && (
              <>
                <Link href="/submit" className="hover:underline">submit</Link>
                <span>|</span>
              </>
            )}
            <ThemeToggle />
            <span>|</span>
            {user ? (
              <>
                <span className="font-bold">{user.email?.split('@')[0]}</span>
                <span>|</span>
                <LogoutButton />
              </>
            ) : (
              <LoginButton />
            )}
          </div>
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            {user ? <LogoutButton /> : <LoginButton />}
            <MobileMenu isLoggedIn={!!user} />
          </div>
        </div>
      </div>
    </header>
  );
}
