import { useState, useEffect } from "react";
import { Container, Row, Col, Badge, Tabs, Tab, Table } from "react-bootstrap";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";
import Image from "next/image";

export function SchedulePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

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

  // Sort matches by date and time
  const sortedMatches = [...matches].sort((a, b) => {
    // Parse dates
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
            <h1 className="page-title">Match Schedule</h1>
            <p className="text-muted">
              Follow all Cricket matches of Chennai Khatri Sports Club
            </p>
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
                        <th className="text-center">Match Type</th>
                        <th className="text-center">Home Team</th>
                        <th className="text-center">Score</th>
                        <th className="text-center">Away Team</th>
                        <th>Date & Time</th>
                        <th>Venue</th>
                        <th className="text-center">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMatches.map((match) => (
                        <tr
                          key={match.id}
                          className={`match-row ${match.status.toLowerCase()}-match`}
                        >
                          <td className="text-center align-middle">
                            {getStatusBadge(match.status)}
                          </td>
                          <td className="text-center align-middle">
                            {match.matchType}
                          </td>
                          <td className="team-cell">
                            <div className="team-info">
                              {match.homeTeamLogoUrl ? (
                                <div className="team-logo-container">
                                  <Image
                                    src={match.homeTeamLogoUrl}
                                    alt={`${match.homeTeam} logo`}
                                    width={40}
                                    height={40}
                                    className="team-logo"
                                  />
                                </div>
                              ) : (
                                <div className="team-logo-placeholder">
                                  {match.homeTeam.charAt(0)}
                                </div>
                              )}
                              <span className="team-name">
                                {match.homeTeam}
                              </span>
                              {match.winnerTeam === match.homeTeam && (
                                <Badge bg="warning" className="winner-badge">
                                  Winner
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="score-cell text-center align-middle">
                            {match.status === "Live" ||
                            match.status === "Completed" ? (
                              <div className="score">
                                <span className="home-score">
                                  {match.homeTeamScore}
                                </span>
                                <span className="score-separator">-</span>
                                <span className="away-score">
                                  {match.awayTeamScore}
                                </span>
                              </div>
                            ) : (
                              <span className="vs-text">VS</span>
                            )}
                          </td>
                          <td className="team-cell">
                            <div className="team-info">
                              {match.awayTeamLogoUrl ? (
                                <div className="team-logo-container">
                                  <Image
                                    src={match.awayTeamLogoUrl}
                                    alt={`${match.awayTeam} logo`}
                                    width={40}
                                    height={40}
                                    className="team-logo"
                                  />
                                </div>
                              ) : (
                                <div className="team-logo-placeholder">
                                  {match.awayTeam.charAt(0)}
                                </div>
                              )}
                              <span className="team-name">
                                {match.awayTeam}
                              </span>
                              {match.winnerTeam === match.awayTeam && (
                                <Badge bg="warning" className="winner-badge">
                                  Winner
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="match-date">
                              {formatMatchDate(match.matchDate)}
                            </div>
                            <div className="match-time">{match.matchTime}</div>
                          </td>
                          <td className="align-middle">{match.venue}</td>
                          <td className="text-center align-middle">
                            {match.status === "Completed" &&
                              match.winnerTeam === "Draw" && (
                                <Badge bg="info">Draw</Badge>
                              )}
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
        .match-schedule-page {
          padding-top: 100px;
          padding-bottom: 50px;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .page-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .page-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          position: relative;
          display: inline-block;
        }

        .page-title:after {
          content: "";
          display: block;
          width: 50%;
          height: 3px;
          background: #ff5722;
          margin: 10px auto 0;
        }

        .match-table {
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 30px;
          background-color: #fff;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          overflow: hidden;
        }

        .match-table thead th {
          background-color: #f8f9fa;
          border-bottom: 2px solid #eaeaea;
          padding: 12px;
          font-weight: 600;
          color: #495057;
        }

        .match-table tbody tr {
          transition: all 0.2s ease;
        }

        .match-table tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .match-table tbody tr td {
          padding: 15px 12px;
          border-bottom: 1px solid #eee;
        }

        .team-cell {
          min-width: 170px;
        }

        .team-info {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
        }

        .team-logo-container {
          width: 40px;
          height: 40px;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .team-logo {
          border-radius: 50%;
          border: 2px solid #eee;
          object-fit: cover;
        }

        .team-logo-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f0f0f0;
          color: #666;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .team-name {
          font-weight: 500;
          flex-grow: 1;
        }

        .score-cell {
          min-width: 80px;
        }

        .score {
          font-weight: bold;
          font-size: 1.1rem;
          color: #212529;
        }

        .score-separator {
          margin: 0 5px;
          color: #6c757d;
        }

        .vs-text {
          font-weight: bold;
          color: #6c757d;
        }

        .match-date {
          font-weight: 500;
        }

        .match-time {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .winner-badge {
          font-size: 0.7rem;
          padding: 0.25em 0.6em;
          margin-left: 5px;
        }

        .nav-tabs .nav-link {
          color: #495057;
          border: none;
          border-bottom: 3px solid transparent;
          font-weight: 500;
          padding: 10px 15px;
        }

        .nav-tabs .nav-link.active {
          color: #ff5722;
          background-color: transparent;
          border-bottom: 3px solid #ff5722;
        }

        .nav-tabs .nav-link:hover:not(.active) {
          border-color: transparent;
          color: #ff5722;
        }

        @media (max-width: 992px) {
          .team-name {
            font-size: 0.9rem;
          }

          .match-table thead th,
          .match-table tbody td {
            padding: 10px 8px;
          }
        }

        @media (max-width: 768px) {
          .team-logo-container,
          .team-logo-placeholder {
            width: 30px;
            height: 30px;
            margin-right: 5px;
          }

          .team-name {
            font-size: 0.8rem;
          }

          .score {
            font-size: 0.9rem;
          }

          .match-date,
          .match-time {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}

export default SchedulePage;
