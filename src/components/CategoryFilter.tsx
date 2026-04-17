'use client';

import Link from 'next/link';

type Category = {
  id: number;
  slug: string;
  name: string;
};

export default function CategoryFilter({
  categories,
  activeCategorySlug,
  activeTagSlug,
}: {
  categories: Category[];
  activeCategorySlug?: string;
  activeTagSlug?: string;
}) {
  const baseHref = activeTagSlug ? `/?tag=${activeTagSlug}` : '/';

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      <Link
        href={activeTagSlug ? `/?tag=${activeTagSlug}` : '/'}
        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
          !activeCategorySlug
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/20'
        }`}
        style={activeCategorySlug ? { color: 'var(--text-secondary)' } : undefined}
      >
        전체
      </Link>
      {categories.map((cat) => {
        const href = activeTagSlug
          ? `/?category=${cat.slug}&tag=${activeTagSlug}`
          : `/?category=${cat.slug}`;
        const isActive = activeCategorySlug === cat.slug;
        return (
          <Link
            key={cat.slug}
            href={href}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              isActive
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900/20'
            }`}
            style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}
