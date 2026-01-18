"use client"

import * as React from "react"
import { FormEvent, JSX, MouseEvent, useMemo } from "react";
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { Brain } from "lucide-react"
import { clearLockState } from "@/lib/passkeyLock";
import { usePWAInstall } from "@/hooks/usePWAInstall"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

interface NavItem {
  id: string;
  path: string;
  label: string;
  icon: JSX.Element;
  onClick?: () => void | Promise<void>;
}

export default function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [logoutArmed, setLogoutArmed] = React.useState(false)
  const { canInstall, install } = usePWAInstall()
  const isActive = (path?: string) => pathname === path
  const isLoggedIn = status === "authenticated" && !!session

  const icons = {
    home: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>),
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
    logoutIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    install: (<svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="M8 11l4 4 4-4" />
      <path d="M5 21h14" />
    </svg>

    )
  };

  const greeting = useMemo(
          () => (Math.random() > 0.5 ? "Namaste" : "Konnichiwa"),
          []
      );

  const handleMobileLogout = React.useCallback(() => {
    if (!logoutArmed) {
      setLogoutArmed(true)

      setTimeout(() => {
        setLogoutArmed(false)
      }, 3000)

      return
    }

    clearLockState()
    signOut()
  }, [logoutArmed])


  const navItems: NavItem[] = [
    { id: 'home', path: '/', label: 'Home', icon: icons.home },
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { id: 'clarity', path: '/clarity', label: 'Clarity', icon: <Brain /> },
    { id: 'logout', path: "", label: 'Logout', icon: icons.logoutIcon, onClick: () => { clearLockState(); signOut(); } },
  ];

  const guestItems: NavItem[] = [
    { id: 'home', path: '/', label: 'Home', icon: icons.home },
    { id: 'login', path: '/login', label: 'Login', icon: icons.user, onClick: () => signIn() },
  ]
  const visibleItems = isLoggedIn ? navItems : guestItems
  const visbleMobileItems: NavItem[] = React.useMemo(() => {
    const base = visibleItems.map(item => {
      if (item.id === 'logout') {
        return {
          ...item,
          onClick: handleMobileLogout
        }
      }
      return item
    })

    if (!canInstall) return base
    return [
      ...base,
      { id: 'install', path: '', label: 'Install', icon: icons.install, onClick: install }
    ]
  }, [canInstall, visibleItems, install, icons.install])
  return (
    <>
      <div className="hidden md:block w-full fixed bg-[#2F4F4F] top-0 z-99 backdrop-blur-md border-b border-white/10 shadow-xl text-sm">
        <nav className="h-12 flex items-center mx-8 w-full justify-between">

          <div className="flex items-center">
            <Link href="/" className="mr-8">
              <Image src="/Terriva.png" alt="Home" width={36} height={36} />
            </Link>

            <NavigationMenu>
              <NavigationMenuList className="gap-8">
                {visibleItems.map((item) => (
                  <NavigationMenuItem key={item.id}>
                    {isLoggedIn && item.id === 'logout' ? (
                      <button
                        onClick={item.onClick}
                        className="flex items-center justify-center gap-2 transition-all hover:text-white text-white/70 border-transparent"
                      >
                        {item.label}
                        {React.cloneElement(item.icon, { className: "w-3 h-3" })}
                      </button>
                    ) : (

                      <NavigationMenuLink asChild>
                        <Link
                          href={item.path}
                          className={`flex items-center justify-center gap-2 transition-all hover:text-white ${isActive(item.path)
                            ? "text-white border-b py-1 border-white font-medium"
                            : "text-white/70 border-transparent"
                            }`}
                        >
                          {item.label}
                          {React.cloneElement(item.icon, { className: "w-3 h-3" })}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            {canInstall && (
              <button
                onClick={install}
                className="ml-6 flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white transition-all hover:bg-white/10"
                style={{ border: "0.5px solid #2a2a2a" }}
              >
                <span>Install</span>
                {React.cloneElement(icons.install, {
                  width: 16,
                  height: 16,
                  strokeWidth: 2,
                })}
              </button>
            )}

          </div>

          <div className="flex items-center pr-16">
            {!isLoggedIn ? (
              <button onClick={() => signIn()} className="bg-white px-4 py-2 rounded-md text-[#2F4F4F] font-medium text-sm transition-all" style={{
                border: "0.5px solid #2a2a2a",
              }}>
                Login
              </button>
            ) : (
              <div className="relative inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium">
                <span className="hidden lg:inline-block text-white font-semibold">{greeting}, {session.user?.name || session.user?.email || "User"}</span>
              </div>
            )}
          </div>
        </nav>
      </div>

      <nav className="md:hidden gap-4 fixed bottom-6 left-1/2 -translate-x-1/2 h-16 px-2 bg-primary backdrop-blur-xl rounded-full border border-black/30 shadow-xl z-99 flex justify-around items-center">
        {
          visbleMobileItems.map((item) => {
            const active = isActive(item.path)
            const isLogout = item.id === "logout"
            const isArmed = isLogout && logoutArmed

            // Wrapper Class: Shared styling for both Links and Buttons
            const itemClass = "relative flex flex-col items-center justify-center w-12 h-12"

            // Inner Content: The Icon + Active Background
            const content = (
              <>
                {active && !isArmed && (
                  <span className="absolute inset-0 bg-white/20 rounded-full scale-100 transition-transform duration-300 -z-10" />
                )}

                {/* Armed logout pulse */}
                {isArmed && (
                  <span className="absolute inset-0 bg-red-400/60 rounded-full -z-10 animate-pulse" />
                )}

                <div
                  className={`transition-all duration-300 ${isArmed
                    ? "text-red-400 scale-110"
                    : active
                      ? "text-white"
                      : "text-white/50"
                    }`}
                ></div>

                <div className={`transition-all duration-300 ${active ? 'text-white' : 'text-white/50'}`}>
                  {React.cloneElement(item.icon, {
                    width: active || isArmed ? 24 : 22,
                    height: active || isArmed ? 24 : 22,
                    strokeWidth: active || isArmed ? 2 : 1.5
                  })}
                </div>
              </>
            )

            return (
              item.onClick ? (

                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={itemClass}
                >
                  {content}
                </button>
              ) : (
                <Link key={item.id} href={item.path} className={itemClass}>
                  {content}
                </Link>
              )
            )
          })}
      </nav>
    </>
  )
}