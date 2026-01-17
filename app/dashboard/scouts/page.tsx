import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ScoutTable } from "@/components/scouts/scout-table"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

export default async function Page() {
    const session = await auth()
    const role = session?.user?.role || "SCOUT"

    if (role === 'SCOUT') {
        // Scouts should not access this page.
        // (Sidebar link is hidden via permissions, but handle direct access)
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <h2 className="text-xl font-bold text-red-600">Unauthorized</h2>
            </div>
        )
    }

    // Filter scouts for Parents
    let whereClause: any = {}
    if (role === 'PARENT') {
        const parentScouts = await prisma.parentScout.findMany({
            where: { parentId: session?.user?.id },
            select: { scoutId: true }
        })
        whereClause = { id: { in: parentScouts.map(ps => ps.scoutId) } }
    }

    const rawScouts = await prisma.scout.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
    })

    const scouts = rawScouts.map(scout => ({
        ...scout,
        ibaBalance: Number(scout.ibaBalance), // Serialize for Client Components
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Scouts</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roster {role === 'PARENT' ? '(My Scouts)' : ''}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScoutTable scouts={scouts} />
                </CardContent>
            </Card>
        </div>
    )
}
