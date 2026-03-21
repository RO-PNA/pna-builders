'use client';

import { useState } from 'react';

interface CopyMarkdownButtonProps {
    title: string;
    author: string;
    date: string;
    summary: string;
    url?: string;
}

export default function CopyMarkdownButton({ title, author, date, summary, url }: CopyMarkdownButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const parts = [
            `# ${title}`,
            `${author} · ${date}`,
            '',
            summary,
        ];
        if (url) {
            parts.push('', url);
        }
        const markdown = parts.join('\n');

        navigator.clipboard.writeText(markdown).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="text-xs px-3 py-1 rounded border border-[var(--border-default)] bg-white dark:bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer shrink-0"
        >
            {copied ? 'Copied!' : 'Copy as Markdown'}
        </button>
    );
}
