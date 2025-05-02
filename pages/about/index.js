import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Headers from "@/Components/Header";
import AboutUs from "@/Components/About";

const About = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <main className="flex-grow-1">
        <Headers />
        <AboutUs />
      </main>
      <Footer />
    </div>
  );
};

export default About;
