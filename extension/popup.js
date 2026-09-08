// ── Elements ──────────────────────────────────────────────────────────────────
const titleInput = document.getElementById("titleInput");
const selectedText = document.getElementById("selectedText");
const clipBtn = document.getElementById("clipBtn");
const openBtn = document.getElementById("openBtn");
const statusMsg = document.getElementById("statusMsg");
const errorMsg = document.getElementById("errorMsg");
const statusBadge = document.getElementById("statusBadge");
const wikiUrlInput = document.getElementById("wikiUrl");
const saveSettingsBtn = document.getElementById("saveSettings");

let lastSlug = null;
let wikiOrigin = "";

// ── Init: load current tab info + settings ────────────────────────────────────
chrome.storage.local.get(["wikiUrl"], (result) => {
  wikiOrigin = (result.wikiUrl || "").replace(/\/$/, "");
  if (wikiUrlInput) wikiUrlInput.value = wikiOrigin;
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab) return;

  // Pre-fill title
  if (titleInput && tab.title) titleInput.value = tab.title;

  // Inject content script to get selected text
  chrome.scripting.executeScript(
    { target: { tabId: tab.id }, func: () => window.getSelection().toString() },
    (results) => {
      const sel = results?.[0]?.result || "";
      if (selectedText && sel) selectedText.value = sel;
    }
  );
});

// ── Save settings ─────────────────────────────────────────────────────────────
saveSettingsBtn.addEventListener("click", () => {
  const url = wikiUrlInput.value.trim().replace(/\/$/, "");
  chrome.storage.local.set({ wikiUrl: url }, () => {
    wikiOrigin = url;
    showStatus("Settings saved.");
  });
});

// ── Clip ──────────────────────────────────────────────────────────────────────
clipBtn.addEventListener("click", async () => {
  hideMessages();

  if (!wikiOrigin) {
    showError("Set your wiki URL in Settings first.");
    return;
  }

  const title = titleInput.value.trim();
  if (!title) {
    showError("Title is required.");
    titleInput.focus();
    return;
  }

  clipBtn.disabled = true;
  clipBtn.textContent = "Saving…";
  statusBadge.textContent = "saving";

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    const url = tab?.url || "";

    try {
      const res = await fetch(`${wikiOrigin}/api/bookmarklet`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          title,
          selectedText: selectedText.value.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      lastSlug = data.slug;
      showStatus(`Saved as draft: "${data.title}"`);
      statusBadge.textContent = "saved";
      openBtn.style.display = "block";
      clipBtn.textContent = "Save again";
    } catch (err) {
      showError(err.message || "Save failed — are you logged in to the wiki?");
      statusBadge.textContent = "error";
      clipBtn.textContent = "Save as draft";
    } finally {
      clipBtn.disabled = false;
    }
  });
});

// ── Open editor ───────────────────────────────────────────────────────────────
openBtn.addEventListener("click", () => {
  if (lastSlug) {
    chrome.tabs.create({ url: `${wikiOrigin}/articles/${lastSlug}/edit` });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function showStatus(msg) {
  statusMsg.textContent = msg;
  statusMsg.style.display = "block";
  errorMsg.style.display = "none";
}
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
  statusMsg.style.display = "none";
}
function hideMessages() {
  statusMsg.style.display = "none";
  errorMsg.style.display = "none";
}
