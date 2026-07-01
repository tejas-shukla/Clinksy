"use client";

import type { ReactNode } from "react";

type Variant = "pill" | "block" | "quick-action";

type Props = {
  variant: Variant;
  label?: string;
  icon?: ReactNode;
};

// Reusable trigger for the global FloatingChat. Fires a window event the
// FloatingChat component listens for.
export function ChatWithGuideButton({ variant, label, icon }: Props) {
  const onClick = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("ds-open-chat"));
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-full border border-accent-400 bg-accent-50/40 px-4 py-2 text-sm font-medium text-accent-500 transition-colors hover:bg-accent-50"
      >
        <ChatIcon />
        {label ?? "Chat with guide"}
      </button>
    );
  }

  if (variant === "quick-action") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-bone-50 px-4 py-3 text-left transition-colors hover:border-ink/30"
      >
        <span aria-hidden="true" className="text-ink/70">
          {icon ?? <ChatIcon />}
        </span>
        <span className="text-sm font-medium text-ink">
          {label ?? "Chat with guide"}
        </span>
      </button>
    );
  }

  // block — used inside cards for "View suggestions →"-style CTAs
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-center rounded-2xl border border-ink/10 bg-bone px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/30 hover:bg-bone-50"
    >
      {label ?? "Open the chat →"}
    </button>
  );
}

function ChatIcon() {
  return (
    <svg
      width="14"
      height="14"
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
  );
}
