import { useEffect, useState, type ReactNode } from 'react'
import type { Theme } from './theme.context'
import { ThemeContext } from './theme.context'

export default function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme')
        const initialTheme = (saved === 'light' || saved === 'dark') ? saved : 'light'
        
        const root = document.documentElement
        if (initialTheme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        
        return initialTheme
    })

    useEffect(() => {
        const root = document.documentElement
        if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme((prev) => {
            const newTheme = prev === 'light' ? 'dark' : 'light'
            const root = document.documentElement
            if (newTheme === 'dark') {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
            localStorage.setItem('theme', newTheme)
            return newTheme
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
