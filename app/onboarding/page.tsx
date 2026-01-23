import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TroopSettingsForm } from "@/components/settings/troop-settings-form"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        await signOut({ redirectTo: "/login" })
    }

    const settings = await prisma.troopSettings.findFirst()

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-background p-6">
            <div className="w-full max-w-2xl text-center space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Complete Troop Setup</h1>
                <TroopSettingsForm initialData={settings} className="bg-white dark:bg-card p-6 rounded-lg shadow-md" />
            </div>
        </div>
    )
}
