import { Suspense } from "react";
import SplitViewClient from "./SplitViewClient";

export const dynamic = "force-dynamic";

export default function SplitPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted p-4">Loading split view…</div>}>
      <SplitViewClient />
    </Suspense>
  );
}
