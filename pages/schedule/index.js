import withSeason3Guard from "@/Components/Season3Guard";
import SchedulePage from "@/Components/Schedule";
import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Header from "@/Components/Header";

const Schedule = () => {

  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <Header />
      <main className="flex-grow-1">
        <SchedulePage />
      </main>
      <Footer />
    </div>
  );
};

export default withSeason3Guard(Schedule);
