import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import ManageUsers from "@/Components/AdminPanel/ManageUsers";

const CricketPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <main className="flex-grow-1">
        <ManageUsers />
      </main>
      <Footer />
    </div>
  );
};

export default CricketPage;
