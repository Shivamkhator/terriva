"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { cn } from "@/lib/utils"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

interface AnimatedThemeTogglerProps {
  duration?: number
}

export const ThemeToggle = ({ duration = 400 }: AnimatedThemeTogglerProps) => {
  const { setTheme, theme } = useTheme()
  const [isMac, setIsMac] = useState(false)
  const [mounted, setMounted] = useState(false)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current || !mounted) return
        const newTheme = theme === "dark" ? "light" : "dark"


    if (!document.startViewTransition) {
      setTheme(newTheme)
      return
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme)
      })
    }).ready

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  }, [theme, duration, setTheme, mounted])

  
  useEffect(() => {
    setMounted(true)
    // Detect Mac
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault()
        toggleTheme()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [toggleTheme])

  if(!mounted) return null

  const isDark = theme === "dark"

  return (
    <>
      <div className="fixed z-40 top-4 right-4 md:top-auto md:bottom-6 md:right-6 group">
        <button
          ref={buttonRef}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-full",
            "bg-card-overlay backdrop-blur-md border border-overlay",
            "text-text",
            "transition-all duration-300",
            "hover:-rotate-360"
          )}
        >

          {/* Icon with smooth transition */}
          <span className="relative z-10">
            <Sun
              className={cn(
                "h-5 w-5 absolute inset-0 transition-all duration-500",
                isDark ? "rotate-0 scale-100 opacity-100" : "rotate-360 scale-0 opacity-0"
              )}
            />
            <Moon
              className={cn(
                "h-5 w-5 transition-all duration-500",
                isDark ? "-rotate-360 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              )}
            />
          </span>
        </button>

      </div>

      {/* Keyboard shortcut indicator - top right, desktop only */}
      <div className="hidden md:block fixed bottom-24 right-2 z-40">

        <KbdGroup>
          <Kbd className="text-xs px-5 flex justify-center">Toggle Theme</Kbd>
        </KbdGroup>
        <KbdGroup className="flex mt-2">
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <span>+</span>
          <Kbd>⇧</Kbd>
          <span>+</span>
          <Kbd>D</Kbd>
        </KbdGroup>
      </div>
    </>
  )
}