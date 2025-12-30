"use client"

import { useEffect, useState } from "react"

let deferredPrompt: any = null

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // iOS detection (safe on client)
    const ua = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(ua)
    setIsIOS(ios)

    // Detect standalone mode (already installed)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore
      window.navigator.standalone === true

    setIsInstalled(standalone)

    // Chrome / Android install event
    const handler = (e: any) => {
      e.preventDefault()
      deferredPrompt = e
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

  const installApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    await deferredPrompt.userChoice

    deferredPrompt = null
    setShowPrompt(false)
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div style={styles.container}>
      {isIOS ? (
        <>
          <p><strong>Install Terriva</strong></p>
          <p style={{ fontSize: 14 }}>
            Tap <strong>Share</strong> 📤 then <br />
            <strong>Add to Home Screen</strong>
          </p>
        </>
      ) : (
        <>
          <p>Install Terriva for a better experience 🚀</p>
          <button onClick={installApp} style={styles.button}>
            Install App
          </button>
        </>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: "fixed" as const,
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#052b33",
    color: "#fff",
    padding: "14px 16px",
    borderRadius: "12px",
    zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
    textAlign: "center" as const,
    maxWidth: 280,
  },
  button: {
    marginTop: 10,
    background: "#00adb5",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },
}
