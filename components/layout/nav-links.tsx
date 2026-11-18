"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "/", label: "Portfolios" },
  { href: "/portfolios/new", label: "New portfolio" },
];

const linkClass = "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors";

/** Nav links with the current page highlighted (needs the URL, so it fills in after the shell). */
export function NavLinks() {
  const pathname = usePathname();
  return NAV_LINKS.map((link) => {
    const active =
      link.href === "/"
        ? pathname === "/" || (pathname.startsWith("/portfolios/") && pathname !== "/portfolios/new")
        : pathname === link.href;
    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(linkClass, active ? "bg-cream text-forest" : "text-ink-muted hover:text-forest")}
      >
        {link.label}
      </Link>
    );
  });
}

/** Same links without highlighting, shown for a split second while the URL is read. */
export function NavLinksFallback() {
  return NAV_LINKS.map((link) => (
    <Link key={link.href} href={link.href} className={cn(linkClass, "text-ink-muted hover:text-forest")}>
      {link.label}
    </Link>
  ));
}
