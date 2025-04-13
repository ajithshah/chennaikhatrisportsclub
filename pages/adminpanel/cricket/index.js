import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import ManageGame from "@/Components/AdminPanel/ManageCricketTeam";

const ProfilePage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <main className="flex-grow-1">
        <ManageGame />
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
