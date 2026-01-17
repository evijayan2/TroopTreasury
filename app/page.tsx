import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const userCount = await prisma.user.count()
  const isFreshInstall = userCount === 0

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-background">
      {/* Logo Background - More Visible */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full max-w-4xl opacity-15 dark:opacity-10">
          <img
            src="/trooptreasury-logo-main.png"
            alt="TroopTreasury Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 px-4">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent leading-tight">
            TroopTreasury
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl px-4">
            Secure, simple finance management for your scout troop.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto">
          {isFreshInstall ? (
            <Link href="/setup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 min-h-[48px]">
                Setup TroopTreasury
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 min-h-[48px]">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
