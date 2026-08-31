import { SkeletonText, SkeletonTable } from "@/components/LoadingSkeleton";
import { Page } from "@/components/ui";

export default function Loading() {
  return (
    <Page aria-busy="true" aria-label="Loading page">
      <div className="ui-page-header">
        <div className="ui-page-header-copy w-full max-w-md">
          <SkeletonText lines={2} />
        </div>
      </div>
      <SkeletonTable rows={6} />
    </Page>
  );
}
