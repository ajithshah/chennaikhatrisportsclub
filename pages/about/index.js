import React from "react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Meta from "../../Components/Meta";
import About from "@/Components/About";
const ContactPage = () => {
  return (
    <>
      <Meta />
      <Header />
      <div className="d-flex flex-column min-vh-100">
        <Meta />
        <main className="flex-grow-1">
          <About />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;
