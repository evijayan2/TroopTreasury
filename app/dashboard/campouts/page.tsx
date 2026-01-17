import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CampoutList } from "@/components/campouts/campout-list"
import { CampoutForm } from "@/components/campouts/campout-form"
import { CampoutYearSelector } from "@/components/campouts/campout-year-selector"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const session = await auth()
    const role = session?.user?.role || "SCOUT"
    const canEdit = ["ADMIN", "FINANCIER", "LEADER"].includes(role)

    const params = await searchParams
    const currentYear = new Date().getFullYear()
    const selectedYear = params.year ? parseInt(params.year) : currentYear

    // Get all unique years from campouts
    const allCampouts = await prisma.campout.findMany({
        select: { startDate: true }
    })

    const yearsSet = new Set<number>()
    allCampouts.forEach(c => {
        yearsSet.add(new Date(c.startDate).getFullYear())
    })

    // Ensure current year is always available
    yearsSet.add(currentYear)

    const availableYears = Array.from(yearsSet).sort((a, b) => b - a) // Descending order

    // Filter campouts by selected year
    const startOfYear = new Date(selectedYear, 0, 1)
    const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59)

    const campouts = await prisma.campout.findMany({
        where: {
            startDate: {
                gte: startOfYear,
                lte: endOfYear
            }
        },
        orderBy: { startDate: 'desc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Campouts</h1>
                <div className="flex items-center gap-4">
                    <CampoutYearSelector availableYears={availableYears} currentYear={currentYear} />
                    {canEdit && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> Schedule Campout</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Schedule Campout</DialogTitle>
                                    <DialogDescription>
                                        Plan a new upcoming campout.
                                    </DialogDescription>
                                </DialogHeader>
                                <CampoutForm />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <CampoutList campouts={campouts} />
        </div>
    )
}
