import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const settings = await prisma.troopSettings.findFirst()

        if (!settings || !settings.logoBase64) {
            return new NextResponse("Logo not found", { status: 404 })
        }

        // Parse Data URI: "data:image/png;base64,ABC..."
        const match = settings.logoBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)

        if (!match) {
            return new NextResponse("Invalid logo format", { status: 500 })
        }

        const mimeType = match[1]
        const base64Data = match[2]
        const buffer = Buffer.from(base64Data, 'base64')

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=31536000, immutable",
            }
        })

    } catch (error) {
        console.error("Error serving logo:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
