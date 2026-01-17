import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { TransactionType } from "@prisma/client"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default async function Page() {
    const session = await auth()
    const role = session?.user?.role || "SCOUT"
    const canEdit = ["ADMIN", "FINANCIER"].includes(role)

    const whereClause: any = {
        NOT: {
            AND: [
                { type: { in: [TransactionType.REGISTRATION_INCOME, TransactionType.EVENT_PAYMENT] } },
                { campoutId: { not: null } }
            ]
        }
    }

    if (role === 'PARENT' && session?.user?.id) {
        whereClause.scout = {
            parentLinks: {
                some: {
                    parentId: session.user.id
                }
            }
        }
    }

    const rawTransactions = await prisma.transaction.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            scout: true // Include scout name
        }
    })

    const transactions = rawTransactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        scout: tx.scout ? {
            ...tx.scout,
            ibaBalance: Number(tx.scout.ibaBalance)
        } : null
    }))

    const rawScouts = await prisma.scout.findMany({
        where: role === 'PARENT' && session?.user?.id ? {
            parentLinks: { some: { parentId: session.user.id } }
        } : {},
        orderBy: { name: 'asc' }
    })

    const scouts = rawScouts.map(s => ({ ...s, ibaBalance: Number(s.ibaBalance) }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Transactions {role === 'PARENT' ? '(My Scouts)' : ''}</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Transaction</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add Transaction</DialogTitle>
                            <DialogDescription>
                                Record a new income or expense.
                            </DialogDescription>
                        </DialogHeader>
                        <TransactionForm scouts={scouts} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <TransactionTable transactions={transactions} />
                </CardContent>
            </Card>
        </div>
    )
}
