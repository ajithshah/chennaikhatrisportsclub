import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Headers from "@/Components/Header";
import KplSeason4 from "@/Components/KplSeason4";

const KplSeason4Page = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta
        title="KPL Season 4 | Khatri Premier League Cricket, Chennai"
        description="Khatri Premier League (KPL) Season 4 cricket tournament on 23rd & 24th January 2027 in Chennai. Registration fee Rs. 6000 per team. Register your team online."
      />
      <main className="flex-grow-1">
        <Headers />
        <KplSeason4 />
      </main>
      <Footer />
    </div>
  );
};

export default KplSeason4Page;
