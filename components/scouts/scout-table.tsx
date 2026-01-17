import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

export function ScoutTable({ scouts }: { scouts: any[] }) {
    if (scouts.length === 0) {
        return <div className="text-center text-gray-500 py-8">No scouts found.</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">IBA Balance</TableHead>
                    <TableHead className="text-right">Age</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {scouts.map((scout) => (
                    <TableRow key={scout.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                            <a href={`/dashboard/scouts/${scout.id}`} className="block w-full h-full">
                                {scout.name}
                            </a>
                        </TableCell>
                        <TableCell>
                            <Badge variant={scout.status === "ACTIVE" ? "default" : "secondary"}>
                                {scout.status}
                            </Badge>
                        </TableCell>
                        <TableCell className={`text-right ${Number(scout.ibaBalance) < 0 ? 'text-red-500 font-bold' : ''}`}>
                            {formatCurrency(Number(scout.ibaBalance))}
                        </TableCell>
                        <TableCell className="text-right">{scout.age || '-'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
