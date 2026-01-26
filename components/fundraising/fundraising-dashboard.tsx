"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ChevronDown, ChevronRight, Play, FileEdit, Archive } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface Campaign {
    id: string
    name: string
    type: string
    status: string
    goal: number
    startDate: Date
    endDate?: Date | null
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
    const statusVariant = campaign.status === 'ACTIVE' ? 'default' :
        campaign.status === 'DRAFT' ? 'secondary' : 'outline'

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {campaign.name}
                </CardTitle>
                <Badge variant={statusVariant}>
                    {campaign.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(campaign.goal)} Goal</div>
                <p className="text-xs text-muted-foreground">
                    {campaign.type.replace("_", " ")}
                </p>
                <div className="mt-4">
                    <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/dashboard/fundraising/campaigns/${campaign.id}`}>
                            Manage Campaign
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function CampaignSection({
    title,
    campaigns,
    icon: Icon,
    defaultExpanded = true,
    emptyMessage
}: {
    title: string
    campaigns: Campaign[]
    icon: React.ComponentType<{ className?: string }>
    defaultExpanded?: boolean
    emptyMessage: string
}) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    return (
        <div className="space-y-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 w-full text-left hover:bg-muted/50 p-2 -ml-2 rounded-lg transition-colors"
            >
                {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">{title}</h2>
                <Badge variant="secondary" className="ml-2">{campaigns.length}</Badge>
            </button>

            {isExpanded && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-7">
                    {campaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}

                    {campaigns.length === 0 && (
                        <div className="col-span-full text-center py-6 text-gray-500 bg-muted/30 rounded-lg">
                            {emptyMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function CollapsibleStatusSection({
    title,
    count,
    icon: Icon,
    defaultOpen = false,
    children
}: {
    title: string
    count: number
    icon: any
    defaultOpen?: boolean
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="space-y-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full text-left hover:bg-muted/50 p-2 -ml-2 rounded-lg transition-colors group"
            >
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                )}
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">{title}</span>
                <Badge variant="outline" className="ml-auto text-xs">{count}</Badge>
            </button>

            {isOpen && (
                <div className="pl-6 animate-in fade-in-0 zoom-in-95 duration-200">
                    {children}
                </div>
            )}
        </div>
    )
}

import { FundraisingYearGroup } from "./fundraising-year-group"

export function FundraisingDashboard({ campaigns }: { campaigns: Campaign[] }) {
    // Group campaigns by year
    const campaignsByYear: Record<number, Campaign[]> = {}
    campaigns.forEach(campaign => {
        const year = new Date(campaign.startDate).getFullYear()
        if (!campaignsByYear[year]) {
            campaignsByYear[year] = []
        }
        campaignsByYear[year].push(campaign)
    })

    const currentYear = new Date().getFullYear()
    const sortedYears = Object.keys(campaignsByYear)
        .map(Number)
        .sort((a, b) => b - a) // Descending year order

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Fundraising Campaigns</h1>
                <Button asChild>
                    <Link href="/dashboard/fundraising/new">
                        <Plus className="mr-2 h-4 w-4" /> New Campaign
                    </Link>
                </Button>
            </div>

            {sortedYears.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                    No campaigns found. Create one to get started!
                </div>
            ) : (
                sortedYears.map(year => {
                    const yearCampaigns = campaignsByYear[year]
                    const active = yearCampaigns.filter(c => c.status === 'ACTIVE')
                    const draft = yearCampaigns.filter(c => c.status === 'DRAFT')
                    const closed = yearCampaigns.filter(c => c.status === 'CLOSED')

                    return (
                        <FundraisingYearGroup
                            key={year}
                            year={year}
                            campaigns={yearCampaigns}
                            defaultOpen={year === currentYear || year === currentYear + 1}
                        >
                            <div className="space-y-4">
                                {active.length > 0 && (
                                    <CollapsibleStatusSection
                                        title="Active Campaigns"
                                        count={active.length}
                                        icon={Play}
                                        defaultOpen={true}
                                    >
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {active.map(campaign => (
                                                <CampaignCard key={campaign.id} campaign={campaign} />
                                            ))}
                                        </div>
                                    </CollapsibleStatusSection>
                                )}

                                {draft.length > 0 && (
                                    <CollapsibleStatusSection
                                        title="Drafts"
                                        count={draft.length}
                                        icon={FileEdit}
                                        defaultOpen={true}
                                    >
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {draft.map(campaign => (
                                                <CampaignCard key={campaign.id} campaign={campaign} />
                                            ))}
                                        </div>
                                    </CollapsibleStatusSection>
                                )}

                                {closed.length > 0 && (
                                    <CollapsibleStatusSection
                                        title="Closed / Archived"
                                        count={closed.length}
                                        icon={Archive}
                                        defaultOpen={false}
                                    >
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {closed.map(campaign => (
                                                <CampaignCard key={campaign.id} campaign={campaign} />
                                            ))}
                                        </div>
                                    </CollapsibleStatusSection>
                                )}
                            </div>
                        </FundraisingYearGroup>
                    )
                })
            )}
        </div>
    )
}
