// Tiny client-side helper for the cookie consent banner.
// We don't load any analytics / marketing tooling yet — this stores the user's
// choice so we don't show the banner again, and so we can gate future
// integrations (Plausible, PostHog, etc.) behind the flag.

export const CONSENT_STORAGE_KEY = "ds_cookie_consent";

export type CookieConsent = {
  essential: true; // always true — strictly necessary for sign-in
  analytics: boolean;
  recordedAt: string; // ISO timestamp
  version: number;
};

export const CONSENT_VERSION = 1;

export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = {
    essential: true,
    analytics,
    recordedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  try {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify(consent),
    );
  } catch {
    // localStorage may be unavailable (private mode); fail quietly.
  }
  // Fire a window event so listeners (e.g. analytics loader) can react.
  window.dispatchEvent(
    new CustomEvent("ds-consent-changed", { detail: consent }),
  );
  return consent;
}

export function clearConsent() {
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent("ds-consent-cleared"));
}
