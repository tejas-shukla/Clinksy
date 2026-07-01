"use client";

// ConversationsCard — the buyer's "people you can talk to" hub for the dashboard.
//
// Lists every conversation channel in one place and scales as we add more:
//   • Mortgage advisor     → opens a live human thread (AdvisorChat, backend-backed)
//   • Solicitor            → placeholder, coming soon
//
// The human channels share one backend (/api/conversations) keyed by the buyer's
// email + channel, so the buyer can start the chat here and pick it up later from
// either the dashboard or the mortgage portal.

import { useEffect, useState } from "react";
import { useUser } from "@/lib/user-store";
import { AdvisorChat } from "@/components/chat/AdvisorChat";

type HumanChannel = "advisor" | "solicitor";

type ChannelDef = {
  id: HumanChannel;
  name: string;
  blurb: string;
  avatar: string;
  kind: "human" | "soon";
};

const CHANNELS: ChannelDef[] = [
  {
    id: "advisor",
    name: "Mortgage advisor",
    blurb: "A real human to guide your mortgage application.",
    avatar: "MA",
    kind: "human",
  },
  {
    id: "solicitor",
    name: "Solicitor",
    blurb: "Conveyancing help — available once you instruct one.",
    avatar: "SO",
    kind: "soon",
  },
];

export function ConversationsCard() {
  const { user } = useUser();
  const [openChannel, setOpenChannel] = useState<HumanChannel | null>(null);

  function handleClick(c: ChannelDef) {
    if (c.kind === "human") {
      setOpenChannel(c.id as HumanChannel);
    }
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-bone-50 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-ink/60">Your conversations</p>
        <span className="text-[11px] text-ink/40">Messages in one place</span>
      </div>

      <ul className="mt-3 space-y-2">
        {CHANNELS.map((c) => {
          const disabled = c.kind === "soon";
          return (
            <li key={c.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleClick(c)}
                className={
                  "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors " +
                  (disabled
                    ? "cursor-default border-ink/10 bg-transparent opacity-60"
                    : "border-ink/10 bg-bone hover:border-ink/30")
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    "grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-medium bg-ink/8 text-ink/55"
                  }
                >
                  {c.avatar}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{c.name}</span>
                    {c.kind === "soon" && (
                      <span className="rounded-full bg-ink/6 px-2 py-0.5 text-[10px] font-medium text-ink/45">
                        Coming soon
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-ink/55">
                    {c.blurb}
                  </span>
                </span>
                {!disabled && (
                  <span aria-hidden="true" className="shrink-0 text-ink/30">
                    <ChevronIcon />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {openChannel && user && (
        <ChatModal
          title={openChannel === "advisor" ? "Mortgage advisor" : "Solicitor"}
          counterpartName={openChannel === "advisor" ? "your advisor" : "your solicitor"}
          buyerEmail={user.email}
          myName={user.name}
          channel={openChannel}
          onClose={() => setOpenChannel(null)}
        />
      )}
    </div>
  );
}

function ChatModal({
  title,
  counterpartName,
  buyerEmail,
  myName,
  channel,
  onClose,
}: {
  title: string;
  counterpartName: string;
  buyerEmail: string;
  myName: string;
  channel: HumanChannel;
  onClose: () => void;
}) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-bone-50 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">{title}</p>
            <p className="text-[11px] text-ink/45">Live conversation</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="grid h-8 w-8 place-items-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-3">
          <AdvisorChat
            buyerEmail={buyerEmail}
            me="buyer"
            myName={myName}
            channel={channel}
            counterpartName={counterpartName}
          />
        </div>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
