import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FundraisingDashboard } from "@/components/fundraising/fundraising-dashboard"

export default async function FundraisingPage() {
    const session = await auth()
    if (!session || !["ADMIN", "FINANCIER"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const campaigns = await prisma.fundraisingCampaign.findMany({
        orderBy: { startDate: 'desc' }
        // Fetch all campaigns (Active, Draft, Closed) - they will be grouped in the UI
    })

    // Transform Decimal to number for the client component
    const mappedCampaigns = campaigns.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        goal: c.goal.toNumber(),
        startDate: c.startDate,
        endDate: c.endDate
    }))

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Fundraising Management</h1>
                <p className="text-gray-500">Manage campaigns, track sales, and distribute funds.</p>
            </div>

            <FundraisingDashboard campaigns={mappedCampaigns} />
        </div>
    )
}
