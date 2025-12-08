import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-background text-foreground">
      <main className="flex flex-col items-center justify-center gap-4 py-32 px-6 w-full max-w-3xl">

        {/* Title */}
        <h1 className="text-5xl font-bold text-foreground">Terriva</h1>
        <p className="text-xl text-gray-primary">A Period Tracker Built for You</p>

        {/* Buttons */}
        <div className="flex gap-4 mt-2">

          {/* Action Button */}
          <button className="bg-action text-white px-6 py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition">
            Start Tracking
          </button>

          {/* Accent Button */}
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
