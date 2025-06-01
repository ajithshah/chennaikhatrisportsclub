import { useState, useEffect, useRef } from "react";
import { Container, Badge, Table, Button, Form } from "react-bootstrap";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";
import Image from "next/image";

export function SchedulePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshInterval = 10000; // Fixed 10 seconds interval
  const autoRefreshTimerRef = useRef(null);

  useEffect(() => {
    fetchMatches();

    // Cleanup function to clear timer when component unmounts
    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, []);

  // Set up or clear auto-refresh timer when autoRefresh changes
  useEffect(() => {
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }

    if (autoRefresh) {
      autoRefreshTimerRef.current = setInterval(() => {
        fetchMatches();
      }, refreshInterval);
    }

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [autoRefresh]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const matchesCollection = collection(db, "matches");
      const matchesQuery = query(
        matchesCollection,
        orderBy("matchDate", "asc")
      );
      const matchesSnapshot = await getDocs(matchesQuery);
      const matchesList = matchesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMatches(matchesList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Scheduled":
        return <Badge bg="primary text-light">Scheduled</Badge>;
      case "Upcoming":
        return <Badge bg="primary text-light">Upcoming</Badge>;
      case "Live":
        return <Badge bg="danger text-light">Live</Badge>;
      case "Completed":
        return <Badge bg="success text-light">Completed</Badge>;
      case "Postponed":
        return <Badge bg="warning text-light">Postponed</Badge>;
      case "Cancelled":
        return <Badge bg="dark text-light">Cancelled</Badge>;
      default:
        return <Badge bg="secondary text-light">{status}</Badge>;
    }
  };

  const formatMatchDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Sort matches by status priority first, then by date and time
  const sortedMatches = [...matches].sort((a, b) => {
    // Status priority order: Live, Upcoming, Scheduled, Completed, Postponed, Cancelled
    const statusOrder = {
      Live: 1,
      Upcoming: 2,
      Scheduled: 3,
      Completed: 4,
      Postponed: 5,
      Cancelled: 6,
    };

    // Compare status priority
    const statusPriorityDiff = statusOrder[a.status] - statusOrder[b.status];

    // If status is different, sort by status priority
    if (statusPriorityDiff !== 0) {
      return statusPriorityDiff;
    }

    // If status is the same, sort by date and time
    const dateA = new Date(a.matchDate + "T" + a.matchTime);
    const dateB = new Date(b.matchDate + "T" + b.matchTime);

    // Compare dates for chronological sorting
    return dateA - dateB;
  });

  return (
    <>
      <Meta
        title="Match Schedule | Chennai Khatri Sports Club"
        description="View upcoming cricket match schedules for Chennai Khatri Sports Club"
      />
      <Header />

      <div className="match-schedule-page">
        <Container>
          <div className="page-header">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="page-title">Match Schedule</h1>
                <p className="text-muted">
                  Follow all Cricket matches of Chennai Khatri Sports Club
                </p>
              </div>
              <div className="d-flex align-items-center">
                <div className="auto-refresh-controls me-3">
                  <Form>
                    <div className="d-flex align-items-center mr-1">
                      <Form.Check
                        type="switch"
                        id="auto-refresh-switch"
                        label="Auto"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="me-3"
                      />
                    </div>
                  </Form>
                </div>
                <Button
                  variant="outline-primary"
                  onClick={fetchMatches}
                  disabled={loading}
                  className="refresh-button"
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden"></span>
              </div>
            </div>
          ) : (
            <>
              {sortedMatches.length === 0 ? (
                <div className="text-center my-5">
                  <p>No matches scheduled yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="match-table">
                    <thead>
                      <tr>
                        <th className="text-center">Status</th>
                        <th className="text-center">Group</th>
                        <th className="text-center">Type</th>
                        <th className="text-center">Team A</th>
                        <th className="text-center">Score</th>
                        <th className="text-center">Team B</th>
                        <th>Date, Time & Venue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMatches.map((match) => (
                        <tr
                          key={match.id}
                          className={`match-row ${match.status.toLowerCase()}-match ${"live-match-highlight"}`}
                        >
                          <td className="text-center align-middle">
                            {getStatusBadge(match.status)}
                          </td>
                          <td
                            className="text-center align-middle"
                            style={{ fontSize: "1.1rem", fontWeight: "500" }}
                          >
                            {match.group}
                          </td>
                          <td className="text-center align-middle">
                            {match.matchType}
                          </td>
                          <td className="team-cell">
                            <td className="team-cell">
                              <div className="team-info">
                                <div className="team-logo-section">
                                  {match.teamALogoUrl ? (
                                    <div className="team-logo-container">
                                      <Image
                                        src={match.teamALogoUrl}
                                        alt={`${match.teamA} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder">
                                      {match.teamA.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="team-details">
                                  <div className="d-flex flex-column">
                                    <span className="team-name">
                                      {match.teamA}
                                    </span>

                                    {match.winnerTeam === match.teamA && (
                                      <>
                                        <Badge
                                          bg="warning"
                                          className="winner-badge ms-1"
                                        >
                                          Winner
                                        </Badge>

                                        {match.manOfTheMatch && (
                                          <Badge
                                            bg="primary"
                                            className="primary-badge mt-1 text-light"
                                          >
                                            <i className="fas fa-trophy me-1 mr-1"></i>
                                            {match.manOfTheMatch}
                                          </Badge>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </td>
                          <td className="score-cell text-center align-middle">
                            {match.status === "Completed" ? (
                              <div className={`score ${"live-score"}`}>
                                <span className="home-score">
                                  {match.teamAScore}
                                </span>
                                {match.teamAWickets !== undefined && (
                                  <span className="wickets-info">
                                    /{match.teamAWickets}
                                  </span>
                                )}
                                <span className="score-separator">-</span>
                                <span className="away-score">
                                  {match.teamBScore}
                                </span>
                                {match.teamBWickets !== undefined && (
                                  <span className="wickets-info">
                                    /{match.teamBWickets}
                                  </span>
                                )}
                                {match.winnerTeam === "Draw" && (
                                  <Badge
                                    bg="info"
                                    className="draw-badge mx-auto"
                                  >
                                    Draw
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="vs-text">VS</span>
                            )}
                          </td>
                          <td className="team-cell">
                            <td className="team-cell">
                              <div className="team-info">
                                <div className="team-logo-section">
                                  {match.teamALogoUrl ? (
                                    <div className="team-logo-container">
                                      <Image
                                        src={match.teamBLogoUrl}
                                        alt={`${match.teamB} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder">
                                      {match.teamA.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="team-details">
                                  <div className="d-flex flex-column">
                                    <span className="team-name">
                                      {match.teamB}
                                    </span>

                                    {match.winnerTeam === match.teamB && (
                                      <>
                                        <Badge
                                          bg="warning"
                                          className="winner-badge ms-1"
                                        >
                                          Winner
                                        </Badge>
                                        {match.manOfTheMatch && (
                                          <Badge
                                            bg="primary"
                                            className="primary-badge mt-1 text-light"
                                          >
                                            <i className="fas fa-trophy me-1 mr-1"></i>
                                            {match.manOfTheMatch}
                                          </Badge>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </td>
                          <td className="align-middle">
                            <div className="match-date">
                              {formatMatchDate(match.matchDate)}
                            </div>
                            <div className="match-time">
                              {match.matchTime} - {match.venue}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          )}
        </Container>
      </div>

      <style jsx global>{`
        // Add to your style jsx global block
        .team-logo-section {
          position: relative;
          margin-right: 12px;
        }

        .motm-badge-small {
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 12px;
          background: #fff8e1;
          border: 1px solid #ffc107;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          margin-top: 4px;
          width: fit-content;
        }

        .motm-badge-small i {
          font-size: 0.7rem;
          color: #ffc107;
        }

        .motm-badge-small span {
          font-weight: 600;
          color: #664d03;
        }

        .team-details {
          display: flex;
          align-items: flex-start;
          flex-grow: 1;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .motm-badge-small {
            font-size: 0.6rem;
            padding: 1px 4px;
          }

          .motm-badge-small i {
            font-size: 0.65rem;
          }
        }
        .score {
          font-weight: bold;
          font-size: 1rem; /* Reduced from 1.2rem */
          color: #333;
          padding: 6px 12px; /* Slightly reduced padding */
          border-radius: 10px;
          display: inline-block;
          background-color: #f8f9fa;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .live-score {
          color: #fff !important;
          font-size: 1.1rem !important; /* Reduced from 1.3rem */
          font-weight: 700 !important;
          background: linear-gradient(90deg, #1e90ff, #4169e1);
          box-shadow: 0 5px 15px rgba(30, 144, 255, 0.3);
          padding: 6px 12px;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .wickets-info {
          font-size: 0.85rem; /* Added smaller font for wickets */
        }

        .score-separator {
          margin: 0 6px;
          color: inherit;
          opacity: 0.8;
          font-size: 0.9rem; /* Added smaller font for separator */
        }

        .vs-text {
          font-weight: bold;
          font-size: 1rem; /* Reduced from 1.2rem */
          color: #aaa;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: linear-gradient(90deg, #ccc, #999);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (max-width: 768px) {
          .score {
            font-size: 0.9rem; /* Reduced from 1rem */
            padding: 5px 10px;
          }

          .live-score {
            font-size: 1rem !important; /* Reduced from 1.1rem */
            padding: 5px 10px;
          }

          .wickets-info {
            font-size: 0.75rem;
          }

          .vs-text {
            font-size: 0.9rem;
          }
        }

        .motm-badge {
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 4px;
          background-color: #f8f9fa;
          display: block; /* Changed from inline-block */
          margin-top: 4px;
          border: 1px dashed #ffc107;
          width: 100%; /* Added to make it full width */
        }

        .motm-badge i {
          color: #ffc107;
        }

        .motm-badge small {
          font-weight: 500;
          white-space: nowrap;
          display: block; /* Added to ensure text wraps properly */
          overflow: hidden;
          text-overflow: ellipsis; /* Added to handle long names */
        }

        .match-schedule-page {
          padding-top: 100px;
          padding-bottom: 50px;
          min-height: 100vh;
          background-color: #f8f9fa;
          background-image: linear-gradient(to bottom right, #f9f9f9, #f1f1f1);
        }

        .page-header {
          margin-bottom: 2.5rem;
          text-align: left;
        }

        .page-title {
          font-weight: 800;
          color: #111;
          margin-bottom: 10px;
          position: relative;
          display: inline-block;
          font-size: 2.5rem;
          letter-spacing: -0.5px;
        }

        .page-title:after {
          content: "";
          display: block;
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, #ff5722, #ff9800);
          margin: 10px 0 0;
          border-radius: 4px;
        }

        .match-table {
          border-collapse: separate;
          border-spacing: 0 10px;
          margin-bottom: 30px;
          background-color: transparent;
          width: 100%;
        }

        .match-table thead th {
          background-color: transparent;
          border: none;
          padding: 15px;
          font-weight: 600;
          color: #555;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .match-table tbody tr {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          margin-bottom: 15px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          background-color: #fff;
          overflow: hidden;
        }

        .match-table tbody tr:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .match-table tbody tr td {
          padding: 20px 15px;
          border: none;
          font-size: 0.85rem;
          position: relative;
        }

        .match-table tbody tr td:first-child {
          border-top-left-radius: 16px;
          border-bottom-left-radius: 16px;
        }

        .match-table tbody tr td:last-child {
          border-top-right-radius: 16px;
          border-bottom-right-radius: 16px;
        }

        .team-cell {
          min-width: 180px;
        }

        .team-info {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
        }

        .team-logo-container {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
          border: 2px solid #eaeaea;
          background: white;
          transition: all 0.3s ease;
        }

        .team-info:hover .team-logo-container {
          transform: scale(1.1);
          border-color: #1e90ff;
        }

        .team-logo {
          object-fit: contain;
          max-width: 100%;
          max-height: 100%;
          border-radius: 0;
          border: none;
          box-shadow: none;
        }

        .team-logo-placeholder {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-weight: bold;
          font-size: 1.2rem;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
          border: 2px solid #eaeaea;
          transition: all 0.3s ease;
        }

        .team-info:hover .team-logo-placeholder {
          transform: scale(1.1);
          border-color: #1e90ff;
          background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
        }

        .team-name {
          font-weight: 600;
          flex-grow: 1;
          font-size: 1.1rem;
          color: #333;
          transition: color 0.3s ease;
        }

        .team-info:hover .team-name {
          color: #ff5722;
        }

        .score-cell {
          min-width: 120px;
          position: relative;
        }

        .score {
          font-weight: bold;
          font-size: 1rem;
          color: #333;
          padding: 6px 12px;
          border-radius: 10px;
          display: inline-block;
          background-color: #f8f9fa;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .score:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 12px rgba(0, 0, 0, 0.1);
        }

        .live-score {
          color: #fff !important;
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          background: linear-gradient(90deg, #1e90ff, #4169e1);
          box-shadow: 0 5px 15px rgba(30, 144, 255, 0.3);
          padding: 6px 12px;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .wickets-info {
          font-size: 0.85rem;
        }

        .score-separator {
          margin: 0 6px;
          color: inherit;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .vs-text {
          font-weight: bold;
          font-size: 1rem;
          color: #aaa;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: linear-gradient(90deg, #ccc, #999);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .match-date {
          font-weight: 600;
          color: #555;
          margin-bottom: 4px;
        }

        .match-time {
          color: #888;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .winner-badge {
          font-size: 0.7rem;
          padding: 0.35em 0.65em;
          margin-left: 8px;
          background: linear-gradient(135deg, #ffc107, #ff9800);
          border: none;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: 30px;
          box-shadow: 0 2px 5px rgba(255, 152, 0, 0.3);
          animation: winnerGlow 2s infinite;
        }

        @keyframes winnerGlow {
          0% {
            box-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
          }
          50% {
            box-shadow: 0 0 10px rgba(255, 193, 7, 0.8);
          }
          100% {
            box-shadow: 0 0 5px rgba(255, 193, 7, 0.5);
          }
        }

        .nav-tabs .nav-link {
          color: #555;
          border: none;
          border-bottom: 3px solid transparent;
          font-weight: 600;
          padding: 12px 18px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .nav-tabs .nav-link.active {
          color: #ff5722;
          background-color: transparent;
          border-bottom: 3px solid #ff5722;
        }

        .nav-tabs .nav-link:hover:not(.active) {
          border-color: transparent;
          color: #ff5722;
          background-color: rgba(255, 87, 34, 0.05);
        }

        @media (max-width: 992px) {
          .team-name {
            font-size: 1rem;
          }

          .match-table thead th,
          .match-table tbody td {
            padding: 15px 10px;
          }

          .page-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .team-logo-container,
          .team-logo-placeholder {
            width: 40px;
            height: 40px;
            margin-right: 8px;
          }

          .team-name {
            font-size: 0.9rem;
          }

          .score {
            font-size: 0.9rem;
            padding: 5px 10px;
          }

          .live-score {
            font-size: 1rem !important;
            padding: 5px 10px;
          }

          .wickets-info {
            font-size: 0.75rem;
          }

          .vs-text {
            font-size: 0.9rem;
          }

          .match-date,
          .match-time {
            font-size: 0.85rem;
          }

          .page-title {
            font-size: 1.75rem;
          }

          .match-table {
            border-spacing: 0 8px;
          }

          .match-table tbody tr td {
            padding: 15px 10px;
          }
        }

        .live-match-highlight {
          position: relative;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 1),
            rgba(255, 244, 242, 1)
          );
          box-shadow: 0 5px 15px rgba(255, 87, 34, 0.15);
          animation: livePulse 2s infinite;
          border-left: 4px solid #1e90ff;
          z-index: 1;
        }

        @keyframes livePulse {
          0% {
            box-shadow: 0 5px 15px rgba(30, 144, 255, 0.2);
          }
          50% {
            box-shadow: 0 5px 25px rgba(30, 144, 255, 0.4);
          }
          100% {
            box-shadow: 0 5px 15px rgba(30, 144, 255, 0.2);
          }
        }

        .refresh-button {
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          border-radius: 30px;
          padding: 8px 20px;
          border: 2px solid #ddd;
          font-weight: 600;
          background: white;
        }

        .refresh-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          border-color: rgb(255, 255, 255);
          color: rgb(0, 0, 0);
        }

        .refresh-button:active {
          transform: scale(0.98);
        }

        .auto-refresh-controls {
          background-color: white;
          border-radius: 30px;
          padding: 8px 18px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          border: 2px solid #eee;
        }

        .auto-refresh-controls .form-check-input:checked {
          background-color: #ff5722;
          border-color: #ff5722;
        }

        .auto-refresh-controls .form-check-label {
          font-weight: 600;
          color: #555;
        }

        .badge {
          font-weight: 500;
          padding: 0.35em 0.65em;
          border-radius: 30px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
}

export default SchedulePage;
