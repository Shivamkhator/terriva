"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { startRegistration, startAuthentication } from "@simplewebauthn/browser"
import { setLockState } from "@/lib/passkeyLock"

export function UnlockScreen() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasPasskeys, setHasPasskeys] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    checkPasskeys()
  }, [])

  async function checkPasskeys() {
    try {
      const res = await fetch("/api/passkey/check")
      const data = await res.json()
      setHasPasskeys(data.hasPasskeys)
    } catch (error) {
      console.error("Failed to check passkeys:", error)
      setHasPasskeys(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate() {
    setIsVerifying(true)
    try {
      const res = await fetch("/api/passkey/register/options", {
        method: "POST",
      })

      const options = await res.json()

      if (!options?.challenge) {
        setIsVerifying(false)
        return
      }

      const attestation = await startRegistration({ optionsJSON: options })

      const verifyRes = await fetch("/api/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attestation),
      })

      if (verifyRes.ok) {
        setLockState({
          isUnlocked: true,
          unlockedAt: Date.now(),
          userId: session?.user?.id
        })
        window.location.href = window.location.pathname
      } else {
        const err = await verifyRes.text()
        setIsVerifying(false)
      }
    } catch (error) {
      console.error("Passkey creation error:", error)
      setIsVerifying(false)
    }
  }

  async function handleVerify() {
    setIsVerifying(true)
    try {
      const res = await fetch("/api/passkey/auth/options", {
        method: "POST",
      })

      const options = await res.json()

      if (!options?.challenge) {
        setIsVerifying(false)
        return
      }

      const assertion = await startAuthentication({ optionsJSON: options })

      const verifyRes = await fetch("/api/passkey/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertion),
      })

      if (verifyRes.ok) {
        setLockState({
          isUnlocked: true,
          unlockedAt: Date.now(),
          userId: session?.user?.id
        })
        window.location.href = window.location.pathname
      } else {
        const err = await verifyRes.text()
        setIsVerifying(false)
      }
    } catch (error) {
      console.error("Passkey verification error:", error)
      setIsVerifying(false)

    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <video src="/Loader.webm" className="mx-auto w-16 h-16" autoPlay loop muted />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">
          {hasPasskeys ? "Unlock with Passkey" : "Create Passkey"}
        </h2>
        <p className="text-sm text-gray-500">
          {hasPasskeys
            ? "Verify with your device to continue"
            : "Create a passkey to secure your account"}
        </p>
        <div className="flex flex-col">
          <button
            onClick={hasPasskeys ? handleVerify : handleCreate}
            disabled={isVerifying}
            className="px-4 py-2 mt-6 rounded-lg bg-primary text-white text-lg hover:transform hover:scale-105 disabled:opacity-50"
          >
            {isVerifying
              ? "Verifying..."
              : hasPasskeys
                ? "Verify Passkey"
                : "Create Passkey"}
          </button>

          {hasPasskeys && !isVerifying && (
            <button
              onClick={handleCreate}
              className="px-4 py-2 mt-2 rounded-lg bg-accent text-white text-lg hover:transform hover:scale-105"
            >
              Add New Passkey
            </button>
          )}
        </div>
      </div>
    </div>
  )
}