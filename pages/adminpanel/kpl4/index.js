import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import KplRegistrations from "@/Components/AdminPanel/KplRegistrations";

const KplRegistrationsPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta title="KPL Season 4 Teams | Admin" />
      <main className="flex-grow-1">
        <KplRegistrations />
      </main>
      <Footer />
    </div>
  );
};

export default KplRegistrationsPage;
