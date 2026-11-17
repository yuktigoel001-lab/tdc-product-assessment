"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useViewingAs } from "@/components/layout/viewing-as";
import { matchmakerName } from "@/lib/matchmakers";

export default function DashboardPage() {
  const { viewingAs } = useViewingAs();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-subtle">{matchmakerName(viewingAs)}</p>
          <h1 className="text-4xl text-ink">
            Client <em className="text-forest">portfolios</em>
          </h1>
        </div>
        <Link href="/portfolios/new" className={buttonVariants({ size: "lg" })}>
          <Plus /> New portfolio
        </Link>
      </div>

      <Card className="bg-cream-light">
        <CardContent className="py-10 text-center text-ink-muted">
          Client cards for {matchmakerName(viewingAs)} arrive in checkpoint 2.
        </CardContent>
      </Card>
    </div>
  );
}
