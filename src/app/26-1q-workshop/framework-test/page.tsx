"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

type Question = {
  situation: string;
  options: { label: string; framework: string }[];
};

const QUESTIONS: Question[] = [
  {
    situation: "주간 회의에서 팀장이 말한다. \"이번 달 결제 완료율이 12%나 떨어졌어. 왜 그런지 다음 주까지 파악해와.\" 자리로 돌아와서 가장 먼저 하는 행동은?",
    options: [
      { label: "일단 지난 3개월치 결제 퍼널 데이터를 뽑아서 어느 단계에서 이탈이 늘었는지 본다", framework: "tdcc" },
      { label: "12%가 떨어졌다는 건 알겠는데, 원래 어땠고 지금 뭐가 달라진 건지부터 정리한다", framework: "scqa" },
      { label: "결제 실패, UX 변경, 외부 이슈 등 가능한 원인을 빠짐없이 리스트업한다", framework: "mece" },
      { label: "최근에 뭐가 바뀌었지? 결제 모듈 업데이트 때문인가? 그게 왜 영향을 줬을까?를 따라간다", framework: "5whys" },
      { label: "아마 새 결제 UI 때문일 거야. 이전 버전으로 일부 유저만 돌려보면 바로 확인할 수 있다", framework: "xyz" },
    ],
  },
  {
    situation: "유저 인터뷰에서 한 유저가 말한다. \"앱은 좋은데, 한 달에 한 번 쓸까 말까예요. 딱히 다시 들어올 이유가 없어요.\" 이 말을 듣고 드는 첫 번째 생각은?",
    options: [
      { label: "이 유저만 그런 건지, 전체적으로 재방문율이 어떤지 수치를 확인해봐야겠다", framework: "tdcc" },
      { label: "우리가 생각하는 핵심 가치와 유저가 느끼는 가치 사이에 갭이 있는 것 같다", framework: "scqa" },
      { label: "다시 들어올 이유가 없다는 건... 콘텐츠 문제? 알림 문제? 습관 형성 문제? 뭘까", framework: "mece" },
      { label: "좋다고 하면서 왜 안 쓸까? 좋다는 게 정확히 뭘 말하는 거지? 거기서부터 파고들어야 한다", framework: "5whys" },
      { label: "주 1회 리마인드 푸시를 보내면 이 유저 같은 사람들의 재방문이 늘지 않을까", framework: "xyz" },
    ],
  },
  {
    situation: "동료 PM이 슬랙에 올린다. \"경쟁사가 AI 추천 기능 출시했는데 반응이 엄청 좋아요. 우리도 빨리 만들어야 하는 거 아닌가요?\" 이 메시지를 보고 드는 생각은?",
    options: [
      { label: "경쟁사 반응이 좋다는 근거가 뭐지? 실제 다운로드나 리뷰 데이터를 봐야 판단할 수 있다", framework: "tdcc" },
      { label: "잠깐, 우리한테 지금 가장 중요한 문제가 AI 추천인지부터 따져봐야 한다", framework: "scqa" },
      { label: "따라 만드는 것 외에 대응 방법이 뭐가 있는지 선택지를 먼저 펼쳐놓고 비교하자", framework: "mece" },
      { label: "경쟁사가 왜 그걸 만들었을까? 그들이 풀려는 문제가 우리 문제와 같은 건지 생각해본다", framework: "5whys" },
      { label: "우리 데이터로 간단한 추천 로직을 만들어서 일부 유저에게 먼저 테스트해보자", framework: "xyz" },
    ],
  },
  {
    situation: "대표가 전체 회의에서 선언한다. \"3분기까지 유료 전환율 2배. 지금 3%인데 6%까지 올려야 합니다.\" 회의가 끝나고 팀원이 \"이거 가능해요?\"라고 묻는다. 당신의 반응은?",
    options: [
      { label: "지금 전환하는 3%가 어떤 유저인지, 안 하는 97%와 뭐가 다른지 데이터부터 까보자", framework: "tdcc" },
      { label: "6%가 목표라는 건 알겠는데, 진짜 풀어야 할 질문은 '왜 97%가 전환하지 않는가'이다", framework: "scqa" },
      { label: "전환율에 영향을 주는 요소가 뭐가 있는지 전부 나열해보고 하나씩 따져보자", framework: "mece" },
      { label: "지금 3%인 이유가 뭘까? 가격 때문? 가격이라면 왜 비싸다고 느끼는 걸까?부터 시작하자", framework: "5whys" },
      { label: "제일 유력한 가설 하나만 잡고 이번 주에 A/B 테스트 돌려보면 방향이 보일 거다", framework: "xyz" },
    ],
  },
  {
    situation: "새벽에 알림이 온다. CS팀장: \"오늘 오전부터 '결제가 안 돼요' 문의가 평소의 4배입니다. 긴급 확인 부탁드립니다.\" 침대에서 일어나 노트북을 열고 가장 먼저 하는 일은?",
    options: [
      { label: "결제 에러 로그를 시간대별로 뽑아서 언제부터, 어떤 결제 수단에서 터졌는지 확인한다", framework: "tdcc" },
      { label: "4배라는 건 비정상이니까, 평소와 달라진 게 뭔지 최근 배포/변경 이력을 먼저 정리한다", framework: "scqa" },
      { label: "결제 문제라면 PG사 장애, 앱 버그, 네트워크, 인증 오류 등 가능성을 체크리스트로 훑는다", framework: "mece" },
      { label: "'결제가 안 된다'가 정확히 무슨 뜻이지? 어디서 막히는 거지? CS 문의 원문부터 읽어본다", framework: "5whys" },
      { label: "아마 어젯밤 배포 때문일 거다. 롤백하고 문의량이 줄어드는지 30분 모니터링한다", framework: "xyz" },
    ],
  },
  {
    situation: "디자이너가 온보딩 개편안을 가져왔다. 기존 5단계를 3단계로 줄인 안이다. \"이걸로 가면 이탈이 확 줄 거예요.\" 당신은 어떻게 반응하는가?",
    options: [
      { label: "현재 온보딩 단계별 이탈률 데이터를 보면서 정말 단계 수가 문제인지 확인하고 싶다", framework: "tdcc" },
      { label: "이탈이 줄 거라는 건 좋은데, 지금 온보딩의 진짜 문제가 '단계가 많아서'가 맞는지 먼저 확인하자", framework: "scqa" },
      { label: "온보딩 이탈 원인이 단계 수만은 아닐 수 있으니, 다른 가능한 원인도 같이 봐야 한다", framework: "mece" },
      { label: "유저가 3단계에서 왜 나가는 걸까? 단계 수 문제가 아니라 그 단계의 내용이 문제 아닐까?", framework: "5whys" },
      { label: "좋아 보이니까 일부 신규 유저에게만 먼저 적용해서 이탈률 차이를 측정해보자", framework: "xyz" },
    ],
  },
  {
    situation: "분기 회고에서 마케팅팀이 발표한다. \"광고비를 30% 늘렸더니 신규 가입이 25% 늘었습니다. 효율이 좋으니 다음 분기에도 늘리겠습니다.\" 당신은 어떤 생각이 드는가?",
    options: [
      { label: "늘어난 25% 유저의 리텐션과 LTV가 기존 유저와 같은 수준인지 봐야 의미가 있다", framework: "tdcc" },
      { label: "가입은 늘었는데, 우리가 진짜 원하는 게 가입 수인지 활성 유저 수인지 질문이 달라야 한다", framework: "scqa" },
      { label: "광고비 외에 가입에 영향을 준 다른 요인은 없었는지, 시즌 효과나 바이럴 같은 것도 따져봐야 한다", framework: "mece" },
      { label: "광고로 온 유저가 왜 가입했을까? 광고 메시지 때문? 랜딩 때문? 진짜 동기가 뭘까?", framework: "5whys" },
      { label: "다음 분기에 30% 더 늘리기 전에, 광고 채널별로 소액 테스트를 먼저 해서 진짜 효율을 검증하자", framework: "xyz" },
    ],
  },
];

type FrameworkDetail = {
  emoji: string;
  name: string;
  trait: string;
  description: string;
  strength: string;
};

const FRAMEWORK_INFO: Record<string, FrameworkDetail> = {
  scqa: {
    emoji: "🎯",
    name: "S-C-Q-A",
    trait: "문제 정의력",
    description: "복잡한 상황에서 '사실'과 '문제'를 먼저 분리하고, 지금 진짜 답해야 할 질문이 뭔지를 찾아내는 사고방식이다. 팀이 엉뚱한 방향으로 달려가기 전에 논의의 프레임을 잡아주는 역할에 강하다.",
    strength: "혼란스러운 상황에서 핵심을 짚고, 팀 전체가 같은 질문을 바라보게 만드는 능력",
  },
  tdcc: {
    emoji: "🔍",
    name: "TDCC",
    trait: "데이터 분석력",
    description: "감이나 의견보다 숫자를 먼저 보고, 추세와 세그먼트를 비교하며 패턴을 찾아내는 사고방식이다. '그거 데이터로 확인해봤어?'가 입버릇인 팩트 기반 의사결정자에 가깝다.",
    strength: "직관이나 감에 의존하지 않고, 데이터 패턴에서 남들이 못 보는 인사이트를 끌어내는 능력",
  },
  mece: {
    emoji: "📐",
    name: "MECE / Logic Tree",
    trait: "구조화 능력",
    description: "문제를 볼 때 '혹시 빠뜨린 게 없나?'를 먼저 생각하고, 가능한 원인과 선택지를 빠짐없이 펼쳐놓는 사고방식이다. 복잡한 문제를 정리정돈해서 팀이 체계적으로 움직이게 만드는 역할에 강하다.",
    strength: "복잡한 문제를 빠짐없이 분해하고, 팀이 체계적으로 우선순위를 정하게 만드는 능력",
  },
  "5whys": {
    emoji: "🔗",
    name: "5-Whys",
    trait: "근본 원인 추적력",
    description: "표면적인 답에 쉽게 만족하지 않고 '근데 그게 왜?'를 계속 파고드는 사고방식이다. 남들이 당연하게 넘기는 지점에서 진짜 원인을 끄집어내는 역할에 강하다.",
    strength: "남들이 당연하게 넘기는 지점에서 멈춰서, 표면 아래 숨겨진 진짜 원인을 끄집어내는 능력",
  },
  xyz: {
    emoji: "🧪",
    name: "XYZ 가설",
    trait: "실험 설계력",
    description: "분석보다 실행을 먼저 떠올리고, 작게 실험해서 결과로 증명하려는 사고방식이다. '일단 해보면 알잖아'가 자연스럽게 나오는 실험 중심 의사결정자에 가깝다.",
    strength: "끝없는 분석 대신 빠르게 가설을 세우고, 작은 실험으로 방향을 검증하는 실행력",
  },
};

// 주유형 + 보조유형 조합별 시너지 제안
// key: "주유형-보조유형", value: { combo 설명, 보완 역량 }
const SYNERGY_MAP: Record<string, { combo: string; recommend: string }> = {
  "scqa-tdcc": { combo: "문제를 날카롭게 정의하고 데이터로 뒷받침할 수 있는 조합이다. 설득력 있는 이슈 레이징에 강하다.", recommend: "구조화 능력(MECE)을 보완하면, 정의한 문제를 빠짐없이 분해해서 실행 계획까지 연결할 수 있다" },
  "scqa-mece": { combo: "핵심 질문을 찾고 체계적으로 구조화하는 조합이다. 복잡한 문제를 정리해서 팀 방향을 잡는 데 강하다.", recommend: "실험 설계력(XYZ)을 보완하면, 잘 정리된 구조에서 바로 실행 가능한 가설을 뽑아낼 수 있다" },
  "scqa-5whys": { combo: "문제를 정의하면서 동시에 깊이 파고드는 조합이다. 근본적인 질문을 던지는 데 강하다.", recommend: "데이터 분석력(TDCC)을 보완하면, 깊은 질문에 정량적 근거를 붙여 팀을 움직일 수 있다" },
  "scqa-xyz": { combo: "핵심 질문을 찾자마자 바로 실험으로 옮기는 조합이다. 빠른 방향 설정과 검증에 강하다.", recommend: "구조화 능력(MECE)을 보완하면, 실험 전에 놓치는 변수 없이 체계적으로 설계할 수 있다" },
  "tdcc-scqa": { combo: "데이터에서 패턴을 찾고 핵심 질문으로 연결하는 조합이다. 팩트 기반 문제 제기에 강하다.", recommend: "근본 원인 추적력(5-Whys)을 보완하면, 데이터가 보여주는 현상 너머의 '왜'까지 설명할 수 있다" },
  "tdcc-mece": { combo: "데이터를 분석하면서 구조적으로 정리하는 조합이다. 분석 리포트와 대시보드 설계에 강하다.", recommend: "실험 설계력(XYZ)을 보완하면, 분석 결과를 바로 실험으로 전환해 빠르게 검증할 수 있다" },
  "tdcc-5whys": { combo: "숫자에서 출발해 근본 원인까지 추적하는 조합이다. '무엇이'와 '왜'를 동시에 답할 수 있다.", recommend: "문제 정의력(S-C-Q-A)을 보완하면, 분석 결과를 팀이 공감하는 하나의 질문으로 정리할 수 있다" },
  "tdcc-xyz": { combo: "데이터로 가설을 세우고 바로 실험하는 조합이다. 그로스 해킹 사고방식에 가깝다.", recommend: "구조화 능력(MECE)을 보완하면, 실험 설계 시 빠뜨리는 변수 없이 정교하게 설계할 수 있다" },
  "mece-scqa": { combo: "구조적으로 분해하면서 핵심 질문을 도출하는 조합이다. 전략 문서 작성과 의사결정 프레임에 강하다.", recommend: "데이터 분석력(TDCC)을 보완하면, 구조화한 각 항목에 정량적 근거를 붙일 수 있다" },
  "mece-tdcc": { combo: "빠짐없이 분류하고 데이터로 검증하는 조합이다. 체계적인 분석에 강하다.", recommend: "근본 원인 추적력(5-Whys)을 보완하면, 각 분류의 표면 아래 진짜 원인을 파악할 수 있다" },
  "mece-5whys": { combo: "문제를 구조적으로 나누고 각각의 근본 원인을 추적하는 조합이다. 깊이와 넓이를 동시에 잡을 수 있다.", recommend: "실험 설계력(XYZ)을 보완하면, 추적한 원인별로 빠르게 해결책을 실험할 수 있다" },
  "mece-xyz": { combo: "가능성을 빠짐없이 나열하고 가장 유력한 것을 실험하는 조합이다. 체계적 실험 설계에 강하다.", recommend: "문제 정의력(S-C-Q-A)을 보완하면, 실험의 목적과 방향을 더 명확하게 설정할 수 있다" },
  "5whys-scqa": { combo: "근본 원인을 파고들면서 핵심 질문으로 정리하는 조합이다. 깊은 통찰을 설득력 있게 전달할 수 있다.", recommend: "데이터 분석력(TDCC)을 보완하면, 추적한 원인에 정량적 증거를 붙여 신뢰도를 높일 수 있다" },
  "5whys-tdcc": { combo: "'왜'를 추적하면서 데이터로 검증하는 조합이다. 인과관계 분석에 강하다.", recommend: "구조화 능력(MECE)을 보완하면, 원인 추적 과정을 체계적으로 정리해 팀과 공유하기 쉬워진다" },
  "5whys-mece": { combo: "근본 원인을 추적하면서 구조적으로 분류하는 조합이다. 원인 분석의 깊이와 체계를 동시에 갖출 수 있다.", recommend: "실험 설계력(XYZ)을 보완하면, 찾아낸 근본 원인에 대한 해결책을 빠르게 검증할 수 있다" },
  "5whys-xyz": { combo: "원인을 파고들다가 바로 실험으로 전환하는 조합이다. 문제 해결 속도가 빠르다.", recommend: "문제 정의력(S-C-Q-A)을 보완하면, 파고든 원인이 정말 맞는 문제인지 한 번 더 점검할 수 있다" },
  "xyz-scqa": { combo: "빠르게 실험하면서도 핵심 질문을 놓치지 않는 조합이다. 방향성 있는 실험에 강하다.", recommend: "데이터 분석력(TDCC)을 보완하면, 실험 결과를 더 정교하게 해석하고 다음 실험을 설계할 수 있다" },
  "xyz-tdcc": { combo: "가설을 세우고 데이터로 검증하는 조합이다. 데이터 드리븐 실험에 강하다.", recommend: "구조화 능력(MECE)을 보완하면, 실험 변수를 빠짐없이 통제해 결과의 신뢰도를 높일 수 있다" },
  "xyz-mece": { combo: "실험을 설계하면서 가능성을 빠짐없이 점검하는 조합이다. 정교한 실험 설계에 강하다.", recommend: "근본 원인 추적력(5-Whys)을 보완하면, 실험이 표면 증상이 아닌 진짜 원인을 겨냥하게 할 수 있다" },
  "xyz-5whys": { combo: "빠르게 실험하면서 결과의 '왜'를 파고드는 조합이다. 실험 → 학습 루프가 빠르다.", recommend: "문제 정의력(S-C-Q-A)을 보완하면, 실험과 학습의 방향이 비즈니스 핵심 질문과 정렬될 수 있다" },
};

function getSynergy(mainKey: string, subKey: string) {
  const combo = SYNERGY_MAP[`${mainKey}-${subKey}`];
  if (combo) return combo;
  // fallback: 같은 유형이 1,2등인 경우 (동점 등)
  const allKeys = Object.keys(FRAMEWORK_INFO);
  const other = allKeys.find(k => k !== mainKey && k !== subKey) ?? allKeys[0];
  return {
    combo: `${FRAMEWORK_INFO[mainKey].trait}이 주도적이며 ${FRAMEWORK_INFO[subKey].trait}이 뒷받침하는 조합이다.`,
    recommend: `${FRAMEWORK_INFO[other].trait}(${FRAMEWORK_INFO[other].name})을 보완하면 더 균형 잡힌 의사결정이 가능하다`,
  };
}

// 5각형 축 정의 (역량 기준)
const AXES: { key: string; label: string }[] = [
  { key: "scqa", label: "문제 정의력" },
  { key: "tdcc", label: "데이터 분석력" },
  { key: "mece", label: "구조화 능력" },
  { key: "5whys", label: "근본 원인\n추적력" },
  { key: "xyz", label: "실험 설계력" },
];

function PentagonChart({ scores }: { scores: Record<string, number> }) {
  const pad = 60;
  const chartR = 100;
  const cx = chartR + pad;
  const cy = chartR + pad;
  const size = (chartR + pad) * 2;
  const levels = [0.25, 0.5, 0.75, 1.0];

  function polarToXY(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const angleStep = 360 / 5;
  const axisPoints = AXES.map((_, i) => polarToXY(i * angleStep, chartR));

  const gridPolygons = levels.map((lv) => {
    return AXES.map((_, i) => {
      const p = polarToXY(i * angleStep, chartR * lv);
      return `${p.x},${p.y}`;
    }).join(" ");
  });

  const total = AXES.reduce((sum, a) => sum + (scores[a.key] ?? 0), 0);
  const dataPoints = AXES.map((a, i) => {
    const raw = scores[a.key] ?? 0;
    const ratio = total > 0 ? raw / total : 0.2;
    const value = 0.3 + ratio * 0.7;
    const p = polarToXY(i * angleStep, chartR * Math.min(value, 1));
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] mx-auto">
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="var(--border-light)" strokeWidth={1} />
      ))}
      {axisPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border-light)" strokeWidth={1} />
      ))}
      <polygon points={dataPoints} fill="rgba(249, 115, 22, 0.15)" stroke="#f97316" strokeWidth={2.5} />
      {AXES.map((a, i) => {
        const raw = scores[a.key] ?? 0;
        const ratio = total > 0 ? raw / total : 0.2;
        const value = 0.3 + ratio * 0.7;
        const p = polarToXY(i * angleStep, chartR * Math.min(value, 1));
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill="#f97316" />;
      })}
      {AXES.map((a, i) => {
        const lp = polarToXY(i * angleStep, chartR + 30);
        return (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--text-secondary)"
            fontWeight={600}
          >
            {a.label.replace("\n", "")}
          </text>
        );
      })}
    </svg>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FrameworkTestPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(() => QUESTIONS.map(() => null));
  const [done, setDone] = useState(false);
  const [shuffledOptions] = useState<Question["options"][]>(() =>
    QUESTIONS.map((q) => shuffle(q.options))
  );

  function selectOption(framework: string) {
    const newAnswers = [...answers];
    newAnswers[currentQ] = framework;
    setAnswers(newAnswers);

    if (currentQ + 1 >= QUESTIONS.length) {
      setDone(true);
    } else {
      setCurrentQ(currentQ + 1);
    }
  }

  function goBack() {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setDone(false);
    }
  }

  function getScores() {
    const raw: Record<string, number> = { scqa: 0, tdcc: 0, mece: 0, "5whys": 0, xyz: 0 };
    for (const a of answers) {
      if (a) raw[a] = (raw[a] ?? 0) + 1;
    }
    return raw;
  }

  function getPercentages() {
    const raw = getScores();
    const total = Object.values(raw).reduce((s, v) => s + v, 0) || 1;
    const result: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw)) {
      result[k] = Math.round((v / total) * 100);
    }
    return result;
  }

  function getRanking() {
    const pct = getPercentages();
    return Object.entries(pct)
      .sort((a, b) => b[1] - a[1])
      .map(([fw, score]) => ({ ...FRAMEWORK_INFO[fw], key: fw, score }));
  }

  function restart() {
    setCurrentQ(0);
    setAnswers(QUESTIONS.map(() => null));
    setDone(false);
  }

  const resultRef = useRef<HTMLDivElement>(null);

  const saveAsImage = useCallback(async () => {
    const el = resultRef.current;
    if (!el) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = "framework-result.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("저장에 실패했습니다. 스크린샷으로 저장해주세요.");
    }
  }, []);

  if (done) {
    const ranking = getRanking();
    const top = ranking[0];
    const sub = ranking.length > 1 ? ranking[1] : null;
    const scores = getScores();
    const synergy = sub ? getSynergy(top.key, sub.key) : null;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div ref={resultRef} className="p-4">
          <h1 className="text-2xl font-bold mb-6">나의 프레임워크 유형</h1>

          {/* Top Result */}
          <div className="rounded-xl border-2 border-orange-500 p-6 mb-4" style={{ background: 'var(--surface)' }}>
            <div className="text-center">
              <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>주 유형</div>
              <div className="text-4xl mb-2">{top.emoji}</div>
              <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{top.name}</div>
              <div className="text-sm font-medium mt-1" style={{ color: 'var(--brand-primary)' }}>{top.trait}</div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{top.description}</p>
            </div>
          </div>

          {/* Sub Type */}
          {sub && sub.score > 0 && (
            <div className="rounded-lg border p-4 mb-6" style={{ borderColor: 'var(--border-default)', background: 'var(--surface)' }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{FRAMEWORK_INFO[sub.key].emoji}</span>
                <div className="flex-1">
                  <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>보조 유형</div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{FRAMEWORK_INFO[sub.key].name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--brand-primary)' }}>{FRAMEWORK_INFO[sub.key].trait}</div>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{FRAMEWORK_INFO[sub.key].description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Strength */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <div className="rounded-lg p-4 border" style={{ borderColor: '#22c55e33', background: '#22c55e08' }}>
              <div className="text-xs font-semibold mb-1.5" style={{ color: '#22c55e' }}>핵심 강점</div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{top.strength}</p>
            </div>

            {/* Combo Description */}
            {synergy && (
              <div className="rounded-lg p-4 border" style={{ borderColor: '#f9731633', background: '#f9731608' }}>
                <div className="text-xs font-semibold mb-1.5" style={{ color: '#f97316' }}>주 유형 + 보조 유형 조합</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{synergy.combo}</p>
              </div>
            )}

            {/* Synergy Recommendation */}
            {synergy && (
              <div className="rounded-lg p-4 border" style={{ borderColor: '#3b82f633', background: '#3b82f608' }}>
                <div className="text-xs font-semibold mb-1.5" style={{ color: '#3b82f6' }}>시너지를 위한 보완 역량</div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{synergy.recommend}</p>
              </div>
            )}
          </div>

        </div>

        <div className="mt-4">
          <Link
            href="/26-1q-workshop"
            className="block w-full py-3 rounded-lg bg-orange-500 text-white font-semibold text-sm text-center hover:bg-orange-600 transition-colors"
          >
            워크샵으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[currentQ];
  const options = shuffledOptions[currentQ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {currentQ > 0 && (
            <button
              onClick={goBack}
              className="text-sm px-2 py-1 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: 'var(--text-secondary)' }}
            >
              &larr; 이전
            </button>
          )}
          <h1 className="text-lg font-bold">나의 프레임워크 유형 찾기</h1>
        </div>
        <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
          {currentQ + 1} / {QUESTIONS.length}
        </span>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full mb-6 overflow-hidden" style={{ background: 'var(--surface-secondary)' }}>
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      {/* Situation */}
      <div className="rounded-lg p-4 mb-5" style={{ background: 'var(--surface-secondary)' }}>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {q.situation}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {options.map((opt, i) => {
          const isSelected = answers[currentQ] === opt.framework;
          return (
            <button
              key={i}
              onClick={() => selectOption(opt.framework)}
              className="w-full text-left p-4 rounded-lg border-2 transition-all hover:border-orange-400 active:scale-[0.99]"
              style={{
                borderColor: isSelected ? '#f97316' : 'var(--border-light)',
                background: isSelected ? 'rgba(249, 115, 22, 0.05)' : 'var(--surface)',
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{opt.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
