import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { signInWithGoogleIdToken } from "../../utils/auth";
import { useSettings } from "../../lib/useSettings";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

// Shows the Google One Tap "Continue as <name>" prompt to visitors who are not signed in.
// Renders nothing; does nothing until NEXT_PUBLIC_GOOGLE_CLIENT_ID is set and the super admin
// has it switched on.
export default function GoogleOneTap() {
  const { settings, loaded } = useSettings();
  const enabled = loaded && settings.oneTapEnabled;

  useEffect(() => {
    if (!CLIENT_ID || !enabled) return;

    let cancelled = false;

    const showPrompt = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          try {
            await signInWithGoogleIdToken(response.credential);
          } catch (error) {
            console.error("Google One Tap sign-in failed:", error);
          }
        },
        auto_select: true,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: true,
      });
      window.google.accounts.id.prompt();
    };

    const loadScriptAndPrompt = () => {
      if (window.google?.accounts?.id) {
        showPrompt();
        return;
      }
      let script = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", showPrompt, { once: true });
    };

    // Wait until Firebase has restored any saved session, then prompt only signed-out visitors
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.google?.accounts?.id?.cancel();
      } else {
        loadScriptAndPrompt();
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
      window.google?.accounts?.id?.cancel();
    };
  }, [enabled]);

  return null;
}
