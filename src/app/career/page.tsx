import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career | PNA",
  description: "PNA 커리어 — 추천 채용, 이직 스터디, 커리어 네트워킹",
};

export default function CareerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Career</h1>
      <p style={{ color: 'var(--text-secondary)' }} className="mb-8">
        PNA 동문 네트워크 기반의 커리어 성장 허브
      </p>

      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-lg mb-2">준비 중입니다.</p>
        <p className="text-sm">추천 채용, 이직 스터디, 커리어 네트워킹 기능이 곧 열립니다.</p>
      </div>
    </div>
  );
}
