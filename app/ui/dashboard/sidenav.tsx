import Link from "next/link"
import Image from "next/image"
import { Users, Home, TrendingUp, Tent, FileText, Settings } from "lucide-react"
import { ThemeCustomizer } from "@/components/theme-customizer"

import { auth } from "@/auth"
import { getRolePermissions, Permission } from "@/lib/rbac"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export default async function SideNav() {
    const session = await auth()
    const role = session?.user?.role as Role

    // Fetch permissions map
    const allPermissions = await getRolePermissions()
    // User permissions (Admin gets all by default implementation in helper, but let's be explicit here or reuse helper)
    // Actually helper `hasPermission` is one-off. Here we want the list.
    // Let's mimic what we did in `hasPermission` or just use the map directly.

    let userPermissions: Permission[] = []

    if (role === 'ADMIN') {
        // Admin has all permissions implicitly, or we can just fetch the ADMIN list from the map 
        // which serves as the "source of truth".
        // However, if we want Admins to be restricted, we should use the map. 
        // If we want Admins to be Superusers always, we grant all.
        // The previous design decision in `hasPermission` was "Admin always has access".
        // So let's stick to that for UI consistency.
        const { DEFAULT_PERMISSIONS } = await import("@/lib/rbac") // importing effectively
        userPermissions = DEFAULT_PERMISSIONS.ADMIN // Give all potential keys if we want, or just assume "has everything"
    } else if (role) {
        userPermissions = allPermissions[role] || []
    }

    const settings = await prisma.troopSettings.findFirst()
    const logoSrc = settings?.logoBase64 ? settings.logoBase64 : "/trooptreasury-logo-main.png"

    return (
        <div className="flex h-full flex-col border-r bg-gray-100/40 dark:bg-gray-800/40 px-3 py-4 md:px-2">
            <Link
                className="mb-2 flex h-20 items-end justify-start rounded-md bg-primary p-4 md:h-40"
                href="/"
            >
                <div className="flex w-full items-center justify-start">
                    <Image
                        src={logoSrc}
                        alt="TroopTreasury Logo"
                        width={160}
                        height={160}
                        className="w-full h-auto object-contain"
                        priority
                        unoptimized={!settings?.logoBase64} // Disable optimization for local large file
                    />
                </div>
            </Link>
            <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                <NavLinks role={role} permissions={userPermissions} />
                <div className="flex-1" />

                <div className="mb-2">
                    <ThemeCustomizer />
                </div>

                <div className="hidden w-full flex-col rounded-md bg-sidebar-accent p-3 md:flex">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate">
                        {session?.user?.name || "Troop User"}
                    </p>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">
                        {role}
                    </p>
                </div>

                <form action={async () => {
                    'use server';
                    const { signOut } = await import('@/auth');
                    await signOut();
                }}>
                    <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sidebar-accent hover:text-primary dark:bg-gray-800 dark:text-gray-50 md:flex-none md:justify-start md:p-2 md:px-3">
                        <div className="hidden md:block">Sign Out</div>
                    </button>
                </form>
            </div>
        </div>
    )
}

function NavLinks({ role, permissions }: { role?: Role, permissions: Permission[] }) {
    // Define links with their required permission
    const allLinks: { name: string, href: string, icon: any, permission?: Permission }[] = [
        { name: 'Dashboard', href: '/dashboard', icon: Home, permission: 'VIEW_DASHBOARD' },
        { name: 'Scouts', href: '/dashboard/scouts', icon: Users, permission: 'VIEW_SCOUTS' },
        { name: 'Transactions', href: '/dashboard/transactions', icon: TrendingUp, permission: 'VIEW_TRANSACTIONS' },
        { name: 'Campouts', href: '/dashboard/campouts', icon: Tent, permission: 'VIEW_CAMPOUTS' },
        { name: 'Reports', href: '/dashboard/reports', icon: FileText, permission: 'VIEW_REPORTS' },
        { name: 'Users', href: '/dashboard/users', icon: Users, permission: 'VIEW_USERS' },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings, permission: 'VIEW_SETTINGS' },
    ]

    const filteredLinks = allLinks.filter(link => {
        // If user is Admin, show everything?
        if (role === 'ADMIN') return true
        // If no specifically required permission (e.g. Dashboard might be public?), show it?
        // But we added VIEW_DASHBOARD perm.
        // If link has a required permission, check if user has it.
        if (link.permission) {
            return permissions.includes(link.permission)
        }
        return true
    })

    return (
        <>
            {filteredLinks.map((link) => {
                const LinkIcon = link.icon
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sidebar-accent hover:text-primary dark:bg-gray-800 dark:text-gray-50 md:flex-none md:justify-start md:p-2 md:px-3"
                    >
                        <LinkIcon className="w-6" />
                        <p className="hidden md:block">{link.name}</p>
                    </Link>
                )
            })}
        </>
    )
}
