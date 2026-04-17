import Image from "next/image";
import Link from "next/link";

const GALLERY_IMAGES = [
  { src: "/images/about/about_1.jpeg", alt: "PNA 활동 사진 1" },
  { src: "/images/about/about_2.jpg", alt: "PNA 활동 사진 2" },
  { src: "/images/about/about_3.png", alt: "PNA 활동 사진 3" },
];

const TRIBES = [
  {
    university: "서울시립대학교",
    icon: "🐧",
    url: "https://open.kakao.com/o/gApqCKBg",
    members: 112, capacity: 200,
  },
  {
    university: "한국외국어대학교",
    icon: "🐦",
    url: "https://open.kakao.com/o/gVK0n4Xh",
    members: 17, capacity: 100,
  },
  {
    university: "전북대학교",
    icon: "🐤",
    url: "https://open.kakao.com/o/gXHP8oYh",
    members: 8, capacity: 100,
  },
];

export default function AboutPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">PNA</h1>
      <p className="text-lg text-gray-400 mb-10">Product Network Alumni</p>

      {/* Gallery */}
      <section className="mb-10 grid grid-cols-3 gap-2 rounded-lg overflow-hidden">
        {GALLERY_IMAGES.map((img) => (
          <div key={img.src} className="relative aspect-[4/3]">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 300px"
            />
          </div>
        ))}
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Why PNA?</h2>
        <p className="text-gray-500 leading-relaxed">
          프로덕트 매니저, 디자이너, 데이터 분석가 등 프로덕트 직군은
          현업에서도, 링크드인에서도 같은 대학 동문을 만나기 어렵습니다. <br />
          PNA는 대학 동문이라는 신뢰를 기반으로,
          프로덕트 직무 종사자들이 서로를 발견하고 연결되는 네트워크입니다.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">What We Do</h2>
        <ul className="space-y-4 text-gray-500">
          <li>
            <strong>추천 채용 네트워크</strong>
            <p className="mt-1">
              채용 시장은 추천 중심으로 빠르게 변하고 있습니다.
              동문 네트워크를 활용해 신뢰할 수 있는 커리어 기회를 주고받습니다.
            </p>
          </li>
          <li>
            <strong>온오프라인 네트워킹</strong>
            <p className="mt-1">
              정기 모임과 온라인 커뮤니티를 통해 실무 경험과 전문성을 나눕니다.
              같은 동문이라는 친밀함이 깊은 대화를 가능하게 합니다.
            </p>
          </li>
          <li>
            <strong>사이드 프로젝트 & 스터디</strong>
            <p className="mt-1">
              함께 만들고 함께 배웁니다.
              AI 트렌드, 프로덕트 전략, 그로스 등 관심사별로 팀을 구성해 실행합니다.
            </p>
          </li>
        </ul>
      </section>

      {/* Tribe */}
      <section id="tribe" className="mb-10 scroll-mt-12">
        <h2 className="text-xl font-semibold mb-3">Tribe</h2>
        <p className="text-gray-500 mb-4">
          대학별 카카오톡 오픈채팅방에서 동문 프로덕트 직군을 만나보세요.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TRIBES.map((tribe) => (
            <Link
              key={tribe.university}
              href={tribe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 border rounded-lg p-4 hover:border-orange-400 transition-colors text-center"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <span className="text-3xl">{tribe.icon}</span>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{tribe.university}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{tribe.members}/{tribe.capacity}명</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Join Us</h2>
        <p className="text-gray-500 leading-relaxed">
          대학 동문 프로덕트 직군이라면 누구나 환영합니다.
        </p>
      </section>
    </div>
  );
}
