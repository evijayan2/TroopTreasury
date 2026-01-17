"use client"

import * as React from "react"
import { Monitor, Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"

export function ThemeCustomizer() {
    const { theme, setTheme } = useTheme()

    // For color themes, we might need a separate state or just use data attributes managed by a script
    // Or simpler: we can just toggle classes on the body if we weren't using next-themes for just dark/light.
    // Actually next-themes supports multiple themes.
    // Let's assume we used "light", "dark", "system".
    // If we want "blue", "orange", "green" in light/dark variants, that's complex.

    // Simpler approach: Use a separate context or just DOM manipulation for color theme variables since next-themes handles dark/light interaction well.
    // BUT, we want to persist it.

    // Let's try to stick to "primary color" toggle using a simple effect or just adding a class to <body> alongside standard dark/light classes.

    const [color, setColor] = React.useState<"orange" | "blue" | "green">("orange")

    React.useEffect(() => {
        // Read from local storage
        const savedColor = localStorage.getItem("theme-color") as "orange" | "blue" | "green"
        if (savedColor) setColor(savedColor)
    }, [])

    const setAppColor = (c: "orange" | "blue" | "green") => {
        setColor(c)
        localStorage.setItem("theme-color", c)
        document.documentElement.setAttribute("data-color", c)
    }

    // Initialize on mount/load to avoid flash - this component mounts late effectively.
    // Ideally this script should be in head, but effects work 'okay' for MVP.
    React.useEffect(() => {
        document.documentElement.setAttribute("data-color", color)
    }, [color])


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full justify-start md:justify-center">
                    <Palette className="h-[1.2rem] w-[1.2rem]" />
                    <span className="ml-2 md:hidden">Theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mode</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Color</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setAppColor("orange")}>
                    <div className="w-4 h-4 rounded-full bg-[#e48b2c] mr-2" />
                    Orange (Default)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAppColor("blue")}>
                    <div className="w-4 h-4 rounded-full bg-blue-600 mr-2" />
                    Blue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAppColor("green")}>
                    <div className="w-4 h-4 rounded-full bg-green-600 mr-2" />
                    Green
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
