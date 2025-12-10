"use client";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  const handleLogout = () => {
    signOut({ redirect: false });
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-background text-foreground">
      <main className="flex flex-col items-center justify-center gap-4 py-32 px-6 w-full max-w-3xl">

        {/* Title */}
        <h1 className="text-5xl font-bold text-foreground">
          Terriva
        </h1>

        <div className="text-xl text-gray-primary">
          {status === "authenticated" ? (
            <div className="flex justify-center items-center gap-2">
              <p>Welcome back, {session.user?.name ?? "friend"}</p>
              <Avatar className="w-8 h-8">
                <AvatarImage src={session.user?.image ?? ""} />
                <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            "A Period Tracker Built for You"
          )}
        </div>


        {/* Buttons */}
        <div className="flex gap-4 mt-2">
          {!session ? (
            <Link href="/auth/login">
              <button className="bg-action text-white px-6 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition">
                Log in
              </button>
            </Link>
          ) : (
            <button onClick={handleLogout} className="bg-action text-white px-6 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition">
              Logout
            </button>
          )}

          <button className="bg-accent text-action px-6 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition">
            Learn More
          </button>
        </div>

        {/* Hover Card */}
        <div className="absolute bottom-10">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link href="https://skybee.vercel.app">Build by <span className="underline">SkyBee</span>
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-center items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://skybee.vercel.app/SkyBee.svg" />
                  <AvatarFallback>SkyBee</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-yellow-400">@SkyBee</h4>
                  <p className="text-sm">
                    Building useful tools for everyone!
                  </p>
                  <div className="text-muted-foreground text-xs">
                    <Link href="mailto:skybee.hq@gmail.com" className="underline">Contact Us</Link>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </main>
    </div>
  );
}
