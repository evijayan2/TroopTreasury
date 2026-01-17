'use server'

import { prisma } from "@/lib/prisma"
import { Role, Prisma, ScoutStatus, CampoutStatus, TransactionType, TransactionStatus, CampoutAdultRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { Decimal } from "decimal.js"

export async function generateReplayJson() {
  const defaultPassword = "123456"
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  // Fetch all data
  const allUsers = await prisma.user.findMany()
  const allScouts = await prisma.scout.findMany()
  const allCampouts = await prisma.campout.findMany()
  const allCampoutScouts = await prisma.campoutScout.findMany()
  const allCampoutAdults = await prisma.campoutAdult.findMany()
  const allTransactions = await prisma.transaction.findMany()
  const allAdultExpenses = await prisma.adultExpense.findMany()
  const allParentScouts = await prisma.parentScout.findMany()
  const troopSettings = await prisma.troopSettings.findFirst()

  // Filter out Admins
  const adminIds = new Set(allUsers.filter(u => u.role === Role.ADMIN).map(u => u.id))

  const usersToExport = allUsers.filter(u => !adminIds.has(u.id)).map(u => ({
    ...u,
    passwordHash: hashedPassword,
    invitationToken: null,
    invitationExpires: null
  }))

  const scoutsToExport = allScouts.map(s => ({
    ...s,
    userId: s.userId && adminIds.has(s.userId) ? null : s.userId
  }))

  const parentScoutsToExport = allParentScouts.filter(ps => !adminIds.has(ps.parentId))
  const campoutAdultsToExport = allCampoutAdults.filter(ca => !adminIds.has(ca.adultId))
  const adultExpensesToExport = allAdultExpenses.filter(ae => !adminIds.has(ae.adultId))
  const transactionsToExport = allTransactions
    .filter(t => !t.userId || !adminIds.has(t.userId))
    .map(t => ({
      ...t,
      approvedBy: t.approvedBy && adminIds.has(t.approvedBy) ? null : t.approvedBy
    }))

  return JSON.stringify({
    troopSettings: troopSettings ? {
      ...troopSettings,
      rolePermissions: troopSettings.rolePermissions // Ensure JSON compatibility
    } : null,
    users: usersToExport,
    scouts: scoutsToExport,
    parentScouts: parentScoutsToExport,
    campouts: allCampouts,
    campoutScouts: allCampoutScouts,
    campoutAdults: campoutAdultsToExport,
    adultExpenses: adultExpensesToExport,
    transactions: transactionsToExport
  }, null, 2)
}

export async function restoreFromReplayJson(jsonString: string) {
  try {
    const data = JSON.parse(jsonString)

    // 1. Troop Settings
    if (data.troopSettings) {
      await prisma.troopSettings.upsert({
        where: { id: data.troopSettings.id },
        update: {},
        create: {
          ...data.troopSettings,
          updatedAt: new Date(data.troopSettings.updatedAt)
        }
      })
    }

    // 2. Users
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          deactivatedAt: user.deactivatedAt ? new Date(user.deactivatedAt) : null,
          invitationExpires: user.invitationExpires ? new Date(user.invitationExpires) : null
        }
      })
    }

    // 3. Scouts
    for (const scout of data.scouts) {
      await prisma.scout.upsert({
        where: { id: scout.id },
        update: {},
        create: {
          ...scout,
          ibaBalance: new Decimal(scout.ibaBalance),
          createdAt: new Date(scout.createdAt),
          updatedAt: new Date(scout.updatedAt),
        }
      })
    }

    // 4. ParentScout
    for (const ps of data.parentScouts) {
      const parentExists = await prisma.user.findUnique({ where: { id: ps.parentId } })
      const scoutExists = await prisma.scout.findUnique({ where: { id: ps.scoutId } })

      if (parentExists && scoutExists) {
        await prisma.parentScout.upsert({
          where: { parentId_scoutId: { parentId: ps.parentId, scoutId: ps.scoutId } },
          update: {},
          create: ps
        })
      }
    }

    // 5. Campouts
    for (const campout of data.campouts) {
      await prisma.campout.upsert({
        where: { id: campout.id },
        update: {},
        create: {
          ...campout,
          startDate: new Date(campout.startDate),
          endDate: campout.endDate ? new Date(campout.endDate) : null,
          estimatedCost: campout.estimatedCost ? new Decimal(campout.estimatedCost) : null,
          createdAt: new Date(campout.createdAt),
          updatedAt: new Date(campout.updatedAt),
        }
      })
    }

    // 6. CampoutScout
    for (const cs of data.campoutScouts) {
      await prisma.campoutScout.upsert({
        where: { campoutId_scoutId: { campoutId: cs.campoutId, scoutId: cs.scoutId } },
        update: {},
        create: {
          ...cs,
          registeredAt: new Date(cs.registeredAt)
        }
      })
    }

    // 7. CampoutAdult
    for (const ca of data.campoutAdults) {
      // Need to ensure adult exists, though we should have imported them. 
      // If the adult was an admin (filtered out), this entry wouldn't be in the JSON anyway.
      const adultExists = await prisma.user.findUnique({ where: { id: ca.adultId } })
      if (adultExists) {
        await prisma.campoutAdult.upsert({
          where: {
            campoutId_adultId_role: {
              campoutId: ca.campoutId,
              adultId: ca.adultId,
              role: ca.role
            }
          },
          update: {},
          create: ca
        })
      }
    }

    // 8. AdultExpenses
    for (const ae of data.adultExpenses) {
      const adultExists = await prisma.user.findUnique({ where: { id: ae.adultId } })
      if (adultExists) {
        await prisma.adultExpense.upsert({
          where: { id: ae.id },
          update: {},
          create: {
            ...ae,
            amount: new Decimal(ae.amount),
            createdAt: new Date(ae.createdAt)
          }
        })
      }
    }

    // 9. Transactions
    for (const t of data.transactions) {
      // Ensure relations if they exist
      // userId, scoutId, campoutId, approvedBy
      // If userId refers to a missing user (e.g. filtered admin), we shouldn't insert?
      // But we filtered transactions already.

      await prisma.transaction.upsert({
        where: { id: t.id },
        update: {},
        create: {
          ...t,
          amount: new Decimal(t.amount),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }
      })
    }

    return { success: true }

  } catch (e) {
    console.error("Restore failed:", e)
    return { success: false, error: String(e) }
  }
}
