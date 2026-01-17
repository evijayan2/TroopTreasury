import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TroopSettingsForm } from "@/components/settings/troop-settings-form"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const settings = await prisma.troopSettings.findFirst()

    // If settings exist and have a name, maybe we should redirect to dashboard?
    // But user might want to edit it here if they navigated manually.
    // For automatic redirection logic, we'll handle it in the layout/middleware.

    return (
        <div className="p-6">
            <TroopSettingsForm initialData={settings} className="max-w-xl mx-auto mt-10" />
        </div>
    )
}
