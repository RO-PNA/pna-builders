'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function KnowledgeViewToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'list';

  function setView(view: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'list') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    // 뷰 전환 시 카테고리·태그 필터 유지
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  return (
    <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'var(--surface-secondary)' }}>
      <button
        onClick={() => setView('list')}
        className={`text-xs px-3 py-1 rounded-md transition-colors ${
          currentView === 'list'
            ? 'bg-orange-500 text-white'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        style={currentView !== 'list' ? { color: 'var(--text-secondary)' } : undefined}
      >
        List
      </button>
      <button
        onClick={() => setView('graph')}
        className={`text-xs px-3 py-1 rounded-md transition-colors ${
          currentView === 'graph'
            ? 'bg-orange-500 text-white'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        style={currentView !== 'graph' ? { color: 'var(--text-secondary)' } : undefined}
      >
        Graph
      </button>
    </div>
  );
}
