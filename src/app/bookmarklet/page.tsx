"use client";

import { useState } from "react";

export default function BookmarkletPage() {
  const [copied, setCopied] = useState(false);

  // Build the bookmarklet code with the current origin baked in
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // Minified bookmarklet source
  const bookmarkletCode = `javascript:(function(){
var sel=window.getSelection?window.getSelection().toString():"";
var title=document.title||location.href;
var payload=JSON.stringify({url:location.href,title:title,selectedText:sel});
fetch("${origin}/api/bookmarklet",{
  method:"POST",
  credentials:"include",
  headers:{"Content-Type":"application/json"},
  body:payload
}).then(function(r){return r.json()}).then(function(d){
  if(d.slug){
    var ok=confirm("Saved as draft: "+d.title+". Open editor now?");
    if(ok)window.open("${origin}/articles/"+d.slug+"/edit","_blank");
  } else {
    alert("Error: "+(d.error||"Unknown error"));
  }
}).catch(function(e){alert("Save failed: "+e.message)});
})();`.replace(/\s+/g, " ").trim();

  function copyCode() {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <h1
        className="text-[1.7rem] font-normal text-heading border-b border-border pb-1 mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Save to wiki — Bookmarklet
      </h1>

      <p className="text-[13px] mb-4">
        Add the bookmarklet below to your browser. When you click it on any webpage, it saves
        the current page (or your selected text) as a draft article in this wiki.
      </p>

      {/* Drag target */}
      <div className="wiki-portal mb-6">
        <div className="wiki-portal-header">Install</div>
        <div className="wiki-portal-body">
          <p className="text-[12px] text-muted mb-3">
            <strong>Option A — drag and drop:</strong> Drag the button below to your bookmarks bar.
          </p>
          <a
            href={bookmarkletCode}
            className="inline-block h-7 px-3 text-[12px] font-medium border border-accent bg-surface text-accent rounded hover:bg-surface-hover select-none"
            onClick={(e) => { e.preventDefault(); alert("Drag this button to your bookmarks bar — don't click it here."); }}
            title="Drag me to your bookmarks bar"
          >
            Save to wiki
          </a>

          <p className="text-[12px] text-muted mt-4 mb-2">
            <strong>Option B — manual install:</strong> Copy the code, create a new bookmark manually, and paste it as the URL.
          </p>
          <div className="flex gap-2 items-start">
            <textarea
              readOnly
              value={bookmarkletCode}
              rows={4}
              className="flex-1 border border-border bg-surface px-2 py-1 text-[11px] font-mono focus:outline-none resize-none"
            />
            <button
              onClick={copyCode}
              className="h-6 px-2 text-[11px] border border-border rounded hover:bg-surface-hover shrink-0"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="wiki-portal mb-4">
        <div className="wiki-portal-header">How it works</div>
        <div className="wiki-portal-body text-[12px] space-y-1">
          <p>1. Navigate to any webpage you want to save.</p>
          <p>2. Optionally, select some text to clip just that portion.</p>
          <p>3. Click the <strong>Save to wiki</strong> bookmarklet.</p>
          <p>4. The page (or selection) is saved as a <strong>draft article</strong>.</p>
          <p>5. You are offered to open the editor to review and publish it.</p>
          <p className="text-muted pt-1">
            You must be logged in to this wiki in the same browser for the save to succeed.
          </p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
