import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Headers from "@/Components/Header";
import AboutUs from "@/Components/About";

const About = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta
        title="About Us | Chennai Khatri Sports Club"
        description="Learn about Chennai Khatri Sports Club: founded in 2023 to bring the Khatri community together through cricket and the Khatri Premier League (KPL)."
      />
      <main className="flex-grow-1">
        <Headers />
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
};

export default About;
