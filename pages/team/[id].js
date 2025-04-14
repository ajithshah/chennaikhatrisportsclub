import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Header from "@/Components/Header";
import Team from "@/Components/Team";

const ProfilePage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <Header />
      <main className="flex-grow-1">
        <Team />
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
