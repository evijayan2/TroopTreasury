"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Unlock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function UnlockAccountButton({ userId, onUnlock }: { userId: string, onUnlock?: () => void }) {
    const [loading, setLoading] = useState(false)

    const handleUnlock = async () => {
        setLoading(true)
        try {
            const { unlockUserAccount } = await import("@/app/actions/unlock-account")
            const result = await unlockUserAccount(userId)

            if (result.success) {
                onUnlock?.()
            } else {
                alert(result.error || "Failed to unlock account")
            }
        } catch (error) {
            console.error("Unlock error:", error)
            alert("Failed to unlock account")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUnlock}
                    disabled={loading}
                >
                    <Unlock className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                Unlock account (reset failed login attempts)
            </TooltipContent>
        </Tooltip>
    )
}
