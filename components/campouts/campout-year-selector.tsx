'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function CampoutYearSelector({ availableYears, currentYear }: { availableYears: number[], currentYear: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedYear = searchParams.get('year') || currentYear.toString()

    const handleYearChange = (year: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('year', year)
        router.push(`?${params.toString()}`)
    }

    return (
        <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
                {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                        {year}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
