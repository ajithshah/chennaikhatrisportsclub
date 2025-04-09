import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Profile from "@/Components/Profile";

const ProfilePage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <main className="flex-grow-1">
        <Profile />
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;