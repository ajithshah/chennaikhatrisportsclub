import ViewTeam from "@/Components/ViewTeam";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import Header from "@/Components/Header";
import { auth } from "../../firebase";

const TeamPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoading(false);
      if (!user) {
        // Redirect to home page if user is not logged in
        router.push("/");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <Header />
      <main className="flex-grow-1">
        <ViewTeam />
      </main>
      <Footer />
    </div>
  );
};

export default TeamPage;
