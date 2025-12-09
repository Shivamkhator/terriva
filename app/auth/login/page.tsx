"use client";

import { FormEvent, MouseEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Icon } from "@iconify/react";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import Image from "next/image";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");

    await signIn("email", {
      email,
      callbackUrl: "/",
    });

    setStatus("sent");
  };

  const handlePrimaryHoverEnter = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "8px 8px 2px rgb(0, 0, 0)";
  };

  const handlePrimaryHoverLeave = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "2px 2px 1px rgb(0, 0, 0)";
  };

  const handleSocialHoverEnter = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "8px 8px 2px rgb(0, 0, 0)";
  };

  const handleSocialHoverLeave = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "4px 4px 2px rgb(0, 0, 0)";
  };

  const words = [
    {
      text: "Terriva",
      className: "text-cyan-700 text-5xl",
    },
  ];

  const arr = [
    "https://images.pexels.com/photos/285889/pexels-photo-285889.jpeg",
    "https://images.pexels.com/photos/733856/pexels-photo-733856.jpeg",
    "https://images.pexels.com/photos/7615876/pexels-photo-7615876.jpeg",
    "https://images.pexels.com/photos/12714815/pexels-photo-12714815.jpeg",
    "https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg",
    "https://images.pexels.com/photos/27178124/pexels-photo-27178124.jpeg",
    "https://images.pexels.com/photos/710743/pexels-photo-710743.jpeg"
  ];

  const rand = new Date().getDay();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex w-full">
        {/* Left image panel */}
        <div className="hidden h-screen overflow-hidden md:block md:w-2/5 lg:w-3/5">
          <Image
            src={arr[rand]}
            alt="Decorative sign-in image"
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right login panel */}
        <div className="w-full flex items-center justify-center overflow-hidden bg-background p-8 md:w-3/5 lg:w-2/5 sm:p-16">
          <div className="space-y-4 pb-8 bg-background w-full max-w-md">
            {/* Header */}
            <header className="text-center justify-center">
              <a href="/">
                <div
                  className="mb-6 inline-flex h-18 w-18 items-center justify-center rounded-xl z-10"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #2a2a2a",
                    boxShadow: "4px 4px 1px rgb(0, 0, 0)",
                  }}
                >
                  <Image
                    src="/Terriva.png"
                    alt="Terriva Logo"
                    width={72}
                    height={72}
                  />
                </div>
              </a>
              <h1 className="text-2xl font-bold text-action">
                Log in to
                <TypewriterEffectSmooth words={words} className="flex justify-center" />
              </h1>
            </header>

            {/* Magic link form (NextAuth email) */}
            <form onSubmit={handleEmailLogin} className="space-y-3 mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-purple-400 focus:bg-white focus:outline-none"
                style={{
                  border: "1px solid #2aaa2a",
                  boxShadow: "2px 2px 1px rgb(0, 0, 0)",
                }}
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="relative w-full rounded-xl py-3 font-medium text-white transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-70"
                style={{
                  border: "0.5px solid #2a2a2a",
                  background: "#2F4F4F",
                  boxShadow: "2px 2px 1px rgb(0, 0, 0)",
                }}
                onMouseEnter={handlePrimaryHoverEnter}
                onMouseLeave={handlePrimaryHoverLeave}
              >
                {status === "sending" ? "Sending..." : "Continue with Email"}
              </button>

              {status === "sent" && (
                <p className="mt-2 text-center text-sm text-gray-600">
                  Check your email for the login link.
                </p>
              )}
            </form>

            {/* Divider */}
              <div className="mt-6 mb-4 flex items-center gap-2">
              <span className="h-px flex-1 bg-gray-primary" />
              <span className="text-xs uppercase text-gray-primary">
                Or continue with
              </span>
              <span className="h-px flex-1 bg-gray-primary" />
            </div>

            {/* Social logins (NextAuth) */}
            <div className="space-y-4">
              {/* Google */}
              <button
                type="button"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/",
                  })
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 px-6 font-medium text-gray-700 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
                style={{
                  border: "0.5px solid #2aaa2a",
                  boxShadow: "4px 4px 2px rgb(0, 0, 0)",
                }}
                onMouseEnter={handleSocialHoverEnter}
                onMouseLeave={handleSocialHoverLeave}
              >
                <Icon icon="flat-color-icons:google" className="h-5 w-5" />
                Continue with Google
              </button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-4">
              First time here? Just log in; we’ll take care of everything 🌿
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
