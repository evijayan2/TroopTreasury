import { SideNav } from "@/app/ui/dashboard/sidenav";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Permission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Footer } from "@/components/footer";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SessionTimeoutProvider } from "@/components/auth/session-timeout-provider";
import { AuthProvider } from "@/components/auth/auth-provider";

export default async function Layout({ children }: { children: React.ReactNode }) {
    // Check auth
    const session = await auth()

    const settings = await prisma.troopSettings.findFirst()

    if (session?.user?.role === 'ADMIN') {
        // Redirect to onboarding if settings are missing
        if (!settings) {
            redirect("/onboarding")
        }
    }

    // Fetch permissions map
    const role = session?.user?.role as Role
    let userPermissions: Permission[] = []
    let scoutId: string | undefined

    if (role === 'ADMIN') {
        const { DEFAULT_PERMISSIONS } = await import("@/lib/rbac")
        userPermissions = DEFAULT_PERMISSIONS.ADMIN
    } else if (role) {
        const { getRolePermissions } = await import("@/lib/rbac")
        const allPermissions = await getRolePermissions()
        userPermissions = allPermissions[role] || []
    }

    if (role === 'SCOUT' && session?.user?.id) {
        const scout = await prisma.scout.findUnique({
            where: { userId: session.user.id }
        })
        scoutId = scout?.id
    }

    // Fetch user preferences for the header
    let initialColor = "orange"
    let initialTheme = "system"
    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { preferredColor: true, preferredTheme: true }
        })
        if (user) {
            initialColor = user.preferredColor || "orange"
            initialTheme = user.preferredTheme || "system"
        }
    }

    return (
        <AuthProvider session={session}>
            <SessionTimeoutProvider timeoutMinutes={settings?.sessionTimeoutMinutes || 15}>
                <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
                    <div className="hidden md:block w-64 flex-none">
                        <SideNav
                            role={role}
                            permissions={userPermissions}
                            scoutId={scoutId}
                        />
                    </div>
                    <div className="flex-grow flex flex-col md:overflow-y-auto bg-gray-50/50 dark:bg-background">
                        {/* Static Header */}
                        <DashboardHeader
                            user={session?.user || {}}
                            initialColor={initialColor}
                            initialTheme={initialTheme}
                            role={role}
                            permissions={userPermissions}
                            scoutId={scoutId}
                        />

                        <div className="flex-grow p-6 md:p-12 pt-6">
                            <Breadcrumbs />
                            {children}
                        </div>
                        <Footer />
                    </div>
                </div>
            </SessionTimeoutProvider>
        </AuthProvider>
    );
}
