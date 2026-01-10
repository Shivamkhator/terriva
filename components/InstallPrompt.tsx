"use client"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {

    // iOS detection
    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    setIsIOS(ios)

    // Detect standalone mode (already installed)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true

    setIsInstalled(standalone)

    // Chrome / Android install event
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  // Show iOS helper if not installed
  useEffect(() => {
    if (isIOS && !isInstalled) {
      setShowPrompt(true)
    }
  }, [isIOS, isInstalled])

  if (!showPrompt || isInstalled) return null

  return (isIOS && (
    <div
      className="fixed bottom-16 left-1/2 z-999 w-[90%] max-w-sm -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-center text-background shadow-lg animate-in slide-in-from-bottom-3 duration-300"
      role="dialog"
      aria-labelledby="install-title"
    >
      <div className="flex flex-col items-center">
        <p id="install-title" className="font-semibold">Install Terriva on Home Screen</p>
        <p className="font-semibold text-sm">
          Tap ⋮ and then
          <br />
          <span className="font-semibold text-sm">Add to Home Screen</span>
        </p>
      </div>
    </div>
  ))
}