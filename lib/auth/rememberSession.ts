/**
 * "Remember me" for Supabase sessions.
 *
 * Supabase keeps the session in persistent cookies. When the user unticks
 * "remember me", we flag the session as ephemeral (localStorage) and set a
 * browser-session cookie (no Expires → shared by all tabs, removed when the
 * browser closes). On the next visit, an ephemeral session whose cookie is
 * gone is signed out.
 */
const EPHEMERAL_KEY = "lnk.session.ephemeral";
const ALIVE_COOKIE = "lnk_session_alive";

function hasAliveCookie() {
  return document.cookie.split("; ").some((c) => c === `${ALIVE_COOKIE}=1`);
}

function setAliveCookie() {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ALIVE_COOKIE}=1; Path=/; SameSite=Lax${secure}`;
}

export function markSessionPersistence(remember: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (remember) {
      localStorage.removeItem(EPHEMERAL_KEY);
    } else {
      localStorage.setItem(EPHEMERAL_KEY, "1");
      setAliveCookie();
    }
  } catch {
    /* storage unavailable — fall back to Supabase default (remembered) */
  }
}

/** True when an ephemeral session survived a browser restart and must be dropped. */
export function isExpiredEphemeralSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(EPHEMERAL_KEY) === "1" && !hasAliveCookie();
  } catch {
    return false;
  }
}

export function clearSessionPersistence() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(EPHEMERAL_KEY);
    document.cookie = `${ALIVE_COOKIE}=; Path=/; Max-Age=0`;
  } catch {
    /* ignore */
  }
}
