import { InviteForm } from "@/components/auth/invite-form"
import { Suspense } from "react" // Required for useSearchParams equivalent wrapper if we were using it, but purely page props searchParams is async in Next 15, but this is Next 14?? Wait, Next 14 Page props searchParams is valid.
// Wait, for safety with 'use client' components inside, passing searchParams.token is fine.

export default async function InvitePage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>
}) {
    const { token } = await searchParams

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-500">Invalid invitation link. Token missing.</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <InviteForm token={token} />
        </div>
    )
}
