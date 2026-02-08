'use client'

import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <button onClick={handleLogout} className="text-sm font-medium hover:underline">
            logout
        </button>
    )
}
