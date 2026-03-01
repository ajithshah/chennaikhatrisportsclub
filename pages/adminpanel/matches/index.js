import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../../../firebase";
import { usersDb } from "../../../lib/db";
import Header from "../../../Components/Header";
import Meta from "../../../Components/Meta";
import Footer from "@/Components/Footer";
import MatchSchedule from "@/Components/AdminPanel/MatchSchedule";

export default function MatchesAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async (currentUser) => {
      try {
        const userData = await usersDb.get(currentUser.uid);

        if (!userData || !userData.isAdmin) {
          router.push("/");
          return;
        }

        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/");
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAdmin(user);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <>
        <Meta title="Admin Match Schedule | Chennai Khatri Sports Club" />
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admin panel...</p>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding: 2rem;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Meta
        title="Match Schedule Management | Chennai Khatri Sports Club"
        description="Manage cricket match schedules for Chennai Khatri Sports Club"
      />
      <Header />
      <div className="admin-page">
        <MatchSchedule />
      </div>
      <Footer />
      <style jsx>{`
        .admin-page {
          padding-top: 80px;
          min-height: 100vh;
          background-color: #f8f9fa;
        }
      `}</style>
    </>
  );
}
