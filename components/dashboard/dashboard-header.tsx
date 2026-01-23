"use client"

import { ThemeCustomizer } from "@/components/theme-customizer"
import { Bell, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import { Role } from "@prisma/client"
import { Permission } from "@/lib/rbac"
import { MobileNav } from "@/app/ui/dashboard/mobile-nav"

interface DashboardHeaderProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string
    }
    initialColor?: string
    initialTheme?: string
    role?: Role
    permissions?: Permission[]
    scoutId?: string
}

export function DashboardHeader({ user, initialColor, initialTheme, role, permissions, scoutId }: DashboardHeaderProps) {
    // Helper to get initials
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : "U"

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between md:justify-end gap-4 border-b bg-background px-6 shadow-sm">
            {/* Mobile Menu Trigger - Visible only on mobile */}
            <div className="md:hidden flex items-center gap-2">
                <MobileNav
                    role={role}
                    permissions={permissions || []}
                    scoutId={scoutId}
                    initialColor={initialColor || "orange"}
                    initialTheme={initialTheme || "system"}
                    user={user}
                />
                <Link href="/" className="flex items-center gap-2 ml-2">
                    <div className="relative h-8 w-8">
                        <Image
                            src="/trooptreasury-logo-main.png"
                            alt="TroopTreasury Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="font-semibold text-lg max-[350px]:hidden">TroopTreasury</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                {/* Notification Icon */}
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground relative" title="Notifications">
                    <Bell className="h-5 w-5" />
                    {/* <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" /> */}
                </Button>

                {/* Theme Customizer */}
                <ThemeCustomizer initialColor={initialColor || "orange"} initialTheme={initialTheme || "system"} />

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1">
                                    {user.role}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
