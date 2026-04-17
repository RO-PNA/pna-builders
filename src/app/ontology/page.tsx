import type { Metadata } from "next";
import OntologyGraph from "@/components/OntologyGraph";

export const metadata: Metadata = {
  title: "Ontology | PNA",
  description: "PNA Knowledge 지식 그래프 — 개념, 인물, 콘텐츠 간 관계 탐색",
};

export default function OntologyPage() {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Ontology</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Knowledge의 개념·인물·콘텐츠 간 관계를 탐색합니다
        </p>
      </div>
      <OntologyGraph />
    </div>
  );
}
