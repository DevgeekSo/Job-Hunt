"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { UserNav } from "@/components/shared/UserNav"
import { Briefcase, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

export function Navbar() {
    const { user, loading } = useAuth()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Jobs", href: "/jobs" },
        { name: "Internship", href: "/jobs?type=INTERNSHIP" },
        { name: "Companies", href: "/companies" },
        { name: "About Us", href: "/about" },
    ]

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4 md:px-6">
                {/* Mobile Menu Button */}
                <div className="md:hidden mr-4">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" className="px-2">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                            <SheetHeader className="mb-6">
                                <SheetTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    JobHub Menu
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col space-y-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`text-base font-medium px-3 py-2 rounded-md transition-colors hover:bg-gray-100 ${pathname === item.href
                                                ? "text-primary bg-gray-50"
                                                : "text-muted-foreground"
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {!user && (
                                    <div className="pt-4 border-t space-y-2">
                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full">Login</Button>
                                        </Link>
                                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full">Sign Up</Button>
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                <Link href="/" className="font-bold text-xl md:text-2xl flex items-center gap-2 mr-4 md:mr-6">
                    <span className="text-primary"><Briefcase className="h-5 w-5 md:h-6 md:w-6" /></span>
                    <span className="text-foreground">JobHub</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6 text-sm font-medium ml-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`transition-colors hover:text-primary ${pathname === item.href ? "text-foreground" : "text-muted-foreground"}`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* User Menu / Auth Buttons */}
                <div className="ml-auto md:ml-6 flex items-center space-x-2 md:space-x-4">
                    {loading ? (
                        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                    ) : user ? (
                        <UserNav user={user} />
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" className="font-semibold">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="font-semibold px-6">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
