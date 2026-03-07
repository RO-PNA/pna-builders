export default function AboutPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">PNA</h1>
      <p className="text-lg text-gray-400 mb-10">Product Network Alumni</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Why PNA?</h2>
        <p className="text-gray-500 leading-relaxed">
          프로덕트 매니저, 디자이너, 데이터 분석가 등 프로덕트 직군은
          현업에서도, 링크드인에서도 같은 대학 동문을 만나기 어렵습니다.
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

      <section>
        <h2 className="text-xl font-semibold mb-3">Join Us</h2>
        <p className="text-gray-500 leading-relaxed">
          대학 동문 프로덕트 직군이라면 누구나 환영합니다.
        </p>
      </section>
    </div>
  );
}
