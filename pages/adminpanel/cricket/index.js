import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import ManageGame from "@/Components/AdminPanel/ManageCricketTeam";

const ProfilePage = () => {
  return (
    <>
      <Meta />
      <ManageGame />
      <Footer />
    </>
  );
};

export default ProfilePage;
