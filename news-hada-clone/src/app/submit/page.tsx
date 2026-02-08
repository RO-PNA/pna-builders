'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SubmitPage() {
    const router = useRouter()
    const [url, setUrl] = useState('')
    const [summary, setSummary] = useState('')
    const [category, setCategory] = useState('Article')

    const submit = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert('로그인이 필요합니다')
            return
        }

        const res = await fetch('/api/items', {
            method: 'POST',
            body: JSON.stringify({ url, summary, category }),
        })

        if (res.ok) {
            alert('등록 완료')
            router.push('/')
            router.refresh()
        } else {
            const errorData = await res.json().catch(() => ({}));
            console.error('Submit failed:', errorData);
            alert(`등록 실패: ${errorData.error || '알 수 없는 오류'}`);
        }
    }

    return (
        <main className="p-4 bg-white max-w-lg">
            <h1 className="text-2xl font-bold mb-6">글 등록</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input
                        className="w-full border p-2 rounded"
                        placeholder="URL"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
                    <textarea
                        className="w-full border p-2 rounded"
                        placeholder="요약"
                        value={summary}
                        onChange={e => setSummary(e.target.value)}
                        rows={4}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option>Trend</option>
                        <option>News</option>
                        <option>Article</option>
                        <option>Resource</option>
                        <option>Seminar</option>
                    </select>
                </div>

                <button
                    onClick={submit}
                    className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 font-bold"
                >
                    등록
                </button>
            </div>
        </main>
    )
}
