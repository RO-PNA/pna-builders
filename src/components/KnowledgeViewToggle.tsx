'use client';

export default function KnowledgeViewToggle({
  view,
  onViewChange,
}: {
  view: string;
  onViewChange: (view: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'var(--surface-secondary)' }}>
      <button
        onClick={() => onViewChange('list')}
        className={`text-xs px-3 py-1 rounded-md transition-colors ${
          view === 'list'
            ? 'bg-orange-500 text-white'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        style={view !== 'list' ? { color: 'var(--text-secondary)' } : undefined}
      >
        List
      </button>
      <button
        onClick={() => onViewChange('graph')}
        className={`text-xs px-3 py-1 rounded-md transition-colors ${
          view === 'graph'
            ? 'bg-orange-500 text-white'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        style={view !== 'graph' ? { color: 'var(--text-secondary)' } : undefined}
      >
        Graph
      </button>
    </div>
  );
}
