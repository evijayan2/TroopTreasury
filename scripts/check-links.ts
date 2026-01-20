
import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function checkLinks() {
    try {
        const budgetLinks = await prisma.transaction.count({
            where: { budgetCategoryId: { not: null } }
        })

        const campaignLinks = await prisma.transaction.count({
            where: { fundraisingCampaignId: { not: null } }
        })

        console.log(`Transactions with BudgetCategory: ${budgetLinks}`)
        console.log(`Transactions with FundraisingCampaign: ${campaignLinks}`)

        if (budgetLinks > 0) {
            const example = await prisma.transaction.findFirst({
                where: { budgetCategoryId: { not: null } }
            })
            console.log("Example Linked Transaction:", example)
        }

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

checkLinks()
