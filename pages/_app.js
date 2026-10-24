import { useEffect } from "react";
import "@/styles/globals.css";
import "@/styles/about.css";
import "@/styles/edit-profile.css";
import { Analytics } from '@vercel/analytics/next';
import Maintenance from "@/Components/Maintanance";
import GoogleOneTap from "@/Components/GoogleOneTap";

const CHUNK_ERROR = /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module/i;
const RELOAD_KEY = "chunk-reload-at";

// After a deploy, a tab opened earlier may request JS files that no longer exist.
// Reload once to pick up the new build; the guard stops a reload loop.
const reloadOnStaleChunk = (error) => {
  const message = `${error?.name || ""} ${error?.message || error || ""}`;
  if (!CHUNK_ERROR.test(message)) return;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 10000) return;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return;
  }
  window.location.reload();
};

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const onError = (e) => reloadOnStaleChunk(e.error || e.message);
    const onRejection = (e) => reloadOnStaleChunk(e.reason);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return (
    <>
        {/* <Maintenance /> */}
      <Component {...pageProps} />
      <GoogleOneTap />
      <Analytics />
    </>
  );
}
