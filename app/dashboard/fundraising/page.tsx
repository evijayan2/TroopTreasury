import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FundraisingForm } from "@/components/fundraising/fundraising-form"

export default async function FundraisingPage() {
    const session = await auth()
    if (!session || !["ADMIN", "FINANCIER"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const scouts = await prisma.scout.findMany({
        orderBy: { name: 'asc' },
        where: { status: 'ACTIVE' },
        select: { id: true, name: true }
    })

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Fundraising Distribution</h1>
                <p className="text-gray-500">Record a campaign and allocate shares to scouts or external expenses.</p>
            </div>

            <FundraisingForm scouts={scouts} />
        </div>
    )
}
