import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PNA",
  description: "Product Network Alumni — 대학 동문 프로덕트 직군 네트워크",
};

const themeScript = `
(function(){
  var t = localStorage.getItem('theme');
  if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} min-h-screen pt-[40px]`}>
        <Navbar />
        <main className="mx-auto px-2 py-4 max-w-4xl sm:mx-[40px] sm:max-w-none min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
