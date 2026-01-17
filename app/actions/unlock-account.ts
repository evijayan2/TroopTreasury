"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Add this to app/actions.ts after the toggleUserStatus function

export async function unlockUserAccount(userId: string) {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                lastFailedLogin: null
            }
        })
        revalidatePath("/dashboard/users")
        return { success: true, message: "Account unlocked successfully" }
    } catch (error) {
        console.error("Unlock Account Error:", error)
        return { error: "Failed to unlock account" }
    }
}
