// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
    <video
        src="404.webm"
        autoPlay
        loop
        muted
        className="w-32 h-32"
      />
      <p className="mt-2 text-sm md:text-xl font-bold">
        Oops! The page you're looking for doesn't exist.
      </p>

      <Link
        href="/"
        className="mt-6 rounded-lg px-4 py-2 bg-primary text-white hover:scale-105 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
