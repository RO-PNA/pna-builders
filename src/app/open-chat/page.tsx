import Link from "next/link";

const TRIBES = [
  {
    university: "서울시립대학교",
    icon: "🐧",
    url: "https://open.kakao.com/o/gApqCKBg",
    members: 105, capacity: 200,
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

export default function OpenChatPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Open Chat</h1>
      <p className="text-gray-400 mb-8">
        대학별 카카오톡 오픈채팅방에서 동문 프로덕트 직군을 만나보세요.
      </p>

      <h2 className="text-lg font-semibold mb-4">Tribe</h2>
      <div className="space-y-4">
        {TRIBES.map((tribe) => (
          <Link
            key={tribe.university}
            href={tribe.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:border-orange-400 transition-colors"
          >
            <span className="text-4xl">{tribe.icon}</span>
            <div className="flex-1">
              <div className="font-semibold">{tribe.university}</div>
              <div className="text-sm text-gray-400 mt-1">{tribe.members}/{tribe.capacity}명</div>
            </div>
            <div className="text-sm text-gray-400">참여하기 →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
