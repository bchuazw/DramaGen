import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Zap, LogIn, LogOut, User, Menu, X, Sun, Moon } from "lucide-react";
import { useUser, useClerk, Show } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

export function Navbar() {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/generate", label: "Generate" },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
  ];

  const authNavItems = [
    { href: "/my-rants", label: "My Rants" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/20 p-1.5 sm:p-2 rounded-lg group-hover:bg-primary/30 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(255,51,51,0.3)]">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <span className="font-display text-xl sm:text-2xl tracking-wider text-foreground">DRAMA<span className="text-primary">GEN</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-all duration-300 relative ${
                location === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {location === item.href && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-[1.1rem] left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}

          <Show when="signed-in">
            {authNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-all duration-300 relative ${
                  location === item.href
                    ? "text-secondary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {location === item.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-[1.1rem] left-0 right-0 h-0.5 bg-secondary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </Show>

          <div className="ml-2 pl-2 border-l border-border/40 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Show when="signed-in">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/10 border border-secondary/20">
                  <User className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-xs font-medium text-secondary max-w-[80px] truncate">
                    {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="text-muted-foreground hover:text-foreground h-8 px-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Show>
            <Show when="signed-out">
              <Link href="/sign-in">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 gap-1.5 text-xs font-bold">
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Button>
              </Link>
            </Show>
          </div>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0 text-muted-foreground"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-8 w-8 p-0 text-muted-foreground"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    location === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <Show when="signed-in">
                {authNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      location === item.href
                        ? "text-secondary bg-secondary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/10 border border-secondary/20">
                    <User className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-xs font-medium text-secondary">
                      {user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { signOut({ redirectUrl: "/" }); setMobileOpen(false); }}
                    className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </Button>
                </div>
              </Show>
              <Show when="signed-out">
                <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9 gap-1.5 text-sm font-bold mt-2">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Button>
                </Link>
              </Show>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
