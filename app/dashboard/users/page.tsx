import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { UserTable } from "@/components/users/user-table"
import { UserForm } from "@/components/users/user-form"

export default async function Page() {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
        redirect("/dashboard")
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            parentLinks: {
                include: { scout: true }
            },
            scout: true // Include linked identity scout
        },
    })

    const allScouts = await prisma.scout.findMany({
        orderBy: { name: 'asc' }
    })

    // Serialize generic Decimal objects for generic Client Component prop passing
    const serializedScouts = allScouts.map(scout => ({
        ...scout,
        ibaBalance: scout.ibaBalance.toNumber(),
    }))

    const serializedUsers = users.map(user => ({
        ...user,
        parentLinks: user.parentLinks.map(link => ({
            ...link,
            scout: {
                ...link.scout,
                ibaBalance: link.scout.ibaBalance.toNumber()
            }
        })),
        scout: user.scout ? {
            ...user.scout,
            ibaBalance: user.scout.ibaBalance.toNumber()
        } : null
    }))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">User Management</h1>
                <UserForm />
            </div>

            <UserTable users={serializedUsers} allScouts={serializedScouts} />
        </div>
    )
}
