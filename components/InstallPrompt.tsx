"use client"

import { useEffect } from "react"

export default function InstallPrompt() {
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      console.log("App is installable 🚀")
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  return null // nothing to render (yet)
}
