"use client"

import { removeAdultFromCampout, removeScoutFromCampout } from "@/app/actions"
import { Trash2 } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface RemoveParticipantButtonProps {
    campoutId: string
    id: string
    type: 'ADULT' | 'SCOUT'
}

export function RemoveParticipantButton({ campoutId, id, type }: RemoveParticipantButtonProps) {

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to remove this person from the campout?")) return

        if (type === 'ADULT') {
            await removeAdultFromCampout(campoutId, id)
        } else {
            await removeScoutFromCampout(campoutId, id)
        }
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-500 ml-2"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Remove from campout</p>
            </TooltipContent>
        </Tooltip>
    )
}
