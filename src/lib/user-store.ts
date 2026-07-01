// user-store.ts — simple localStorage-based user identity for Clinksy.
// No passwords. Name + email only. Persists across browser sessions.

import { useState, useEffect } from "react";

const USER_KEY = "clinksy_user_v1";

export type StoredUser = {
  name: string;
  email: string;
  situation?: "first-time" | "remortgage";
  buyingStage?: "browsing" | "offer-placed" | "sourcing-pros" | "in-flight";
};

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUser;
    if (!parsed.name || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}

// React hook — returns { user, setUser, isLoaded }
// isLoaded prevents a flash of the gate form before localStorage is read.
export function useUser() {
  const [user, setUserState] = useState<StoredUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setUserState(getStoredUser());
    setIsLoaded(true);
  }, []);

  function setUser(u: StoredUser) {
    setStoredUser(u);
    setUserState(u);
  }

  function clearUser() {
    clearStoredUser();
    setUserState(null);
  }

  return { user, setUser, clearUser, isLoaded };
}
