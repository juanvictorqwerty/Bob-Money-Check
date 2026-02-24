"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Check localStorage or system preference
        const stored = localStorage.getItem("theme") as Theme | null
        if (stored) {
            setTheme(stored)
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark")
        }
    }, [])

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("theme", theme)
            document.documentElement.setAttribute("data-theme", theme)
        }
    }, [theme, mounted])

    const toggleTheme = () => {
        setTheme(prev => prev === "light" ? "dark" : "light")
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}

// Theme colors for consistent styling
export const themeColors = {
    light: {
        background: "#ffffff",
        surface: "#f5f5f5",
        text: "#000000",
        textSecondary: "#666666",
        border: "#dddddd",
        tableHeader: "#f9f9f9",
        tableRow: "#ffffff",
        tableRowAlt: "#f5f5f5",
        tableBorder: "#eeeeee",
        expanded: "#f0f8ff",
        input: "#ffffff",
    },
    dark: {
        background: "#1a1a1a",
        surface: "#2d2d2d",
        text: "#ffffff",
        textSecondary: "#aaaaaa",
        border: "#444444",
        tableHeader: "#2d2d2d",
        tableRow: "#1a1a1a",
        tableRowAlt: "#242424",
        tableBorder: "#3d3d3d",
        expanded: "#1e3a5f",
        input: "#2d2d2d",
    }
}
