# PNA Project Guidelines

## Design System

### Design Tokens

모든 색상은 `globals.css`의 CSS 변수(디자인 토큰)를 사용한다. 하드코딩된 hex 값을 직접 쓰지 않는다.

**토큰 구조:**

| 카테고리 | 토큰 | Light | Dark | 용도 |
|---------|------|-------|------|------|
| Background | `--background` | `#ffffff` | `#0a0a0a` | 페이지 배경 |
| | `--surface` | `#ffffff` | `#141414` | 카드/컨테이너 배경 |
| | `--surface-secondary` | `#f9fafb` | `#1a1a1a` | 보조 배경 |
| Text | `--text-primary` | `#111827` | `#f3f4f6` | 주요 텍스트 |
| | `--text-secondary` | `#4b5563` | `#a1a1aa` | 보조 텍스트 |
| | `--text-tertiary` | `#6b7280` | `#9ca3af` | 3차 텍스트 |
| | `--text-muted` | `#9ca3af` | `#71717a` | 비활성 텍스트 |
| Border | `--border-default` | `#d1d5db` | `#4b5563` | 기본 테두리 |
| | `--border-light` | `#e5e7eb` | `#374151` | 연한 테두리 |
| Brand | `--brand-primary` | `#f97316` | (동일) | 브랜드 주색 (orange-500) |
| | `--brand-primary-hover` | `#ea580c` | (동일) | 브랜드 호버 |
| Button | `--btn-disabled-bg` | `#d1d5db` | `#374151` | 비활성 버튼 배경 |
| | `--btn-disabled-text` | `#ffffff` | `#6b7280` | 비활성 버튼 텍스트 |
| Chat | `--chat-assistant-text` | `#111827` | `#f3f4f6` | 어시스턴트 메시지 글씨 |
| | `--chat-prose-body` | `#111827` | `#f3f4f6` | 마크다운 본문 글씨 |

### 라이트/다크 모드 규칙

1. **모든 UI 컴포넌트는 라이트 모드와 다크 모드를 분리해서 스타일링한다.**
2. Tailwind 유틸리티에서 `dark:` prefix를 사용하거나, CSS 변수를 사용한다.
3. 새로운 색상이 필요하면 `globals.css`의 `:root`와 `.dark` 양쪽에 토큰을 추가한다.
4. 하드코딩 hex 값 대신 `var(--token-name)` 사용을 우선한다.
5. Streamdown 컴포넌트 오버라이드는 `globals.css`에서 `var()` 토큰으로 관리한다.

### 컴포넌트 스타일 패턴

```tsx
// Good: 라이트/다크 모두 명시
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"

// Good: CSS 변수 사용
style={{ color: 'var(--text-primary)' }}

// Bad: 다크 모드 미고려
className="bg-white text-gray-900"

// Bad: 하드코딩 hex
style={{ color: '#111827' }}
```

### GNB (Navbar)

- `fixed top-0 z-50`, 높이 `h-10` (40px)
- body에 `pt-[40px]` 적용하여 GNB 아래에서 시작

## Tech Stack

- Next.js 16 (Turbopack)
- React 19
- Tailwind CSS v4
- `@tailwindcss/typography` (prose)
- `streamdown` (AI 스트리밍 마크다운 렌더링)
- Google Generative AI (Gemini 2.5 Flash)
- Supabase (auth, DB)
