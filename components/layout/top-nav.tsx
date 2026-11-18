import { Suspense } from "react";
import { Logo } from "./logo";
import { AccountChip } from "./account-chip";
import { NavLinks, NavLinksFallback } from "./nav-links";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
        </nav>
        <div className="ml-auto">
          <AccountChip />
        </div>
      </div>
    </header>
  );
}
