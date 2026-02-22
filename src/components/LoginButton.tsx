'use client'

import { supabase } from '@/utils/supabase/client'

export default function LoginButton() {
    const login = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: location.origin,
            },
        })
    }

    return (
        <button onClick={login} className="text-sm font-medium hover:underline">
            login
        </button>
    )
}
