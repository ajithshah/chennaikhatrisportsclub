import React from "react";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import UserDetails from "@/Components/AdminPanel/UserDetails";
import { useRouter } from "next/router";
import Headers from "@/Components/Header";

const UserDetailsPage = () => {
  const router = useRouter();
  const { user } = router.query;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <Headers />
      <main className="flex-grow-1">
        <UserDetails userId={user} />
      </main>
      <Footer />
    </div>
  );
};

export default UserDetailsPage;
