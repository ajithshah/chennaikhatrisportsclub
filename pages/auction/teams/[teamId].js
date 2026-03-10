import React from "react";
import Header from "../../../Components/Header";
import Footer from "../../../Components/Footer";
import Meta from "../../../Components/Meta";
import ViewAuctionTeam from "../../../Components/ViewAuctionTeam";

const AuctionTeamDetailPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta title="Team Details | Chennai Khatri Sports Club" />
      <Header />
      <main className="flex-grow-1">
        <ViewAuctionTeam />
      </main>
      <Footer />
    </div>
  );
};

export default AuctionTeamDetailPage;
