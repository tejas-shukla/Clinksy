"use client";

export function CookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("ds-open-cookie-settings"));
      }}
      className="transition-colors hover:text-ink"
    >
      Cookie settings
    </button>
  );
}
