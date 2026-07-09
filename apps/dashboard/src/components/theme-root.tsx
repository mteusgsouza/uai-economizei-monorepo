import { useEffect, type ReactNode } from "react"

interface ThemeRootProps {
  theme: "light" | "dark"
  children: ReactNode
}

export function ThemeRoot({ theme, children }: ThemeRootProps) {
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    return () => {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  return <>{children}</>
}
