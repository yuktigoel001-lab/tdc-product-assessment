"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { ViewingAsSwitcher } from "./viewing-as";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Portfolios" },
  { href: "/portfolios/new", label: "New portfolio" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/" || (pathname.startsWith("/portfolios/") && pathname !== "/portfolios/new")
                : pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-cream text-forest" : "text-ink-muted hover:text-forest",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto">
          <ViewingAsSwitcher />
        </div>
      </div>
    </header>
  );
}
