import React from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Contact from "@/Components/Contact";

const ContactPage = () => {
  return (
    <>
      <Meta />
      <Header />
      <div className="d-flex flex-column min-vh-100">
        <Meta />
        <main className="flex-grow-1">
          <Contact />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;
