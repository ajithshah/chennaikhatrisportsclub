import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const SITE_URL = "https://chennaikhatrisportsclub.in";
const SITE_NAME = "Chennai Khatri Sports Club";
const DEFAULT_TITLE = "Chennai Khatri Sports Club | Khatri Premier League (KPL) Cricket, Chennai";
const DEFAULT_DESCRIPTION =
  "Chennai Khatri Sports Club brings the Khatri community together through sports. Home of the Khatri Premier League (KPL) cricket tournament in Chennai. KPL Season 4 team registration is open.";
const DEFAULT_IMAGE = "/logo.png";

// Pages for members and admins only; keep them out of search results.
const PRIVATE_PREFIXES = ["/adminpanel", "/profile", "/edit", "/auction", "/team", "/schedule"];

const organization = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sport: "Cricket",
  foundingDate: "2023",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  sameAs: [
    "https://www.instagram.com/chennai_khatri_sports.club",
    "https://www.youtube.com/@KhatriSportsClub",
  ],
};

const Meta = ({ title, description, image, noindex }) => {
  const router = useRouter();
  const pageTitle = title || DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const path = router.asPath.split("?")[0].split("#")[0];
  const canonical = `${SITE_URL}${path}`;
  const imageUrl = `${SITE_URL}${image || DEFAULT_IMAGE}`;
  const hidden =
    noindex ??
    PRIVATE_PREFIXES.some((p) => router.pathname === p || router.pathname.startsWith(`${p}/`));

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta
        name="keywords"
        content="Chennai Khatri Sports Club, KPL, Khatri Premier League, cricket tournament Chennai, Khatri community, KPL Season 4"
      />
      <meta
        name="robots"
        content={hidden ? "noindex, nofollow" : "index, follow, max-image-preview:large"}
      />
      <meta name="theme-color" content="#0b1f4d" />
      <link key="canonical" rel="canonical" href={canonical} />
      <link key="icon" rel="icon" href="/favicon.ico" sizes="any" />
      <link key="apple-touch-icon" rel="apple-touch-icon" href="/logo.png" />

      {/* Open Graph (WhatsApp, Facebook, LinkedIn link previews) */}
      <meta key="og:type" property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content="en_IN" />
      <meta key="og:url" property="og:url" content={canonical} />
      <meta key="og:title" property="og:title" content={pageTitle} />
      <meta key="og:description" property="og:description" content={pageDescription} />
      <meta key="og:image" property="og:image" content={imageUrl} />
      <meta key="og:image:alt" property="og:image:alt" content={`${SITE_NAME} logo`} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {router.pathname === "/" && (
        <script
          key="ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
      )}

      <meta
        name="google-adsense-account"
        content="ca-pub-3253246972941649"
      ></meta>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
      ></link>
      <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.slim.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
      <script src="https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.js"></script>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3253246972941649"
        crossorigin="anonymous"
      ></script>
      <link
        type="text/css"
        rel="stylesheet"
        href="https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
      ></link>
    </Head>
  );
};

export default Meta;
