"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePortfolio } from "@/lib/store";

// Placeholder until checkpoint 3 builds the full portfolio page.
export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const portfolio = usePortfolio(id);

  return (
    <div className="space-y-3">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-forest">
        <ArrowLeft className="size-4" /> All portfolios
      </Link>
      <h1 className="text-4xl text-ink">{portfolio?.clientName ?? "Portfolio not found"}</h1>
      <p className="text-ink-muted">The full portfolio page arrives in checkpoint 3.</p>
    </div>
  );
}
