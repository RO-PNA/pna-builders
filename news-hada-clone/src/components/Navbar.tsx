import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import Link from 'next/link';
import React from 'react';
import { createSupabaseServer } from '@/utils/supabase/server';

export default async function Navbar() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="bg-orange-500 text-black p-2 mb-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold text-lg border-2 border-white px-1">
            Y
          </Link>
          <span className="font-bold">News App</span>
          <nav className="hidden md:flex space-x-2 text-sm">
            <Link href="/" className="hover:underline">new</Link>
            <span>|</span>
            <Link href="/comments" className="hover:underline">comments</Link>
            <span>|</span>
            <Link href="/submit" className="hover:underline">submit</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Link href="/search" className="hover:underline">search</Link>
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
      </div>
    </header>
  );
}
