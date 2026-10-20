import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Headers from "@/Components/Header";
import TeamRegistration from "@/Components/TeamRegistration";

const TeamRegistrationPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta title="Team Registration | KPL Season 4" />
      <main className="flex-grow-1">
        <Headers />
        <TeamRegistration />
      </main>
      <Footer />
    </div>
  );
};

export default TeamRegistrationPage;
