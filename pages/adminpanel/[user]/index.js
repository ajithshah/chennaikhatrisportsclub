import React from "react";
import { useRouter } from "next/router";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";
import UserDetails from "@/Components/AdminPanel/UserDetails";

const UserDetail = () => {
  const router = useRouter();
  const { userId } = router.query;

  return (
    <>
      <Meta />
      <Header />
      <div className="d-flex flex-column min-vh-100">
        <main className="flex-grow-1">
          <UserDetails userId={userId} />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default UserDetail;
