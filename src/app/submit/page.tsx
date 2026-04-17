'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type Category = {
    id: number
    slug: string
    name: string
    parent_id: number | null
    children?: Category[]
}

type Tag = {
    id: number
    slug: string
    name: string
}

export default function SubmitPage() {
    const router = useRouter()
    const [url, setUrl] = useState('')
    const [summary, setSummary] = useState('')
    const [categoryId, setCategoryId] = useState<number | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [tagInput, setTagInput] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const tagInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetch('/api/categories')
            .then((r) => r.json())
            .then(setCategories)
            .catch(() => {})
    }, [])

    useEffect(() => {
        if (!tagInput.trim()) {
            setTagSuggestions([])
            return
        }
        const timer = setTimeout(() => {
            fetch(`/api/tags?q=${encodeURIComponent(tagInput)}`)
                .then((r) => r.json())
                .then((data) => {
                    setTagSuggestions(data.filter((t: Tag) => !selectedTags.includes(t.name)))
                    setShowSuggestions(true)
                })
                .catch(() => {})
        }, 200)
        return () => clearTimeout(timer)
    }, [tagInput, selectedTags])

    function addTag(name: string) {
        const trimmed = name.trim()
        if (!trimmed || selectedTags.length >= 5 || selectedTags.includes(trimmed)) return
        setSelectedTags([...selectedTags, trimmed])
        setTagInput('')
        setShowSuggestions(false)
        tagInputRef.current?.focus()
    }

    function removeTag(index: number) {
        setSelectedTags(selectedTags.filter((_, i) => i !== index))
    }

    function handleTagKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (tagInput.trim()) addTag(tagInput)
        }
        if (e.key === 'Backspace' && !tagInput && selectedTags.length > 0) {
            removeTag(selectedTags.length - 1)
        }
    }

    const submit = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert('로그인이 필요합니다')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    summary,
                    category_id: categoryId,
                    tags: selectedTags,
                }),
            })

            if (res.ok) {
                alert('등록 완료')
                router.push('/')
                router.refresh()
            } else {
                const errorData = await res.json().catch(() => ({}))
                alert(`등록 실패: ${errorData.error || '알 수 없는 오류'}`)
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main>
            <h1 className="text-2xl font-bold mb-6">글 등록</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>URL</label>
                    <input
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        style={{ borderColor: 'var(--border-default)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>요약</label>
                    <textarea
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        style={{ borderColor: 'var(--border-default)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                        placeholder="요약"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={4}
                    />
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>카테고리</label>
                    <select
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        style={{ borderColor: 'var(--border-default)', background: 'var(--surface)', color: 'var(--text-primary)' }}
                        value={categoryId ?? ''}
                        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">카테고리 선택</option>
                        {categories.map((parent) => (
                            <optgroup key={parent.id} label={parent.name}>
                                <option value={parent.id}>{parent.name} (전체)</option>
                                {parent.children?.map((child) => (
                                    <option key={child.id} value={child.id}>
                                        {child.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* Tags */}
                <div className="relative">
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                        태그 <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>({selectedTags.length}/5)</span>
                    </label>
                    <div
                        className="flex flex-wrap gap-1.5 items-center border rounded px-2 py-1.5 min-h-[40px] focus-within:ring-2 focus-within:ring-orange-400"
                        style={{ borderColor: 'var(--border-default)', background: 'var(--surface)' }}
                        onClick={() => tagInputRef.current?.focus()}
                    >
                        {selectedTags.map((tag, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            >
                                #{tag}
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                                    className="hover:text-orange-900 dark:hover:text-orange-200"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        {selectedTags.length < 5 && (
                            <input
                                ref={tagInputRef}
                                type="text"
                                className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
                                style={{ color: 'var(--text-primary)' }}
                                placeholder={selectedTags.length === 0 ? '태그 입력 후 Enter' : ''}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onFocus={() => tagSuggestions.length > 0 && setShowSuggestions(true)}
                            />
                        )}
                    </div>
                    {showSuggestions && tagSuggestions.length > 0 && (
                        <div
                            className="absolute z-10 w-full mt-1 rounded-lg border shadow-lg max-h-40 overflow-y-auto"
                            style={{ background: 'var(--surface)', borderColor: 'var(--border-default)' }}
                        >
                            {tagSuggestions.map((tag) => (
                                <button
                                    key={tag.id}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                    style={{ color: 'var(--text-primary)' }}
                                    onMouseDown={(e) => { e.preventDefault(); addTag(tag.name); }}
                                >
                                    #{tag.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={submit}
                    disabled={submitting || !url.trim()}
                    className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? '등록 중...' : '등록'}
                </button>
            </div>
        </main>
    )
}
