import React from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Hero from "@/Components/Hero";

export default function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <Header />
      <Hero />
      <Footer />
    </div>
  );
}
