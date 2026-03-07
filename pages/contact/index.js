import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Headers from "@/Components/Header";
import Contact from "@/Components/Contact";

const ContactPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <main className="flex-grow-1">
        <Headers />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
