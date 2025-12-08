"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await signIn("email", {
      email,
      callbackUrl: "/dashboard",
    });
    setStatus("sent");
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 16 }}>
      <h1>Login</h1>

      {/* Magic link form */}
      <form onSubmit={handleEmailLogin} style={{ marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Login with email (magic link)
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          style={{ width: "100%", padding: 8 }}
        >
          {status === "sending" ? "Sending..." : "Send magic link"}
        </button>
        {status === "sent" && (
          <p style={{ marginTop: 8 }}>
            Check your email for the login link.
          </p>
        )}
      </form>

      <hr />

      {/* Google login */}
      <button
        onClick={() =>
          signIn("google", {
            callbackUrl: "/dashboard",
          })
        }
        style={{ marginTop: 24, width: "100%", padding: 8 }}
      >
        Continue with Google
      </button>
    </div>
  );
}
