"use client";

import { useState } from "react";

type Props = {
  articleId: string;
  lastVerifiedAt: string | null;
};

export default function VerifyButton({ articleId, lastVerifiedAt: initial }: Props) {
  const [verifiedAt, setVerifiedAt] = useState<string | null>(initial);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/verify`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setVerifiedAt(data.lastVerifiedAt);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2 text-xs">
      <button
        onClick={handleVerify}
        disabled={loading}
        className="ui-button disabled:opacity-50"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {loading ? "Verifying…" : "Mark as verified"}
      </button>
      {verifiedAt && (
        <span className="text-success">
          Last verified: {new Date(verifiedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
