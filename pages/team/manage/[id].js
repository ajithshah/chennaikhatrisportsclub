import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Header from "@/Components/Header";
import ManageTeam from "@/Components/ManageTeam";

const ProfilePage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <Header />
      <main className="flex-grow-1">
        <ManageTeam />
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
