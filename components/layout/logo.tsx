import Link from "next/link";

/** Text-only wordmark with a small gold "tdc" monogram. Not TDC's real logo. */
export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="The Date Crew, home">
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-full border border-gold/60 bg-cream-light font-serif text-[0.7rem] text-gold italic"
      >
        tdc
      </span>
      <span className="font-serif text-lg whitespace-nowrap text-forest">The Date Crew</span>
    </Link>
  );
}
