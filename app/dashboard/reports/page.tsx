import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export const dynamic = 'force-dynamic'

export default async function Page() {
    const session = await auth()

    // Fetch all transactions
    const transactions = await prisma.transaction.findMany({})
    const scouts = await prisma.scout.findMany({
        orderBy: { name: 'asc' }
    })

    // Calculate Totals
    const incomeTypes = ["REGISTRATION_INCOME", "FUNDRAISING_INCOME", "DONATION_IN", "DUES"]
    const expenseTypes = ["EXPENSE", "REIMBURSEMENT"]

    const totalIncome = transactions
        .filter(t => incomeTypes.includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpense = transactions
        .filter(t => expenseTypes.includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0)

    const netBalance = totalIncome - totalExpense

    // Calculate Scout Balances
    const scoutBalances = scouts.map(scout => {
        const scoutTx = transactions.filter(t => t.scoutId === scout.id)

        const credited = scoutTx
            .filter(t => incomeTypes.includes(t.type))
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const debited = scoutTx
            .filter(t => expenseTypes.includes(t.type))
            .reduce((sum, t) => sum + Number(t.amount), 0)

        return {
            ...scout,
            balance: credited - debited,
            totalCredited: credited,
            totalDebited: debited
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Treasury</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-black' : 'text-red-500'}`}>
                            {formatCurrency(netBalance)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Scout Account Balances</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Scout Name</TableHead>
                                <TableHead className="text-right">Total In (Credits)</TableHead>
                                <TableHead className="text-right">Total Out (Debits)</TableHead>
                                <TableHead className="text-right">Net Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scoutBalances.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No scouts found.</TableCell>
                                </TableRow>
                            ) : (
                                scoutBalances.map(scout => (
                                    <TableRow key={scout.id}>
                                        <TableCell className="font-medium">{scout.name}</TableCell>
                                        <TableCell className="text-right text-gray-500">{formatCurrency(scout.totalCredited)}</TableCell>
                                        <TableCell className="text-right text-gray-500">{formatCurrency(scout.totalDebited)}</TableCell>
                                        <TableCell className={`text-right font-bold ${scout.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(scout.balance)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
