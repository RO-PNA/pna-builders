import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const errorDescription = searchParams.get('error_description')

    if (errorDescription) {
        return NextResponse.redirect(
            `${origin}/?auth_error=${encodeURIComponent(errorDescription)}`
        )
    }

    if (!code) {
        return NextResponse.redirect(`${origin}/?auth_error=missing_code`)
    }

    const supabase = await createSupabaseServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        return NextResponse.redirect(
            `${origin}/?auth_error=${encodeURIComponent(error.message)}`
        )
    }

    const safeNext = next.startsWith('/') ? next : '/'
    return NextResponse.redirect(`${origin}${safeNext}`)
}
