'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function factoryResetData() {
    const session = await auth()

    if (session?.user?.role !== Role.ADMIN) {
        throw new Error("Unauthorized: Only Admins can perform a factory reset.")
    }

    console.log('⚠️  Starting Factory Reset (preserving Admins & TroopSettings)...')

    // 1. FundraisingOrder
    await prisma.fundraisingOrder.deleteMany()

    // 2. FundraisingSale
    await prisma.fundraisingSale.deleteMany()

    // 3. AdultExpense
    await prisma.adultExpense.deleteMany()

    // 4. CampoutAdult
    await prisma.campoutAdult.deleteMany()

    // 5. CampoutScout
    await prisma.campoutScout.deleteMany()

    // 6. ParentScout
    await prisma.parentScout.deleteMany()

    // 7. Transaction
    await prisma.transaction.deleteMany()

    // 8. Campout
    await prisma.campout.deleteMany()

    // 9. FundraisingCampaign
    await prisma.fundraisingCampaign.deleteMany()

    // 10. BudgetCategory
    await prisma.budgetCategory.deleteMany()

    // 11. Budget
    await prisma.budget.deleteMany()

    // 12. Scout
    await prisma.scout.deleteMany()

    // 13. User (except ADMIN)
    const { count } = await prisma.user.deleteMany({
        where: {
            role: {
                not: Role.ADMIN
            }
        }
    })
    console.log(`✅ Deleted ${count} non-admin Users`)

    console.log('\n🎉 Factory Reset Complete!')

    revalidatePath("/")
    revalidatePath("/dashboard")
}
