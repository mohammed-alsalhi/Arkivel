"use client";

import { useEffect } from "react";
import { Button, EmptyState, LinkButton, Page, PageHeader } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Page>
      <PageHeader title="Something went wrong" />
      <EmptyState
        title="This page hit an unexpected error."
        description={
          error.digest ? (
            <>
              The error has been logged
              {" "}
              (reference <code className="ui-inline-code">{error.digest}</code>).
            </>
          ) : (
            "The error has been logged."
          )
        }
        actions={
          <>
            <Button variant="primary" onClick={reset}>
              Try again
            </Button>
            <LinkButton href="/">Go to the main page</LinkButton>
          </>
        }
      />
    </Page>
  );
}
