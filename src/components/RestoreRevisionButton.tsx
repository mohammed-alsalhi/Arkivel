"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  articleId: string;
  revisionId: string;
};

export default function RestoreRevisionButton({ articleId, revisionId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRestore() {
    if (!confirm("Restore this revision? The current content will be saved as a new revision before restoring.")) return;
    setLoading(true);
    const res = await fetch(`/api/articles/${articleId}/revisions/${revisionId}/restore`, {
      method: "POST",
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
      alert("Revision restored successfully.");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to restore revision.");
    }
  }

  return (
    <button
      onClick={handleRestore}
      disabled={loading}
      className="text-wiki-link text-[12px] hover:underline disabled:opacity-50"
    >
      {loading ? "Restoring…" : "restore"}
    </button>
  );
}