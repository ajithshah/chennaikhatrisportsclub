import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Badge,
  Modal,
  Table,
} from "react-bootstrap";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import Image from "next/image";

export default function MatchSchedule() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    teamA: "",
    teamB: "",
    matchDate: "",
    matchTime: "",
    venue: "",
    matchType: "League Match",
    status: "Upcoming",
    teamAScore: "",
    teamBScore: "",
    teamAWickets: "",
    teamBWickets: "",
    winnerTeam: "",
    manOfTheMatch: "",
  });

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersSnapshot = await getDocs(collection(db, "cricket_teams"));
        const playersList = [];

        // Extract players from each team
        playersSnapshot.docs.forEach((doc) => {
          const teamData = doc.data();
          const teamName = teamData.name;

          // Add each player from the team's players array
          if (teamData.players && Array.isArray(teamData.players)) {
            teamData.players.forEach((player) => {
              playersList.push({
                id: `${doc.id}_${player.userId || player.name}`, // Unique ID
                name: player.name,
                teamName: teamName, // Changed from team to teamName to match filter
                teamId: doc.id,
                role: player.role || "",
                jerseyNumber: player.jerseyNumber || "",
              });
            });
          }
        });

        console.log("Fetched players:", playersList); // Debug log
        setPlayers(playersList);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, []);

  // Listen for status changes to show/hide winner selection
  useEffect(() => {
    // If status changes to something other than Completed, clear the winner and man of the match
    if (
      formData.status !== "Completed" &&
      (formData.winnerTeam || formData.manOfTheMatch)
    ) {
      setFormData({
        ...formData,
        winnerTeam: "",
        manOfTheMatch: "",
      });
    }
  }, [formData.status]);

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

  const fetchTeams = async () => {
    try {
      const teamsCollection = collection(db, "cricket_teams");
      const teamsSnapshot = await getDocs(teamsCollection);
      const teamsList = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        teamLogoUrl: doc.data().teamLogoUrl || "",
      }));
      setTeams(teamsList);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : parseInt(value, 10);

    setFormData({
      ...formData,
      [name]: numValue,
    });
  };

  const handleAddMatch = async (e) => {
    e.preventDefault();

    // Check if Team And Team Bs are the same
    if (formData.teamA === formData.teamB) {
      alert("Team A and Team B cannot be the same");
      return;
    }

    try {
      // Find the selected teams' logo URLs
      const teamAData = teams.find((team) => team.name === formData.teamA);
      const teamBData = teams.find((team) => team.name === formData.teamB);

      const matchData = {
        ...formData,
        createdAt: new Date(),
        teamAScore: parseInt(formData.teamAScore),
        teamBScore: parseInt(formData.teamBScore),
        teamAWickets: parseInt(formData.teamAWickets) || 0,
        teamBWickets: parseInt(formData.teamBWickets) || 0,
        isLive: formData.status === "Live",
        teamALogoUrl: teamAData?.teamLogoUrl || "",
        teamBLogoUrl: teamBData?.teamLogoUrl || "",
      };

      await addDoc(collection(db, "matches"), matchData);
      setShowAddModal(false);
      resetForm();
      fetchMatches();
    } catch (error) {
      console.error("Error adding match:", error);
    }
  };

  const handleEditMatch = async (e) => {
    e.preventDefault();
    try {
      // Find the selected teams' logo URLs
      const teamAData = teams.find((team) => team.name === formData.teamA);
      const teamBData = teams.find((team) => team.name === formData.teamB);

      const matchRef = doc(db, "matches", currentMatch.id);
      const updatedData = {
        ...formData,
        teamAScore: parseInt(formData.teamAScore),
        teamBScore: parseInt(formData.teamBScore),
        teamAWickets: parseInt(formData.teamAWickets) || 0,
        teamBWickets: parseInt(formData.teamBWickets) || 0,
        isLive: formData.status === "Live",
        teamALogoUrl: teamAData?.teamLogoUrl || "",
        teamBLogoUrl: teamBData?.teamLogoUrl || "",
      };

      await updateDoc(matchRef, updatedData);
      setShowEditModal(false);
      resetForm();
      fetchMatches();
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      try {
        await deleteDoc(doc(db, "matches", matchId));
        fetchMatches();
      } catch (error) {
        console.error("Error deleting match:", error);
      }
    }
  };

  const openEditModal = (match) => {
    setCurrentMatch(match);
    setFormData({
      teamA: match.teamA,
      teamB: match.teamB,
      matchDate: match.matchDate,
      matchTime: match.matchTime,
      venue: match.venue,
      matchType: match.matchType,
      status: match.status,
      teamAScore: match.teamAScore,
      teamBScore: match.teamBScore,
      teamAWickets: match.teamAWickets || "",
      teamBWickets: match.teamBWickets || "",
      winnerTeam: match.winnerTeam || "",
      manOfTheMatch: match.manOfTheMatch || "",
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      teamA: "",
      teamB: "",
      matchDate: "",
      matchTime: "",
      venue: "",
      matchType: "League Match",
      status: "Scheduled",
      teamAScore: "",
      teamBScore: "",
      teamAWickets: "",
      teamBWickets: "",
      winnerTeam: "",
      manOfTheMatch: "",
    });
    setCurrentMatch(null);
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

  // Format match time to readable format
  const formatMatchTime = (timeString) => {
    if (!timeString) return "TBD";

    try {
      // Parse the time string (expected format: HH:MM or H:MM)
      const [hours, minutes] = timeString
        .split(":")
        .map((num) => parseInt(num, 10));

      // Create a date object with today's date and the given time
      const date = new Date();
      date.setHours(hours, minutes, 0);

      // Format the time in 12-hour format
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString; // Return original time string if parsing fails
    }
  };

  // Sort matches by status priority and date
  const sortedMatches = [...matches].sort((a, b) => {
    // Define status priority order (case-insensitive)
    const statusPriority = {
      live: 1,
      upcoming: 2,
      scheduled: 3,
      completed: 4,
      postponed: 5,
      cancelled: 6,
    };

    // Get status in lowercase for case-insensitive comparison
    const statusA = (a.status || "").toLowerCase();
    const statusB = (b.status || "").toLowerCase();

    // First sort by status priority
    const priorityA = statusPriority[statusA] || 999; // Default high number for unknown status
    const priorityB = statusPriority[statusB] || 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If status is the same, sort by date and time
    let dateA, dateB;
    try {
      dateA = new Date(a.matchDate + "T" + (a.matchTime || "00:00"));
      dateB = new Date(b.matchDate + "T" + (b.matchTime || "00:00"));
    } catch (e) {
      // Handle invalid dates
      return 0;
    }

    // For upcoming/scheduled matches, sort chronologically (earlier first)
    if (["live", "upcoming", "scheduled"].includes(statusA)) {
      return dateA - dateB;
    }

    // For completed/postponed/cancelled matches, sort reverse chronologically (recent first)
    return dateB - dateA;
  });

  const printMatchSchedule = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Match Schedule - Chennai Khatri Sports Club</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .print-container {
            max-width: 1000px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #0d6efd;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #0d6efd;
          }
          .subtitle {
            color: #666;
            font-style: italic;
            margin-bottom: 15px;
          }
          .match-count {
            background-color: #198754;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin-top: 10px;
          }
          .matches-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .matches-table th, 
          .matches-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .matches-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
            border-top: 1px solid #ddd;
            border-bottom: 2px solid #0d6efd;
          }
          .matches-table tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .matches-table tr:hover {
            background-color: #f0f7ff;
          }
          .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
          }
          .status-upcoming {
            border: 1px solid #0d6efd;
            color: #0d6efd;
            background-color: #f0f7ff;
          }
          .status-live {
            border: 1px solid #dc3545;
            color: #dc3545;
            background-color: #fff5f6;
          }
          .status-completed {
            border: 1px solid #198754;
            color: #198754;
            background-color: #f0fff4;
          }
          .status-postponed {
            border: 1px solid #ffc107;
            color: #ffc107;
            background-color: #fffcf0;
          }
          .status-cancelled {
            border: 1px solid #6c757d;
            color: #6c757d;
            background-color: #f8f9fa;
          }
          .team-container {
            display: flex;
            align-items: center;
          }
          .team-logo-placeholder {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
            font-weight: bold;
            color: #666;
            border: 1px solid #ddd;
          }
          .team-logo {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            margin-right: 8px;
            object-fit: cover;
            border: 1px solid #0d6efd;
          }
          .score {
            font-weight: bold;
            text-align: center;
            font-size: 16px;
          }
          .vs-text {
            font-weight: bold;
            text-align: center;
            color: #6c757d;
          }
          .winner-badge {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            color: #ffc107;
            border: 1px solid #ffc107;
            margin-left: 5px;
            background-color: #fffcf0;
          }
          .draw-badge {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            color: #0dcaf0;
            border: 1px solid #0dcaf0;
            margin-top: 5px;
            background-color: #f0fcff;
          }
          .date-time-container {
            display: flex;
            flex-direction: column;
          }
          .date {
            font-weight: bold;
            margin-bottom: 3px;
          }
          .time {
            color: #6c757d;
            font-size: 12px;
          }
          .venue {
            font-size: 13px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .print-button {
            text-align: center;
            margin-top: 20px;
          }

          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1 class="title">Match Schedule</h1>
            <p class="subtitle">Chennai Khatri Sports Club</p>
            <p class="subtitle">KPL Season 3</p>
          </div>
          
          <table class="matches-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Team A</th>
                <th></th>
                <th>Team B</th>
                <th>Date, Time & Venue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${sortedMatches

                .map(
                  (match) => `
                <tr>
                  <td>${match.matchType}</td>
                  <td>
                    <div class="team-container">
                      ${
                        match.teamALogoUrl
                          ? `<img src="${match.teamALogoUrl}" class="team-logo" alt="${match.teamA} logo">`
                          : `<div class="team-logo-placeholder">${match.teamA.charAt(
                              0
                            )}</div>`
                      }
                      <span>${match.teamA}</span>
                      ${
                        match.winnerTeam === match.teamA
                          ? '<span class="winner-badge">Winner</span>'
                          : ""
                      }
                    </div>
                  </td>
                  <td style="text-align: center">
                    VS
                  </td>
                  <td>
                    <div class="team-container">
                      ${
                        match.teamBLogoUrl
                          ? `<img src="${match.teamBLogoUrl}" class="team-logo" alt="${match.teamB} logo">`
                          : `<div class="team-logo-placeholder">${match.teamB.charAt(
                              0
                            )}</div>`
                      }
                      <span>${match.teamB}</span>
                      ${
                        match.winnerTeam === match.teamB
                          ? '<span class="winner-badge">Winner</span>'
                          : ""
                      }
                    </div>
                  </td>
                  <td>
                    <div class="date-time-container">
                      <span class="date">${formatMatchDate(
                        match.matchDate
                      )}</span>
                      <span class="time">${match.matchTime} - ${
                    match.venue
                  }</span>
                    </div>
                  </td>
                  <td></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>*** Chennai Khatri Sports Club ***</p>
            <p>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>

        </div>
        <script>
          // Automatically open print dialog when the page loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Container className="md-6 match-schedule-page">
      <Row className="mb-4">
        <Col className="page-header">
          <h2 className="page-title">Match Schedule Management</h2>
          <p className="text-muted">
            Create and manage cricket match schedules
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="add-match-btn mr-1"
          >
            <i className="fas fa-plus me-2"></i>
          </Button>
          <Button
            variant="outline-primary"
            className="ms-2 d-inline-flex align-items-center"
            onClick={printMatchSchedule}
            style={{
              borderRadius: "50px",
              marginLeft: "0.5rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              fontWeight: "600",
            }}
          >
            <i className="fas fa-print me-1 mr-1"></i>Print
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden"></span>
          </div>
        </div>
      ) : (
        <>
          {matches.length === 0 ? (
            <div className="text-center my-5">
              <p>No matches scheduled yet. Add your first match!</p>
              <Button
                variant="outline-primary"
                onClick={() => setShowAddModal(true)}
              >
                Add Match
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="match-table">
                <thead>
                  <tr>
                    <th className="text-center">Status</th>
                    <th className="text-center">Type</th>
                    <th>Team A</th>
                    <th className="text-center">Score/Match</th>
                    <th>Team B</th>
                    <th>Date, Time & Venue</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMatches.map((match) => (
                    <tr
                      key={match.id}
                      className={`match-row ${match.status.toLowerCase()}-match ${
                        match.status.toLowerCase() === "live"
                          ? "live-match-highlight"
                          : ""
                      }`}
                    >
                      <td className="text-center align-middle">
                        {getStatusBadge(match.status)}
                      </td>
                      <td className="text-center align-middle">
                        {match.matchType}
                      </td>
                      <td className="team-cell align-middle">
                        <div className="team-info">
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
                          <span className="team-name">{match.teamA}</span>
                          {match.winnerTeam === match.teamA && (
                            <div className="d-flex flex-column">
                              <div className="d-flex align-items-center">
                                <Badge
                                  bg="warning"
                                  className="winner-badge ms-1"
                                >
                                  Winner
                                </Badge>
                              </div>
                              {match.manOfTheMatch && (
                                <div className="motm-badge mt-1">
                                  <small>
                                    <i className="fas fa-trophy me-1 mr-1"></i>
                                    {match.manOfTheMatch}
                                  </small>
                                </div>
                              )} 
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="score-cell text-center align-middle">
                        {match.status === "Live" ||
                        match.status === "Completed" ? (
                          <div
                            className={`score ${
                              match.status === "Live" ? "live-score" : ""
                            }`}
                          >
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
                              <Badge bg="info" className="draw-badge mx-auto">
                                Draw
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="vs-text">VS</span>
                        )}
                      </td>
                      <td className="team-cell align-middle">
                        <div className="team-info">
                          {match.teamBLogoUrl ? (
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
                              {match.teamB.charAt(0)}
                            </div>
                          )}
                          <span className="team-name">{match.teamB}</span>
                          {match.winnerTeam === match.teamB && (
                            <div className="d-flex flex-column">
                              <div className="d-flex align-items-center">
                                <Badge
                                  bg="warning"
                                  className="winner-badge ms-1"
                                >
                                  Winner
                                </Badge>
                              </div>
                              {match.manOfTheMatch && (
                                <div className="motm-badge mt-1">
                                  <small className="text-muted">
                                    <i className="fas fa-trophy me-1"></i>
                                    MoM: {match.manOfTheMatch}
                                  </small>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="match-date">
                          {formatMatchDate(match.matchDate)}
                        </div>
                        <div className="match-time">
                          <i className="bi bi-clock me-1"></i>
                          {formatMatchTime(match.matchTime)} - {match.venue}
                        </div>
                      </td>

                      <td className="text-center align-middle">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="outline-primary"
                            onClick={() => openEditModal(match)}
                            className="edit-btn mr-1"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDeleteMatch(match.id)}
                          >
                            Delete
                          </Button>
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

      {/* Add Match Modal */}
      <Modal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          resetForm();
        }}
        centered
        className="match-modal"
      >
        <Modal.Header className="modal-header">
          <Modal.Title>Add New Match</Modal.Title>
          <Button
            variant="link"
            className="modal-close-btn"
            onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            Close
          </Button>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handleAddMatch}>
            <Form.Group className="mb-3">
              <Form.Label>Team A</Form.Label>
              <div className="team-select-container">
                <Form.Select
                  name="teamA"
                  value={formData.teamA}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
                >
                  <option value="">Select Team A</option>
                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.name}
                      disabled={team.name === formData.teamB}
                    >
                      {team.name}{" "}
                      {team.name === formData.teamB
                        ? "(Already selected as Team B)"
                        : ""}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Team B</Form.Label>
              <div className="team-select-container">
                <Form.Select
                  name="teamB"
                  value={formData.teamB}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
                >
                  <option value="">Select Team B</option>
                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.name}
                      disabled={team.name === formData.teamA}
                    >
                      {team.name}{" "}
                      {team.name === formData.teamA
                        ? "(Already selected as Team A)"
                        : ""}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Match Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="matchDate"
                    value={formData.matchDate}
                    onChange={handleInputChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Match Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="matchTime"
                    value={formData.matchTime}
                    onChange={handleInputChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Venue</Form.Label>
              <Form.Select
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                required
                className="form-select-custom"
              >
                <option value="">Select Venue</option>
                <option value="Pachyappas Ground B">Pachyappas Ground B</option>
                <option value="Pachyappas Ground C">Pachyappas Ground C</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="matchType"
                    value={formData.matchType}
                    onChange={handleInputChange}
                    required
                    className="form-select-custom"
                  >
                    <option value="League Match">League Match</option>
                    <option value="Knockout">Knockout</option>
                    <option value="Quarter Final">Quarter Final</option>
                    <option value="Semi Final">Semi Final</option>
                    <option value="Final">Final</option>
                    <option value="Friendly">Friendly</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="form-select-custom"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {(formData.status === "Live" ||
              formData.status === "Completed") && (
              <Row className="mb-3 score-section">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Team A Score</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="teamAScore"
                      value={formData.teamAScore}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Team A Wickets</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="10"
                      name="teamAWickets"
                      value={formData.teamAWickets}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label>Team B Score</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="teamBScore"
                      value={formData.teamBScore}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label>Team B Wickets</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="10"
                      name="teamBWickets"
                      value={formData.teamBWickets}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {formData.status === "Completed" && (
              <>
                <Form.Group className="mb-3 winner-section">
                  <Form.Label>Winner Team</Form.Label>
                  <Form.Select
                    name="winnerTeam"
                    value={formData.winnerTeam}
                    onChange={handleInputChange}
                    required={formData.status === "Completed"}
                    className="form-select-custom winner-select"
                  >
                    <option value="">Select Winner</option>
                    {formData.teamA && (
                      <option value={formData.teamA}>{formData.teamA}</option>
                    )}
                    {formData.teamB && (
                      <option value={formData.teamB}>{formData.teamB}</option>
                    )}
                    <option value="Draw">Match Drawn</option>
                  </Form.Select>
                </Form.Group>

                {formData.winnerTeam && formData.winnerTeam !== "Draw" && (
                  <Form.Group className="mb-3 man-of-match-section">
                    <Form.Label>Man of the Match</Form.Label>
                    <Form.Select
                      name="manOfTheMatch"
                      value={formData.manOfTheMatch}
                      onChange={handleInputChange}
                      required
                      className="form-select-custom"
                    >
                      <option value="">Select Man of the Match</option>
                      {players
                        .filter(
                          (player) => formData.winnerTeam === player.teamName
                        ) // Using teamName instead of team
                        .map((player) => (
                          <option key={player.id} value={player.name}>
                            {player.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                )}
              </>
            )}

            <div className="d-grid mt-4">
              <Button variant="primary" type="submit" className="submit-btn">
                Add Match
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Match Modal */}
      <Modal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          resetForm();
        }}
        centered
        className="match-modal"
      >
        <Modal.Header className="modal-header">
          <Modal.Title>Edit Match</Modal.Title>
          <Button
            variant="link"
            className="modal-close-btn"
            onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handleEditMatch}>
            <Form.Group className="mb-3">
              <Form.Label>Team A</Form.Label>
              <div className="team-select-container">
                <Form.Select
                  name="teamA"
                  value={formData.teamA}
                  onChange={handleInputChange}
                  required
                  disabled={currentMatch?.teamA}
                  className="form-select-custom"
                >
                  <option value="">Select Team A</option>
                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.name}
                      disabled={team.name === formData.teamB}
                    >
                      {team.name}{" "}
                      {team.name === formData.teamB
                        ? "(Already selected as Team B)"
                        : ""}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Team B</Form.Label>
              <div className="team-select-container">
                <Form.Select
                  name="teamB"
                  value={formData.teamB}
                  onChange={handleInputChange}
                  required
                  disabled={currentMatch?.teamB}
                  className="form-select-custom"
                >
                  <option value="">Select Team B</option>
                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.name}
                      disabled={team.name === formData.teamA}
                    >
                      {team.name}{" "}
                      {team.name === formData.teamA
                        ? "(Already selected as Team A)"
                        : ""}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Match Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="matchDate"
                    value={formData.matchDate}
                    onChange={handleInputChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Match Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="matchTime"
                    value={formData.matchTime}
                    onChange={handleInputChange}
                    required
                    className="form-control-custom"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Venue</Form.Label>
              <Form.Select
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                required
                className="form-select-custom"
              >
                <option value="">Select Venue</option>
                <option value="Pachyappas Ground B">Pachyappas Ground B</option>
                <option value="Pachyappas Ground C">Pachyappas Ground C</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="matchType"
                value={formData.matchType}
                onChange={handleInputChange}
                required
                className="form-select-custom"
              >
                <option value="League Match">League Match</option>
                <option value="Knockout">Knockout</option>
                <option value="Quarter Final">Quarter Final</option>
                <option value="Semi Final">Semi Final</option>
                <option value="Final">Final</option>
                <option value="Friendly">Friendly</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="form-select-custom"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Live">Live</option>
                <option value="Completed">Completed</option>
                <option value="Postponed">Postponed</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>

            {(formData.status === "Live" ||
              formData.status === "Completed") && (
              <Row className="mb-3 score-section">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Team A Score</Form.Label>
                    <Form.Control
                      type="number"
                      name="teamAScore"
                      value={formData.teamAScore}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Team A Wickets</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="10"
                      name="teamAWickets"
                      value={formData.teamAWickets}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label>Team B Score</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="teamBScore"
                      value={formData.teamBScore}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mt-3">
                  <Form.Group>
                    <Form.Label>Team B Wickets</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      max="10"
                      name="teamBWickets"
                      value={formData.teamBWickets}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {formData.status === "Completed" && (
              <>
                <Form.Group className="mb-3 winner-section">
                  <Form.Label>Winner Team</Form.Label>
                  <Form.Select
                    name="winnerTeam"
                    value={formData.winnerTeam}
                    onChange={handleInputChange}
                    required={formData.status === "Completed"}
                    className="form-select-custom winner-select"
                  >
                    <option value="">Select Winner</option>
                    {formData.teamA && (
                      <option value={formData.teamA}>{formData.teamA}</option>
                    )}
                    {formData.teamB && (
                      <option value={formData.teamB}>{formData.teamB}</option>
                    )}
                    <option value="Draw">Match Drawn</option>
                  </Form.Select>
                </Form.Group>

                {formData.winnerTeam && formData.winnerTeam !== "Draw" && (
                  <Form.Group className="mb-3 man-of-match-section">
                    <Form.Label>Man of the Match</Form.Label>
                    <Form.Select
                      name="manOfTheMatch"
                      value={formData.manOfTheMatch}
                      onChange={handleInputChange}
                      required
                      className="form-select-custom"
                    >
                      <option value="">Select Man of the Match</option>
                      {players
                        .filter((player) => {
                          console.log(
                            "Comparing:",
                            player.teamName,
                            formData.winnerTeam
                          );
                          return formData.winnerTeam === player.teamName;
                        })
                        .map((player) => (
                          <option key={player.id} value={player.name}>
                            {player.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                )}
              </>
            )}

            <div className="d-grid mt-4">
              <Button variant="primary" type="submit" className="submit-btn">
                Update Match
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style jsx global>
        {`
          /* Core Match Card Styles */
          .match-schedule-page {
            padding-top: 20px;
            padding-bottom: 50px;
            min-height: 100vh;
            background-color: #f8f9fa;
            background-image: linear-gradient(
              to bottom right,
              #f9f9f9,
              #f1f1f1
            );
          }

          .page-header {
            margin-bottom: 2rem;
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
            min-width: 150px;
            position: relative;
          }

          .score {
            font-weight: bold;
            font-size: 1.2rem;
            color: #333;
            padding: 8px 16px;
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
            font-size: 1.3rem !important;
            font-weight: 700 !important;
            background: linear-gradient(90deg, #1e90ff, #4169e1);
            box-shadow: 0 5px 15px rgba(30, 144, 255, 0.3);
            padding: 8px 16px;
            border-radius: 10px;
            position: relative;
            overflow: hidden;
          }

          .score-separator {
            margin: 0 8px;
            color: inherit;
            opacity: 0.8;
          }

          .vs-text {
            font-weight: bold;
            font-size: 1.2rem;
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
          .motm-badge {
            font-size: 0.75rem;
            padding: 2px 6px;
            border-radius: 4px;
            background-color: #f8f9fa;
            display: inline-block;
            margin-top: 4px;
            border: 1px dashed #ffc107;
          }

          .motm-badge i {
            color: #ffc107;
          }

          .motm-badge small {
            font-weight: 500;
            white-space: nowrap;
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
            color: rgb(255, 255, 255);
          }

          .refresh-button:active {
            transform: scale(0.98);
          }

          .badge {
            font-weight: 500;
            padding: 0.35em 0.65em;
            border-radius: 30px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .draw-badge {
            display: inline-block;
            padding: 2px 5px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            color: #0dcaf0;
            border: 1px solid #0dcaf0;
            margin-top: 5px;
            background-color: #f0fcff;
          }

          /* Enhanced Modal Styling */
          .match-modal .modal-content {
            border-radius: 15px;
            border: none;
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
          }

          .match-modal .modal-header {
            background: linear-gradient(135deg, #1e90ff, #4169e1);
            color: white;
            padding: 20px 25px;
            border-bottom: none;
          }

          .match-modal .modal-body {
            padding: 25px;
            background-color: #f9fafc;
          }

          .match-modal .team-select-container {
            display: flex;
            align-items: center;
            background-color: white;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            padding-right: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
            transition: all 0.2s ease;
          }

          .match-modal .team-select-container:focus-within {
            border-color: #4169e1;
            box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.15);
          }

          .match-modal .form-select-custom {
            border: none;
            box-shadow: none;
            background-color: transparent;
            flex: 1;
            padding: 12px 15px;
            cursor: pointer;
          }

          .match-modal .form-select-custom:focus {
            outline: none;
            box-shadow: none;
          }

          .match-modal .form-select-custom option {
            padding: 10px;
            background-color: white;
            color: #333;
          }

          .match-modal .form-select-custom option:disabled {
            color: #999;
            font-style: italic;
            background-color: #f5f5f5;
          }

          .match-modal .modal-close-btn {
            color: white;
            padding: 0;
            opacity: 0.8;
            transition: all 0.2s ease;
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 1.2rem;
          }

          .match-modal .modal-close-btn:hover {
            opacity: 1;
            transform: scale(1.1);
          }

          .form-control-custom {
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            padding: 12px 15px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
            transition: all 0.2s ease;
          }

          .form-control-custom:focus {
            border-color: #4169e1;
            box-shadow: 0 0 0 3px rgba(65, 105, 225, 0.15);
            outline: none;
          }

          .score-input {
            font-weight: bold;
            font-size: 1.1rem;
            text-align: center;
          }

          .score-section {
            background-color: rgba(248, 249, 250, 0.5);
            border-radius: 10px;
            padding: 15px;
            margin-top: 5px;
            border: 1px dashed rgba(0, 0, 0, 0.1);
          }

          .winner-section {
            background-color: rgba(255, 243, 205, 0.5);
            border-radius: 10px;
            padding: 15px;
            margin-top: 5px;
            border: 1px dashed rgba(255, 193, 7, 0.3);
          }

          .man-of-match-section {
            background-color: rgba(248, 250, 255, 0.5);
            border-radius: 10px;
            padding: 15px;
            margin-top: 10px;
            border: 1px dashed rgba(75, 85, 99, 0.3);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
          }

          .man-of-match-section:hover {
            background-color: rgba(248, 250, 255, 0.8);
            border-color: rgba(59, 130, 246, 0.5);
          }

          .man-of-match-section .form-label {
            color: #374151;
            font-weight: 600;
            margin-bottom: 8px;
          }

          .submit-btn {
            padding: 12px;
            border-radius: 8px;
            font-weight: 500;
            letter-spacing: 0.5px;
            background: linear-gradient(135deg, #1e90ff, #4169e1);
            border: none;
            box-shadow: 0 4px 8px rgba(65, 105, 225, 0.2);
            transition: all 0.3s ease;
          }

          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(65, 105, 225, 0.3);
            background: linear-gradient(135deg, #4169e1, #1e90ff);
          }

          .submit-btn:active {
            transform: translateY(1px);
            box-shadow: 0 2px 4px rgba(65, 105, 225, 0.2);
          }

          /* Match Row Styling */
          .match-row {
            transition: all 0.2s ease;
          }

          .match-row:hover {
            background-color: #f8f9fa;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          }

          /* Status Badge Styling */
          .badge {
            font-weight: 500;
            padding: 0.35em 0.65em;
            border-radius: 30px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          /* Media queries for responsive design */
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
              font-size: 1rem;
              padding: 6px 12px;
            }

            .live-score {
              font-size: 1.1rem !important;
              padding: 6px 12px;
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

          /* Print-specific styles */
          @media print {
            body {
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .container {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            .d-print-none,
            .modal,
            .btn-primary,
            .btn-outline-danger {
              display: none !important;
            }

            .page-title {
              text-align: center;
              font-size: 18pt;
              margin-bottom: 20px;
            }

            .match-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #ddd;
            }

            .match-table th {
              background-color: #f0f0f0 !important;
              color: black !important;
              font-weight: bold;
              padding: 8px;
              border: 1px solid #ddd;
            }

            .match-table td {
              padding: 8px;
              border: 1px solid #ddd;
            }

            .badge {
              border: 1px solid #333 !important;
              padding: 2px 5px !important;
              font-size: 8pt !important;
              font-weight: normal !important;
              color: black !important;
              background-color: white !important;
            }

            .winner-badge {
              border: 1px solid #333 !important;
            }

            .vs-text {
              font-weight: normal !important;
            }

            .match-date,
            .match-time {
              font-size: 8pt !important;
            }
          }
        `}
      </style>
    </Container>
  );
}
