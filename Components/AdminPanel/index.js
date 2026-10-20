import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { auth } from "../../firebase";
import { usersDb, teamsDb } from "../../lib/db";
import { authFetch } from "../../lib/authFetch";
import Header from "../Header";
import Meta from "../Meta";

export default function AdminPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState({
    cricket: 0,
    kpl4: 0,
    users: 0,
    tournaments: 0,
    senior_citizen_cricket: 0,
    events: 0,
    matches: 0,
  });

  const sportsCategories = [
    {
      id: "users",
      title: "User Management",
      icon: "👥",
      description: "Manage user accounts, roles and permissions",
      color: "#F44336",
      link: "/adminpanel/users",
      statKey: "users",
      isActive: true,
      statLabel: "Users",
    },
    {
      id: "cricket",
      title: "KPL S3 Teams",
      icon: "🏏",
      description: "Manage cricket teams, players and match schedules",
      color: "#4CAF50",
      link: "/adminpanel/cricket",
      isActive: true,
      statKey: "cricket",
      statLabel: "Cricket Teams",
    },
    {
      id: "kpl4",
      title: "KPL S4 Teams",
      icon: "🏆",
      description: "View team registrations and payment screenshots for KPL Season 4",
      color: "#1B3A8A",
      link: "/adminpanel/kpl4",
      statKey: "kpl4",
      isActive: true,
      statLabel: "Registered Teams",
    },
    {
      id: "matches",
      title: "Match Schedule",
      icon: "📅",
      description: "Manage upcoming matches, schedules, and match details",
      color: "#FF5722",
      link: "/adminpanel/matches",
      statKey: "matches",
      isActive: true,
      statLabel: "Scheduled Matches",
    },
    // {
    //   id: "cricket",
    //   title: "Senior Citizen Cricket Teams",
    //   icon: "🏏",
    //   description:
    //     "Manage Senior Citizen Cricket Teams, players and match schedules",
    //   color: "#4CAF50",
    //   link: "/adminpanel/senior_cricket",
    //   statKey: "senior_citizen_cricket",
    //   isActive: false,
    //   statLabel: "Senior Citizen Cricket Teams",
    // },
    // {
    //   id: "tournaments",
    //   title: "Tournaments",
    //   icon: "🏆",
    //   description: "Manage cricket tournaments and matches",
    //   color: "#2196F3",
    //   link: "/adminpanel/tournaments",
    //   statKey: "tournaments",
    //   isActive: false,
    //   statLabel: "Tournaments",
    // },
    // {
    //   id: "events",
    //   title: "Events",
    //   icon: "📅",
    //   description: "Manage upcoming club events and activities",
    //   color: "#FF9800",
    //   link: "/adminpanel/events",
    //   statKey: "events",
    //   isActive: false,
    //   statLabel: "Upcoming Events",
    // },
  ];

  // Fetch counts from MongoDB
  const fetchCounts = async () => {
    try {
      // Get team count
      const teams = await teamsDb.getAll();

      // Get user count
      const users = await usersDb.getAll();

      let kpl4Count = 0;
      try {
        const res = await authFetch("/api/kpl4/registrations");
        if (res.ok) kpl4Count = (await res.json()).length;
      } catch (e) {
        console.error("Error fetching KPL 4 registrations:", e);
      }

      setCategoryStats((prev) => ({
        ...prev,
        cricket: teams.length,
        kpl4: kpl4Count,
        users: users.length,
      }));
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    const checkAdmin = async (currentUser) => {
      const userData = await usersDb.get(currentUser.uid);

      if (!userData || !userData.isAdmin) {
        router.push("/");
        return;
      }

      // Fetch counts after admin check
      await fetchCounts();
      setLoading(false);
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
        <Meta />
        <Header />
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="loading-animation">
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            <h2 className="loading-text">Getting Admin Panel</h2>
            <p className="loading-subtext">
              Please wait while we load admin panel...
            </p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Meta title="Admin Panel | Chennai Khatri Sports Club" />
      <Header />
      <style jsx global>{`
        body {
          background: #090c10;
        }

        .admin-dashboard {
          padding: 2rem 0;
          background: #090c10;
          padding-top: 100px;
        }

        .dashboard-header {
          margin-bottom: 3rem;
          position: relative;
          padding-bottom: 1rem;
        }

        .dashboard-header::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, #58a6ff, transparent);
        }

        .dashboard-title {
          font-weight: 700;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #f0f6fc;
          letter-spacing: -0.5px;
        }

        .dashboard-subtitle {
          color: #8b949e;
          font-size: 1.1rem;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .dashboard-card {
          background: #161b22;
          border-radius: 0.5rem;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #30363d;
          position: relative;
        }

        .dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
          border-color: #58a6ff;
        }

        .dashboard-card-accent {
          height: 4px;
          width: 100%;
        }

        .dashboard-card-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #30363d;
        }

        .dashboard-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f0f6fc;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dashboard-card-icon {
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-card-body {
          padding: 1.5rem;
        }

        .dashboard-card-description {
          color: #8b949e;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .dashboard-card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .dashboard-button {
          background: #0d1117;
          color: #f0f6fc;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dashboard-button:hover {
          background: #1f6feb;
          color: white;
          border-color: #1f6feb;
        }

        .dashboard-button-icon {
          font-size: 1rem;
        }

        .dashboard-meta {
          display: flex;
          gap: 1rem;
        }

        .dashboard-badge {
          background: #0d1117;
          color: #8b949e;
          border: 1px solid #30363d;
          border-radius: 2rem;
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #0d1117;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .loading-content {
          text-align: center;
        }

        .loader {
          width: 48px;
          height: 48px;
          border: 5px solid #30363d;
          border-bottom-color: #58a6ff;
          border-radius: 50%;
          display: inline-block;
          box-sizing: border-box;
          animation: rotation 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .admin-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .admin-stat-card {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 0.5rem;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .admin-stat-card:hover {
          border-color: #58a6ff;
          transform: translateY(-3px);
        }

        .admin-stat-value {
          font-weight: 700;
          font-size: 2rem;
          color: #f0f6fc;
          margin-bottom: 0.2rem;
        }

        .admin-stat-label {
          color: #8b949e;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="admin-dashboard">
        <Container>
          <div className="dashboard-header">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Chennai Khatri Sports Club Management Console
            </p>
          </div>

          {/* <div className="admin-stats-row">
            {sportsCategories.map((category) => (
              <div className="admin-stat-card" key={category.id}>
                <div className="admin-stat-value">
                  {categoryStats[category.statKey]}
                </div>
                <div className="admin-stat-label">{category.statLabel}</div>
              </div>
            ))}
          </div> */}

          <div className="dashboard-grid">
            {sportsCategories.map((category) => (
              <div className="dashboard-card" key={category.id}>
                <div
                  className="dashboard-card-accent"
                  style={{ background: category.color }}
                ></div>

                <div className="dashboard-card-header">
                  <div className="dashboard-card-title">
                    <span className="dashboard-card-icon">{category.icon}</span>
                    {category.title}
                  </div>
                  <div className="dashboard-badge">
                    {categoryStats[category.statKey]}{" "}
                    {category.id === "cricket" || category.id === "kpl4"
                      ? "teams"
                      : category.id === "users"
                      ? "users"
                      : category.id === "tournaments"
                      ? "total"
                      : "upcoming"}
                  </div>
                </div>

                <div className="dashboard-card-body">
                  <p className="dashboard-card-description">
                    {category.description}
                  </p>

                  <div className="dashboard-card-actions">
                    <button
                      className={`dashboard-button ${
                        !category.isActive ? "disabled-button" : ""
                      }`}
                      onClick={() =>
                        category.isActive && router.push(category.link)
                      }
                      disabled={!category.isActive}
                    >
                      {category.isActive ? "Manage" : "Coming Soon"}
                      {category.isActive && (
                        <span className="dashboard-button-icon">→</span>
                      )}
                    </button>

                    <div className="dashboard-meta">
                      <span className="dashboard-badge">
                        {category.id === "cricket" || category.id === "kpl4"
                          ? "Teams"
                          : category.id === "users"
                          ? "Accounts"
                          : category.id === "tournaments"
                          ? "Matches"
                          : "Schedule"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
}
