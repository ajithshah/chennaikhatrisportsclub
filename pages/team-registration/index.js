import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Headers from "@/Components/Header";
import TeamRegistration from "@/Components/TeamRegistration";

const TeamRegistrationPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta
        title="Team Registration | KPL Season 4"
        description="Register your team for KPL Season 4, the Khatri Premier League cricket tournament in Chennai on 23rd & 24th January 2027. Registration fee Rs. 6000."
      />
      <main className="flex-grow-1">
        <Headers />
        <TeamRegistration />
      </main>
      <Footer />
    </div>
  );
};

export default TeamRegistrationPage;
