import { Suspense } from "react";
import { PortfolioView } from "./portfolio-view";

// The portfolio is read from the browser, so the page fills in once it loads.
export default function PortfolioPage() {
  return (
    <Suspense fallback={null}>
      <PortfolioView />
    </Suspense>
  );
}
