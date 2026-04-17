'use client'

import { supabase } from '@/utils/supabase/client'
import { usePathname } from 'next/navigation'

export default function LoginButton({ label = 'Login' }: { label?: string }) {
    const pathname = usePathname()

    const login = async () => {
        const next = encodeURIComponent(pathname || '/')
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback?next=${next}`,
            },
        })
    }

    return (
        <button onClick={login} className="text-sm font-medium hover:underline">
            {label}
        </button>
    )
}
