import "@/styles/globals.css";
import "@/styles/about.css";
import "@/styles/edit-profile.css";
import { Analytics } from '@vercel/analytics/next';
import Maintenance from "@/Components/Maintanance";
import GoogleOneTap from "@/Components/GoogleOneTap";

export default function App({ Component, pageProps }) {
  return (
    <>
        {/* <Maintenance /> */}
      <Component {...pageProps} />
      <GoogleOneTap />
      <Analytics />
    </>
  );
}
