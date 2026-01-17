import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { Permission, DEFAULT_PERMISSIONS } from "./rbac-shared"

export * from "./rbac-shared"

export async function getRolePermissions(): Promise<Record<Role, Permission[]>> {
    const settings = await prisma.troopSettings.findFirst()
    if (settings?.rolePermissions) {
        return settings.rolePermissions as unknown as Record<Role, Permission[]>
    }
    return DEFAULT_PERMISSIONS
}

export async function hasPermission(role: Role, permission: Permission): Promise<boolean> {
    if (role === 'ADMIN') return true // Admin always has access

    const permissionsMap = await getRolePermissions()
    const rolePerms = permissionsMap[role] || []
    return rolePerms.includes(permission)
}
