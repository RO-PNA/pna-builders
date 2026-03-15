"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  if (!mounted) return <span className="w-5 h-5 inline-block" />;

  return (
    <button
      onClick={toggle}
      className="text-lg leading-none hover:opacity-70 transition-opacity cursor-pointer"
      title={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
