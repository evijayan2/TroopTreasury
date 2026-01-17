"use client"

import { Button } from "@/components/ui/button"
import { DollarSign } from "lucide-react"

export function PayCashButton({ message }: { message: string }) {
    return (
        <Button variant="outline" size="sm" className="w-full" onClick={() => alert(message)}>
            <DollarSign className="w-3 h-3 mr-1" /> Pay Cash
        </Button>
    )
}
