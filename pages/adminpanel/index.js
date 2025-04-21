import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import AdminPanel from "@/Components/AdminPanel";

const AdminPage = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <main className="flex-grow-1">
        <AdminPanel />
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
