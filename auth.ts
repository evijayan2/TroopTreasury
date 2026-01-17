import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

const { callbacks, ...authConfigRest } = authConfig

// Helper function to get session timeout from database
async function getSessionTimeout() {
    try {
        const settings = await prisma.troopSettings.findFirst()
        return (settings?.sessionTimeoutMinutes || 15) * 60 // Convert to seconds
    } catch (error) {
        console.error("Failed to fetch session timeout:", error)
        return 15 * 60 // Default 15 minutes in seconds
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfigRest,
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
        maxAge: 15 * 60, // Default 15 minutes, will be overridden by JWT callback
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            // Set dynamic session timeout
            const timeoutSeconds = await getSessionTimeout()
            token.exp = Math.floor(Date.now() / 1000) + timeoutSeconds
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                // Validate that user still exists and is active
                try {

                    const user = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { id: true, isActive: true, role: true }
                    })

                    // If user doesn't exist or is not active, invalidate session
                    if (!user || !user.isActive) {

                        return null as any // This will force logout
                    }

                    session.user.role = user.role as any
                    session.user.id = user.id
                } catch (error) {
                    console.error("Session validation error:", error)
                }
            }
            return session
        },
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                try {

                    const parsedCredentials = z
                        .object({ email: z.string().email(), password: z.string().min(1) })
                        .safeParse(credentials)

                    if (!parsedCredentials.success) {

                        return null
                    }

                    const { email, password } = parsedCredentials.data
                    const lowercaseEmail = email.toLowerCase()




                    const user = await prisma.user.findUnique({ where: { email: lowercaseEmail } })

                    if (!user) {
                        console.log(`User not found in DB for email: "${lowercaseEmail}"`)
                        return null
                    }



                    // Check if account is locked
                    if (user.lockedUntil && user.lockedUntil > new Date()) {
                        const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)

                        return null
                    }

                    // Reset lock if expired
                    if (user.lockedUntil && user.lockedUntil <= new Date()) {

                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                lockedUntil: null,
                                failedLoginAttempts: 0
                            }
                        })
                    }

                    if (!user.passwordHash) {

                        return null
                    }


                    const passwordsMatch = await bcrypt.compare(password, user.passwordHash)


                    if (passwordsMatch) {

                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                failedLoginAttempts: 0,
                                lastFailedLogin: null,
                                lockedUntil: null
                            }
                        })
                        return user
                    } else {

                        const newAttempts = (user.failedLoginAttempts || 0) + 1
                        const shouldLock = newAttempts >= 5

                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                failedLoginAttempts: newAttempts,
                                lastFailedLogin: new Date(),
                                lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null
                            }
                        })

                        if (shouldLock) {

                        }
                        return null
                    }
                } catch (error: any) {
                    console.error("CRITICAL ERROR in authorize function:")
                    console.error("Message:", error.message)
                    if (error.code) console.error("Code:", error.code)
                    if (error.clientVersion) console.error("Client Version:", error.clientVersion)
                    return null
                } finally {

                }
            },
        }),
    ],
})
