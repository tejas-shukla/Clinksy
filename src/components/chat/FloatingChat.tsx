"use client";

import { useEffect, useState } from "react";
import { ChatBot } from "@/components/chat/ChatBot";

// Site-wide chat that lives in the corner. Opens a side panel on click,
// closes back to a pill. Acts as the buyer's friend throughout the journey.

export function FloatingChat() {
  const [open, setOpen] = useState(false);

  // Allow other components to open the chat via a custom event.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("ds-open-chat", handler);
    return () => window.removeEventListener("ds-open-chat", handler);
  }, []);

  // Press Esc to close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Pill button — always present, bottom-right */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chat with guide" : "Open chat with guide"}
        className={
          "fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-bone shadow-[0_4px_24px_-4px_rgba(10,10,10,0.35)] transition-all duration-200 hover:bg-ink-700 sm:bottom-7 sm:right-7 " +
          (open ? "scale-90 opacity-70" : "")
        }
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 4.5A2 2 0 014.5 2.5h7a2 2 0 012 2v5a2 2 0 01-2 2H7l-2.8 2.1V11.5h-.2a1 1 0 01-1-1V4.5z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        Chat with guide
      </button>

      {/* Backdrop — fades in when panel opens */}
      {open && (
        <button
          type="button"
          aria-label="Close chat backdrop"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
        />
      )}

      {/* Panel — slides up from bottom-right on mobile, side on desktop */}
      <aside
        aria-hidden={!open}
        className={
          "fixed inset-x-3 bottom-3 top-auto z-50 transform-gpu transition-transform duration-300 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[420px] " +
          (open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0")
        }
      >
        <div className="relative max-h-[min(80vh,720px)] overflow-hidden rounded-3xl border border-ink/10 bg-bone shadow-[0_24px_64px_-16px_rgba(10,10,10,0.35)]">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-400" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink/55">
                Clinkeys guide
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-7 w-7 place-items-center rounded-full text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 2l8 8M10 2l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="max-h-[calc(min(80vh,720px)-49px)] overflow-y-auto">
            <ChatBot />
          </div>
        </div>
      </aside>
    </>
  );
}
