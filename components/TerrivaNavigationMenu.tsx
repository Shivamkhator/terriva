"use client"

import * as React from "react"
import { FormEvent, MouseEvent } from "react";
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

export default function TerrivaNavbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  const isActive = (path: string) => pathname === path
  const isLoggedIn = status === "authenticated" && !!session

  const icons = {
    home: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    dashboard: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
    ),
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
    )
  };

  const handlePrimaryHoverEnter = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "8px 8px 2px rgb(0, 0, 0)";
  };

  const handlePrimaryHoverLeave = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "2px 2px 1px rgb(0, 0, 0)";
  };


  const navItems = [
    { id: 'home', path: '/', label: 'Home', icon: icons.home },
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { id: 'logout', path: '', label: 'Logout', icon: icons.logoutIcon, onClick: () => signOut() },
  ];

  const guestItems = [
    { id: 'home', path: '/', label: 'Home', icon: icons.home },
    { id: 'login', path: '/login', label: 'Login', icon: icons.user, onClick: () => signIn() },
  ]
  const visibleItems = isLoggedIn ? navItems : guestItems

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
          </div>

          <div className="flex items-center pr-16">
            {!isLoggedIn ? (
              <button onClick={() => signIn()} className="bg-white px-4 py-2 rounded-md text-[#2F4F4F] font-medium text-sm transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5" style={{
                border: "0.5px solid #2a2a2a",
                boxShadow: "2px 2px 1px rgb(0, 0, 0)",
              }} onMouseEnter={handlePrimaryHoverEnter} onMouseLeave={handlePrimaryHoverLeave}>
                Login
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  className="inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium cursor-pointer"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#2F4F4F] text-sm">
                    {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="hidden lg:inline-block text-white/80 font-semibold">{session.user?.name}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-38 rounded-md bg-white border border-gray-200 shadow-lg py-1 z-99">
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>Settings</Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      <nav className="md:hidden gap-4 fixed bottom-6 left-1/2 -translate-x-1/2 h-16 px-2 bg-primary backdrop-blur-xl rounded-full border border-black/30 shadow-xl z-99 flex justify-around items-center">
        {visibleItems.map((item) => {
          const active = isActive(item.path)

          // Wrapper Class: Shared styling for both Links and Buttons
          const itemClass = "relative flex flex-col items-center justify-center w-12 h-12"

          // Inner Content: The Icon + Active Background
          const content = (
            <>
              {active && (
                <span className="absolute inset-0 bg-white/20 rounded-full scale-100 transition-transform duration-300 -z-10" />
              )}
              <div className={`transition-all duration-300 ${active ? 'text-white' : 'text-white/50'}`}>
                {React.cloneElement(item.icon, {
                  width: active ? 24 : 22,
                  height: active ? 24 : 22,
                  strokeWidth: active ? 2 : 1.5
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