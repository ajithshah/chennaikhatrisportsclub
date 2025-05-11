import React from "react";
import Head from "next/head";
import favicon from "../../public/favicon.ico";

const Meta = ({ title }) => {
  return (
    <Head>
      <title>{title || "Chennai Khatri Sports Club"}</title>
      <meta name="description" content="Chennai Khatri Sports Club" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href={favicon} />
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
