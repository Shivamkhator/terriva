"use client";

import { MouseEvent, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import Image from "next/image";

export default function CheckEmailPage() {

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

    const [email, setEmail] = useState<string>("");
    const callbackUrl = "/";
    const { data: session } = useSession();

    useEffect(() => {
        const stored = sessionStorage.getItem("tmail");
        if (stored) setEmail(stored);
    }, []);

    const [cooldown, setCooldown] = useState<number>(0);
    useEffect(() => {
        let t: NodeJS.Timeout | null = null;
        if (cooldown > 0) {
            t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        }
        return () => {
            if (t) clearTimeout(t);
        };
    }, [cooldown]);

    useEffect(() => {
        if (session?.user?.email) {
            sessionStorage.removeItem("tmail");
        }
    }, [session]);

    const handleResend = async () => {
        if (!email || cooldown > 0) return;
        setCooldown(30);
        await signIn("email", { email, callbackUrl, redirect: false });
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
                                <TypewriterEffectSmooth words={words} className="flex justify-center" />
                            </h1>
                        </header>

                        <div className="space-y-3 mt-6 justify-center text-center">
                            <h1 className="text-3xl font-semibold text-gray-800 mb-3">Check your inbox</h1>

                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                A sign in link has been sent to your email address. Click the link in the message to complete login.
                            </p>

                            <button
                                onClick={handleResend}
                                disabled={cooldown > 0 || !email}
                                className="relative w-full rounded-xl py-3 font-medium text-white transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-70 bg-action hover:bg-teal-700"
                                style={{
                                    border: "0.5px solid #2a2a2a",
                                    boxShadow: "2px 2px 1px rgb(0, 0, 0)",
                                }}
                                onMouseEnter={handlePrimaryHoverEnter}
                                onMouseLeave={handlePrimaryHoverLeave}
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Login Link"}

                            </button>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={() => window.location.assign("/login")}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-primary bg-white py-2.5 px-6 font-medium text-gray-primary transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
                                style={{
                                    border: "0.5px solid #2aaa2a",
                                    boxShadow: "4px 4px 2px rgb(0, 0, 0)",
                                }}
                                onMouseEnter={handleSocialHoverEnter}
                                onMouseLeave={handleSocialHoverLeave}
                            >
                                Return to Login
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <p className="mt-2 text-xs text-slate-500">
                                The provided link will expire in 10 minutes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}