"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { startRegistration } from "@simplewebauthn/browser"
import { setLockState } from "@/lib/passkeyLock"
export function UnlockScreen() {
  const [isVerifying, setIsVerifying] = useState(false)
  const router = useRouter()

  async function handleCreate() {
    setIsVerifying(true)
    const res = await fetch("/api/passkey/register/options", {
      method: "POST",
    })

    console.log("STATUS:", res.status)

    const options = await res.json()

    console.log("PARSED OPTIONS:", options)

    if (!options?.challenge) {
      alert("❌ Server did not return WebAuthn options")
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
        unlockedAt: Date.now()
      })
      router.refresh()
    }
    else {
      const err = await verifyRes.text()
      alert("❌ Passkey creation failed: " + err)
      setIsVerifying(false)
    }
  }



  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">
          Unlock with Passkey
        </h2>
        <p className="text-sm text-gray-500">
          Verify with your device to continue
        </p>

        <button
          onClick={handleCreate}
          disabled={isVerifying}
          className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
        >
          {isVerifying ? "Verifying..." : "Create Passkey"}
        </button>
      </div>

    </div>

  )
}

