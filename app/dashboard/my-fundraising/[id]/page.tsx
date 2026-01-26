import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { OrderManager } from "@/components/fundraising/OrderManager"
import { EventParticipationManager } from "@/components/fundraising/event-participation-manager"

export default async function ScoutCampaignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session?.user) return <div>Unauthorized</div>

    let scout = await prisma.scout.findUnique({
        where: { userId: session.user.id }
    })

    if (!scout) {
        // If not a scout, check if they are a parent of a scout
        const parentLink = await prisma.parentScout.findFirst({
            where: { parentId: session.user.id },
            include: { scout: true }
        })

        if (parentLink) {
            scout = parentLink.scout
        }
    }

    if (!scout) {
        return <div className="p-6">You must be logged in as a connected Scout or Parent to manage orders.</div>
    }

    const campaign = await prisma.fundraisingCampaign.findUnique({
        where: { id },
        include: { products: true }
    })

    if (!campaign) notFound()

    if (campaign.type === 'GENERAL') {
        const sale = await prisma.fundraisingSale.findUnique({
            where: { campaignId_scoutId: { campaignId: id, scoutId: scout.id } }
        })
        const volunteer = await prisma.fundraisingVolunteer.findUnique({
            where: { campaignId_scoutId: { campaignId: id, scoutId: scout.id } }
        })

        // Fetch Logs
        const logs = await prisma.fundraisingOrder.findMany({
            where: { campaignId: id, scoutId: scout.id },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        })

        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{campaign.name}</h2>
                    <p className="text-muted-foreground">{campaign.description || "General Event"}</p>
                </div>
                <EventParticipationManager
                    campaign={{
                        ...campaign,
                        goal: campaign.goal.toString(),
                        ticketPrice: campaign.ticketPrice?.toNumber() ?? 0,
                        volunteerPercentage: campaign.volunteerPercentage?.toNumber() ?? 0,
                    }}
                    salesCount={sale?.quantity || 0}
                    isVolunteering={!!volunteer}
                    scoutId={scout.id}
                    logs={logs.map(l => ({
                        ...l,
                        amountPaid: l.amountPaid.toNumber(),
                        product: l.product ? {
                            ...l.product,
                            price: l.product.price.toNumber(),
                            cost: l.product.cost.toNumber(),
                            ibaAmount: l.product.ibaAmount.toNumber()
                        } : null
                    }))}
                />
            </div>
        )
    }

    // Default to Product Sale (Orders)
    const orders = await prisma.fundraisingOrder.findMany({
        where: {
            campaignId: id,
            scoutId: scout.id
        },
        include: { product: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{campaign.name}</h2>
                <p className="text-muted-foreground">Manage your sales and participation</p>
            </div>

            <OrderManager
                campaign={{
                    ...campaign,
                    goal: campaign.goal.toNumber(),
                    ticketPrice: campaign.ticketPrice?.toNumber() ?? 0,
                    volunteerPercentage: campaign.volunteerPercentage?.toNumber() ?? 0,
                    ibaPercentage: campaign.ibaPercentage,
                    products: campaign.products.map((p: any) => ({
                        ...p,
                        price: p.price.toNumber(),
                        cost: p.cost.toNumber(),
                        ibaAmount: p.ibaAmount.toNumber()
                    }))
                } as any}
                orders={orders.map(o => ({
                    ...o,
                    amountPaid: o.amountPaid.toString(),
                    product: o.product ? {
                        ...o.product,
                        price: o.product.price.toString(),
                        cost: o.product.cost.toString(),
                        ibaAmount: o.product.ibaAmount.toString()
                    } : null
                }))}
                scoutId={scout.id}
            />
        </div>
    )
}
