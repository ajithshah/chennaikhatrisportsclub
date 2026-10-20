import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { authFetch } from "./authFetch";

const DEFAULTS = { registrationOpen: false, showTeamInfo: false };

// Loads the feature toggles (and whether the signed-in user may change them).
export function useSettings() {
  const [state, setState] = useState({
    settings: DEFAULTS,
    canManage: false,
    loaded: false,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await authFetch("/api/settings");
        const data = await res.json();
        if (!cancelled && res.ok) setState({ ...data, loaded: true });
        else if (!cancelled) setState((s) => ({ ...s, loaded: true }));
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loaded: true }));
      }
    };
    // Wait for Firebase to restore the session so the token is attached.
    const unsubscribe = auth.onAuthStateChanged(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
