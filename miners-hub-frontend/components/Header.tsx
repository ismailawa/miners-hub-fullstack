"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { ROUTES } from "@/lib/constants/routes";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Menu, Search, Briefcase, Newspaper, MessageSquare, LineChart, FileText, BookOpen, ChevronDown, ChevronUp, Truck, Warehouse, Package, User, LogOut } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show header on auth pages
  if (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "bg-secondary/80 backdrop-blur-sm border-border/40"
          : "bg-secondary border-border"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold text-text">Miners Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Services Dropdown */}
            <DropdownMenu open={servicesOpen} onOpenChange={setServicesOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-1 !text-text hover:!text-accent hover:!bg-transparent ${
                    servicesOpen ? "!text-accent" : ""
                  }`}
                >
                  Services
                  {servicesOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-80 !bg-primary-light !border-border rounded-lg shadow-lg p-2"
              >
                <DropdownMenuItem asChild className="!focus:bg-primary-light/50 !focus:text-text rounded-md p-0">
                  <Link href="/services" className="flex items-start gap-3 py-3 px-4 w-full rounded-md hover:!bg-primary-light/30 transition-colors">
                    <Briefcase className="h-5 w-5 !text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-text">Our Services</span>
                      <span className="text-xs text-text/60 mt-0.5">An overview of our comprehensive solutions.</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="!focus:bg-primary-light/50 !focus:text-text rounded-md p-0">
                  <Link href="/logistics" className="flex items-start gap-3 py-3 px-4 w-full rounded-md hover:!bg-primary-light/30 transition-colors">
                    <Truck className="h-5 w-5 !text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-text">Logistics & Transport</span>
                      <span className="text-xs text-text/60 mt-0.5">From mine to market, seamlessly and securely.</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="!focus:bg-primary-light/50 !focus:text-text rounded-md p-0">
                  <Link href="/warehousing" className="flex items-start gap-3 py-3 px-4 w-full rounded-md hover:!bg-primary-light/30 transition-colors">
                    <Warehouse className="h-5 w-5 !text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-text">Warehousing & Storage</span>
                      <span className="text-xs text-text/60 mt-0.5">Secure facilities for your valuable assets.</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resources Dropdown */}
            <DropdownMenu open={resourcesOpen} onOpenChange={setResourcesOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`flex items-center gap-1 !text-text hover:!text-accent hover:!bg-transparent ${
                    resourcesOpen ? "!text-accent" : ""
                  }`}
                >
                  Resources
                  {resourcesOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-80 !bg-primary-light !border-border rounded-lg shadow-lg p-2"
              >
                <DropdownMenuItem asChild className="!focus:bg-primary-light/50 !focus:text-text rounded-md p-0">
                  <Link href={ROUTES.NEWS} className="flex items-start gap-3 py-3 px-4 w-full rounded-md hover:!bg-primary-light/30 transition-colors">
                    <Newspaper className="h-5 w-5 !text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-text">News</span>
                      <span className="text-xs text-text/60 mt-0.5">Latest industry updates and market analysis.</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="!focus:bg-primary-light/50 !focus:text-text rounded-md p-0">
                  <Link href="/forum" className="flex items-start gap-3 py-3 px-4 w-full rounded-md hover:!bg-primary-light/30 transition-colors">
                    <MessageSquare className="h-5 w-5 !text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-text">Miner Forum</span>
                      <span className="text-xs text-text/60 mt-0.5">Connect with peers and discuss industry topics.</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="!focus:bg-primary-light/50 !focus:text-text rounded-md p-0">
                  <Link href="/data-analytics" className="flex items-start gap-3 py-3 px-4 w-full rounded-md hover:!bg-primary-light/30 transition-colors">
                    <LineChart className="h-5 w-5 !text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-text">Data & Analytics</span>
                      <span className="text-xs text-text/60 mt-0.5">Visualize market trends and production data.</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="!focus:bg-primary-light/50 !focus:text-text rounded-md p-0">
                  <Link href="/registration-guide" className="flex items-start gap-3 py-3 px-4 w-full rounded-md hover:!bg-primary-light/30 transition-colors">
                    <FileText className="h-5 w-5 !text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-text">Registration Guide</span>
                      <span className="text-xs text-text/60 mt-0.5">Step-by-step guide for legal compliance.</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="!focus:bg-primary-light/50 !focus:text-text rounded-md p-0">
                  <Link href="/knowledge-base" className="flex items-start gap-3 py-3 px-4 w-full rounded-md hover:!bg-primary-light/30 transition-colors">
                    <BookOpen className="h-5 w-5 !text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-text">Knowledge Base</span>
                      <span className="text-xs text-text/60 mt-0.5">Find articles and answers to common questions.</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Marketplace Link */}
            <Link href={ROUTES.MARKETPLACE}>
              <Button variant="ghost" className="!text-text hover:!text-accent hover:!bg-transparent">
                Marketplace
              </Button>
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text/50" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 bg-primary border-border text-text placeholder:text-text/50"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Center */}
            <NotificationCenter />

            {/* Login/Register Buttons or User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="!text-text hover:!text-accent hover:!bg-transparent">
                    <User className="h-5 w-5 mr-2" />
                    {user?.email}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="!bg-primary-light !border-border">
                  <DropdownMenuItem className="!text-text hover:!text-accent hover:!bg-transparent">
                    <Link href={ROUTES.PROFILE} className="flex items-center w-full">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="!text-text hover:!text-accent hover:!bg-transparent">
                    <Link href={ROUTES.DASHBOARD} className="flex items-center w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="!bg-border" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="!text-text hover:!text-accent hover:!bg-transparent cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" className="!text-text hover:!text-accent hover:!bg-transparent">
                    Login
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button className="bg-accent text-gray-900 hover:bg-accent/90 font-semibold dark:text-gray-900">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu" className="min-h-[44px] min-w-[44px]">
                <Menu className="h-6 w-6 text-text" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-8">
                <Link
                  href={ROUTES.MARKETPLACE}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-text hover:text-accent min-h-[44px] flex items-center"
                >
                  Marketplace
                </Link>
                <div className="space-y-2">
                  <p className="font-semibold text-text">Services</p>
                  <Link
                    href="/services"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-text/80 hover:text-accent pl-4 min-h-[44px] flex items-center"
                  >
                    Services
                  </Link>
                  <Link
                    href="/logistics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-text/80 hover:text-accent pl-4 min-h-[44px] flex items-center"
                  >
                    Logistics
                  </Link>
                  <Link
                    href="/warehousing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-text/80 hover:text-accent pl-4 min-h-[44px] flex items-center"
                  >
                    Warehousing
                  </Link>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-text">Resources</p>
                  <Link
                    href={ROUTES.NEWS}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-text/80 hover:text-accent pl-4 min-h-[44px] flex items-center"
                  >
                    News
                  </Link>
                  <Link
                    href="/knowledge-base"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-text/80 hover:text-accent pl-4 min-h-[44px] flex items-center"
                  >
                    Knowledge Base
                  </Link>
                  <Link
                    href="/forum"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-text/80 hover:text-accent pl-4 min-h-[44px] flex items-center"
                  >
                    Miner Forum
                  </Link>
                  <Link
                    href="/registration-guide"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-text/80 hover:text-accent pl-4 min-h-[44px] flex items-center"
                  >
                    Registration Guide
                  </Link>
                  <Link
                    href="/data-analytics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-text/80 hover:text-accent pl-4 min-h-[44px] flex items-center"
                  >
                    Data & Analytics
                  </Link>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <ThemeToggle />
                  <span className="text-sm text-text/80">Theme</span>
                </div>
                {isAuthenticated && (
                  <div className="flex items-center justify-between pt-2">
                    <NotificationCenter />
                    <span className="text-sm text-text/80">Notifications</span>
                  </div>
                )}
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 text-sm text-text/80">
                        <p className="font-semibold">{user?.email}</p>
                        <p className="text-xs capitalize">{user?.role}</p>
                      </div>
                      <Link href={ROUTES.DASHBOARD} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href={ROUTES.LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link href={ROUTES.REGISTER} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-accent text-gray-900 hover:bg-accent/90 font-semibold dark:text-gray-900">
                          Register
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

