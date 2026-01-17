"use client"

import { useActionState } from "react"
import { authenticate } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden p-4">
            {/* Logo Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-full h-full max-w-4xl opacity-15 dark:opacity-10">
                    <img
                        src="/trooptreasury-logo-main.png"
                        alt="TroopTreasury Logo"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            {/* Login Card */}
            <Card className="w-full max-w-md relative z-10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-xl sm:text-2xl">TroopTreasury Login</CardTitle>
                    <CardDescription className="text-sm">
                        Enter your email and password to access the dashboard.
                    </CardDescription>
                </CardHeader>
                <form action={dispatch}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="m@example.com"
                                required
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                required
                                className="h-11"
                            />
                        </div>
                        {errorMessage && (
                            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-900">
                                {errorMessage}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full h-11 text-base" disabled={isPending}>
                            {isPending ? "Logging in..." : "Login"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
