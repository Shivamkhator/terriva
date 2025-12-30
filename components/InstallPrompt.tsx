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
    // Check if user previously dismissed
    const hidePrompt = localStorage.getItem("hideInstallPrompt")
    if (hidePrompt === "true") return

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
    const hidePrompt = localStorage.getItem("hideInstallPrompt")
    if (isIOS && !isInstalled && hidePrompt !== "true") {
      setShowPrompt(true)
    }
  }, [isIOS, isInstalled])

  const installApp = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA installed')
      }
    } catch (error) {
      console.error('Installation failed:', error)
    } finally {
      deferredPrompt = null
      setShowPrompt(false)
    }
  }

  const dismissPrompt = () => {
    localStorage.setItem("hideInstallPrompt", "true")
    setShowPrompt(false)
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div 
      className="fixed bottom-5 left-1/2 z-999 w-[90%] max-w-sm -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-center text-background shadow-lg animate-in slide-in-from-bottom-3 duration-300"
      role="dialog"
      aria-labelledby="install-title"
    >
      <button
        onClick={dismissPrompt}
        className="absolute right-2 top-2 rounded p-1 text-sm text-white/60 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close install prompt"
      >
        ✕
      </button>
      
      {isIOS ? (
        <div className="flex flex-col items-center">
          <p id="install-title" className="font-semibold">Install Terriva</p>
          <p className="mt-1 text-sm leading-relaxed opacity-90">
            Tap <span className="inline-block  font-bold rotate-90">⋮</span> and then
            <span className="font-semibold">Add to Home Screen</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p id="install-title" className="text-lg font-semibold">Terriva</p>
          <Button
            onClick={installApp}
            className="bg-white text-primary hover:bg-accent/90"
          >
            Install
          </Button>
        </div>
      )}
    </div>
  )
}