import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Headers from "@/Components/Header";
import KplSeason4 from "@/Components/KplSeason4";

const KplSeason4Page = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta title="KPL Season 4 | Chennai Khatri Sports Club" />
      <main className="flex-grow-1">
        <Headers />
        <KplSeason4 />
      </main>
      <Footer />
    </div>
  );
};

export default KplSeason4Page;
