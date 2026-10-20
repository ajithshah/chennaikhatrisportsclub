import withSeason3Guard from "@/Components/Season3Guard";
import ViewTeam from "@/Components/ViewTeam";
import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Header from "@/Components/Header";

const TeamPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <Header />
      <main className="flex-grow-1">
        <ViewTeam />
      </main>
      <Footer />
    </div>
  );
};

export default withSeason3Guard(TeamPage);
