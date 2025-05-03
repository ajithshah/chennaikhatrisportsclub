import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Badge,
  Modal,
  Table,
  Tabs,
  Tab,
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
  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    matchDate: "",
    matchTime: "",
    venue: "",
    matchType: "League Match",
    status: "Upcoming",
    homeTeamScore: "",
    awayTeamScore: "",
    winnerTeam: "",
  });

  useEffect(() => {
    fetchMatches();
    fetchTeams();
  }, []);

  // Listen for status changes to show/hide winner selection
  useEffect(() => {
    // If status changes to something other than Completed, clear the winner
    if (formData.status !== "Completed" && formData.winnerTeam) {
      setFormData({
        ...formData,
        winnerTeam: "",
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
    try {
      // Find the selected teams' logo URLs
      const homeTeamData = teams.find(
        (team) => team.name === formData.homeTeam
      );
      const awayTeamData = teams.find(
        (team) => team.name === formData.awayTeam
      );

      const matchData = {
        ...formData,
        createdAt: new Date(),
        homeTeamScore: parseInt(formData.homeTeamScore),
        awayTeamScore: parseInt(formData.awayTeamScore),
        isLive: formData.status === "Live",
        homeTeamLogoUrl: homeTeamData?.teamLogoUrl || "",
        awayTeamLogoUrl: awayTeamData?.teamLogoUrl || "",
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
      const homeTeamData = teams.find(
        (team) => team.name === formData.homeTeam
      );
      const awayTeamData = teams.find(
        (team) => team.name === formData.awayTeam
      );

      const matchRef = doc(db, "matches", currentMatch.id);
      const updatedData = {
        ...formData,
        homeTeamScore: parseInt(formData.homeTeamScore),
        awayTeamScore: parseInt(formData.awayTeamScore),
        isLive: formData.status === "Live",
        homeTeamLogoUrl: homeTeamData?.teamLogoUrl || "",
        awayTeamLogoUrl: awayTeamData?.teamLogoUrl || "",
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
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      matchDate: match.matchDate,
      matchTime: match.matchTime,
      venue: match.venue,
      matchType: match.matchType,
      status: match.status,
      homeTeamScore: match.homeTeamScore,
      awayTeamScore: match.awayTeamScore,
      winnerTeam: match.winnerTeam || "",
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      homeTeam: "",
      awayTeam: "",
      matchDate: "",
      matchTime: "",
      venue: "",
      matchType: "League Match",
      status: "Upcoming",
      homeTeamScore: "",
      awayTeamScore: "",
      winnerTeam: "",
    });
    setCurrentMatch(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
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

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h2 className="page-title">Match Schedule Management</h2>
          <p className="text-muted">
            Create and manage cricket match schedules
          </p>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="add-match-btn"
          >
            <i className="bi bi-plus-circle me-2"></i>Add New Match
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
            <Tabs defaultActiveKey="upcoming" className="mb-4 mt-4">
              <Tab
                eventKey="live"
                title={
                  <span>
                    <i className="bi bi-broadcast-pin me-2"></i>Live Matches
                  </span>
                }
              >
                {matches.filter((match) => match.status === "Live").length ===
                0 ? (
                  <div className="text-center my-5">
                    <p>No live matches at the moment.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="match-admin-table">
                      <thead>
                        <tr>
                          <th className="text-center">Status</th>
                          <th className="text-center">Match Type</th>
                          <th>Home Team</th>
                          <th className="text-center">Score</th>
                          <th>Away Team</th>
                          <th>Date & Time</th>
                          <th>Venue</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches
                          .filter((match) => match.status === "Live")
                          .map((match) => (
                            <tr key={match.id} className="match-row">
                              <td className="text-center align-middle">
                                {getStatusBadge(match.status)}
                              </td>
                              <td className="text-center align-middle">
                                {match.matchType}
                              </td>
                              <td className="team-cell align-middle">
                                <div className="team-info">
                                  {match.homeTeamLogoUrl ? (
                                    <div className="team-logo-container-sm">
                                      <Image
                                        src={match.homeTeamLogoUrl}
                                        alt={`${match.homeTeam} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo-sm"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder-sm">
                                      {match.homeTeam.charAt(0)}
                                    </div>
                                  )}
                                  <span className="team-name">
                                    {match.homeTeam}
                                  </span>
                                </div>
                              </td>
                              <td className="score-cell text-center align-middle">
                                <div className="score">
                                  <span className="home-score">
                                    {match.homeTeamScore}
                                  </span>
                                  <span className="score-separator">-</span>
                                  <span className="away-score">
                                    {match.awayTeamScore}
                                  </span>
                                </div>
                              </td>
                              <td className="team-cell align-middle">
                                <div className="team-info">
                                  {match.awayTeamLogoUrl ? (
                                    <div className="team-logo-container-sm">
                                      <Image
                                        src={match.awayTeamLogoUrl}
                                        alt={`${match.awayTeam} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo-sm"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder-sm">
                                      {match.awayTeam.charAt(0)}
                                    </div>
                                  )}
                                  <span className="team-name">
                                    {match.awayTeam}
                                  </span>
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="match-date">
                                  {formatMatchDate(match.matchDate)}
                                </div>
                                <div className="match-time">
                                  <i className="bi bi-clock me-1"></i>
                                  {match.matchTime}
                                </div>
                              </td>
                              <td className="align-middle">{match.venue}</td>
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
              </Tab>

              <Tab
                eventKey="upcoming"
                title={
                  <span>
                    <i className="bi bi-calendar-event me-2"></i>Upcoming
                    Matches
                  </span>
                }
              >
                {matches.filter((match) => match.status === "Upcoming")
                  .length === 0 ? (
                  <div className="text-center my-5">
                    <p>No upcoming matches scheduled.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="match-admin-table">
                      <thead>
                        <tr>
                          <th className="text-center">Status</th>
                          <th className="text-center">Match Type</th>
                          <th>Home Team</th>
                          <th className="text-center">Match</th>
                          <th>Away Team</th>
                          <th>Date & Time</th>
                          <th>Venue</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches
                          .filter((match) => match.status === "Upcoming")
                          .map((match) => (
                            <tr key={match.id} className="match-row">
                              <td className="text-center align-middle">
                                {getStatusBadge(match.status)}
                              </td>
                              <td className="text-center align-middle">
                                {match.matchType}
                              </td>
                              <td className="team-cell align-middle">
                                <div className="team-info">
                                  {match.homeTeamLogoUrl ? (
                                    <div className="team-logo-container-sm">
                                      <Image
                                        src={match.homeTeamLogoUrl}
                                        alt={`${match.homeTeam} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo-sm"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder-sm">
                                      {match.homeTeam.charAt(0)}
                                    </div>
                                  )}
                                  <span className="team-name">
                                    {match.homeTeam}
                                  </span>
                                </div>
                              </td>
                              <td className="score-cell text-center align-middle">
                                <span className="vs-text">VS</span>
                              </td>
                              <td className="team-cell align-middle">
                                <div className="team-info">
                                  {match.awayTeamLogoUrl ? (
                                    <div className="team-logo-container-sm">
                                      <Image
                                        src={match.awayTeamLogoUrl}
                                        alt={`${match.awayTeam} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo-sm"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder-sm">
                                      {match.awayTeam.charAt(0)}
                                    </div>
                                  )}
                                  <span className="team-name">
                                    {match.awayTeam}
                                  </span>
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="match-date">
                                  {formatMatchDate(match.matchDate)}
                                </div>
                                <div className="match-time">
                                  <i className="bi bi-clock me-1"></i>
                                  {match.matchTime}
                                </div>
                              </td>
                              <td className="align-middle">{match.venue}</td>
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
              </Tab>

              <Tab
                eventKey="completed"
                title={
                  <span>
                    <i className="bi bi-check-circle me-2"></i>Completed Matches
                  </span>
                }
              >
                {matches.filter((match) => match.status === "Completed")
                  .length === 0 ? (
                  <div className="text-center my-5">
                    <p>No completed matches available.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="match-admin-table">
                      <thead>
                        <tr>
                          <th className="text-center">Status</th>
                          <th className="text-center">Match Type</th>
                          <th>Home Team</th>
                          <th className="text-center">Score</th>
                          <th>Away Team</th>
                          <th>Date & Time</th>
                          <th>Venue</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches
                          .filter((match) => match.status === "Completed")
                          .map((match) => (
                            <tr key={match.id} className="match-row">
                              <td className="text-center align-middle">
                                {getStatusBadge(match.status)}
                              </td>
                              <td className="text-center align-middle">
                                {match.matchType}
                              </td>
                              <td className="team-cell align-middle">
                                <div className="team-info">
                                  {match.homeTeamLogoUrl ? (
                                    <div className="team-logo-container-sm">
                                      <Image
                                        src={match.homeTeamLogoUrl}
                                        alt={`${match.homeTeam} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo-sm"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder-sm">
                                      {match.homeTeam.charAt(0)}
                                    </div>
                                  )}
                                  <span className="team-name">
                                    {match.homeTeam}
                                  </span>
                                  {match.winnerTeam === match.homeTeam && (
                                    <Badge
                                      bg="warning"
                                      className="winner-badge-sm ms-1"
                                    >
                                      Winner
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="score-cell text-center align-middle">
                                <div className="score">
                                  <span className="home-score">
                                    {match.homeTeamScore}
                                  </span>
                                  <span className="score-separator">-</span>
                                  <span className="away-score">
                                    {match.awayTeamScore}
                                  </span>
                                </div>
                                {match.winnerTeam === "Draw" && (
                                  <Badge
                                    bg="info"
                                    className="mt-1 d-block mx-auto"
                                  >
                                    Draw
                                  </Badge>
                                )}
                              </td>
                              <td className="team-cell align-middle">
                                <div className="team-info">
                                  {match.awayTeamLogoUrl ? (
                                    <div className="team-logo-container-sm">
                                      <Image
                                        src={match.awayTeamLogoUrl}
                                        alt={`${match.awayTeam} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo-sm"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder-sm">
                                      {match.awayTeam.charAt(0)}
                                    </div>
                                  )}
                                  <span className="team-name">
                                    {match.awayTeam}
                                  </span>
                                  {match.winnerTeam === match.awayTeam && (
                                    <Badge
                                      bg="warning"
                                      className="winner-badge-sm ms-1"
                                    >
                                      Winner
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="match-date">
                                  {formatMatchDate(match.matchDate)}
                                </div>
                                <div className="match-time">
                                  <i className="bi bi-clock me-1"></i>
                                  {match.matchTime}
                                </div>
                              </td>
                              <td className="align-middle">{match.venue}</td>
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
              </Tab>

              <Tab
                eventKey="other"
                title={
                  <span>
                    <i className="bi bi-exclamation-triangle me-2"></i>Other
                  </span>
                }
              >
                {matches.filter(
                  (match) =>
                    match.status !== "Live" &&
                    match.status !== "Upcoming" &&
                    match.status !== "Completed"
                ).length === 0 ? (
                  <div className="text-center my-5">
                    <p>No postponed or canceled matches.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="match-admin-table">
                      <thead>
                        <tr>
                          <th className="text-center">Status</th>
                          <th className="text-center">Match Type</th>
                          <th>Home Team</th>
                          <th className="text-center">Match</th>
                          <th>Away Team</th>
                          <th>Date & Time</th>
                          <th>Venue</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches
                          .filter(
                            (match) =>
                              match.status !== "Live" &&
                              match.status !== "Upcoming" &&
                              match.status !== "Completed"
                          )
                          .map((match) => (
                            <tr key={match.id} className="match-row">
                              <td className="text-center align-middle">
                                {getStatusBadge(match.status)}
                              </td>
                              <td className="text-center align-middle">
                                {match.matchType}
                              </td>
                              <td className="team-cell align-middle">
                                <div className="team-info">
                                  {match.homeTeamLogoUrl ? (
                                    <div className="team-logo-container-sm">
                                      <Image
                                        src={match.homeTeamLogoUrl}
                                        alt={`${match.homeTeam} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo-sm"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder-sm">
                                      {match.homeTeam.charAt(0)}
                                    </div>
                                  )}
                                  <span className="team-name">
                                    {match.homeTeam}
                                  </span>
                                </div>
                              </td>
                              <td className="score-cell text-center align-middle">
                                <span className="vs-text">VS</span>
                              </td>
                              <td className="team-cell align-middle">
                                <div className="team-info">
                                  {match.awayTeamLogoUrl ? (
                                    <div className="team-logo-container-sm">
                                      <Image
                                        src={match.awayTeamLogoUrl}
                                        alt={`${match.awayTeam} logo`}
                                        width={40}
                                        height={40}
                                        className="team-logo-sm"
                                      />
                                    </div>
                                  ) : (
                                    <div className="team-logo-placeholder-sm">
                                      {match.awayTeam.charAt(0)}
                                    </div>
                                  )}
                                  <span className="team-name">
                                    {match.awayTeam}
                                  </span>
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="match-date">
                                  {formatMatchDate(match.matchDate)}
                                </div>
                                <div className="match-time">
                                  <i className="bi bi-clock me-1"></i>
                                  {match.matchTime}
                                </div>
                              </td>
                              <td className="align-middle">{match.venue}</td>
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
              </Tab>
            </Tabs>
          )}
        </>
      )}

      {/* Add Match Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        centered
        className="match-modal"
      >
        <Modal.Header className="modal-header">
          <Modal.Title>Add New Match</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handleAddMatch}>
            <Form.Group className="mb-3">
              <Form.Label>Home Team</Form.Label>
              <div className="team-select-container">
                <Form.Select
                  name="homeTeam"
                  value={formData.homeTeam}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
                >
                  <option value="">Select Home Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </Form.Select>
                {formData.homeTeam && (
                  <div className="selected-team-logo">
                    {teams.find((team) => team.name === formData.homeTeam)
                      ?.teamLogoUrl ? (
                      <Image
                        src={
                          teams.find((team) => team.name === formData.homeTeam)
                            ?.teamLogoUrl
                        }
                        alt={`${formData.homeTeam} logo`}
                        width={40}
                        height={40}
                        className="team-logo-small"
                      />
                    ) : (
                      <div className="team-logo-placeholder-small">
                        {formData.homeTeam.charAt(0)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Away Team</Form.Label>
              <div className="team-select-container">
                <Form.Select
                  name="awayTeam"
                  value={formData.awayTeam}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
                >
                  <option value="">Select Away Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </Form.Select>
                {formData.awayTeam && (
                  <div className="selected-team-logo">
                    {teams.find((team) => team.name === formData.awayTeam)
                      ?.teamLogoUrl ? (
                      <Image
                        src={
                          teams.find((team) => team.name === formData.awayTeam)
                            ?.teamLogoUrl
                        }
                        alt={`${formData.awayTeam} logo`}
                        width={40}
                        height={40}
                        className="team-logo-small"
                      />
                    ) : (
                      <div className="team-logo-placeholder-small">
                        {formData.awayTeam.charAt(0)}
                      </div>
                    )}
                  </div>
                )}
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
              <Form.Control
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Enter match venue"
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Match Type</Form.Label>
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
                <Col>
                  <Form.Group>
                    <Form.Label>Home Team Score</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="homeTeamScore"
                      value={formData.homeTeamScore}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Away Team Score</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="awayTeamScore"
                      value={formData.awayTeamScore}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {formData.status === "Completed" && (
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
                  {formData.homeTeam && (
                    <option value={formData.homeTeam}>
                      {formData.homeTeam}
                    </option>
                  )}
                  {formData.awayTeam && (
                    <option value={formData.awayTeam}>
                      {formData.awayTeam}
                    </option>
                  )}
                  <option value="Draw">Match Drawn</option>
                </Form.Select>
              </Form.Group>
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
        onHide={() => setShowEditModal(false)}
        centered
        className="match-modal"
      >
        <Modal.Header className="modal-header">
          <Modal.Title>Edit Match</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          <Form onSubmit={handleEditMatch}>
            <Form.Group className="mb-3">
              <Form.Label>Home Team</Form.Label>
              <div className="team-select-container">
                <Form.Select
                  name="homeTeam"
                  value={formData.homeTeam}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
                >
                  <option value="">Select Home Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </Form.Select>
                {formData.homeTeam && (
                  <div className="selected-team-logo">
                    {teams.find((team) => team.name === formData.homeTeam)
                      ?.teamLogoUrl ? (
                      <Image
                        src={
                          teams.find((team) => team.name === formData.homeTeam)
                            ?.teamLogoUrl
                        }
                        alt={`${formData.homeTeam} logo`}
                        width={40}
                        height={40}
                        className="team-logo-small"
                      />
                    ) : (
                      <div className="team-logo-placeholder-small">
                        {formData.homeTeam.charAt(0)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Away Team</Form.Label>
              <div className="team-select-container">
                <Form.Select
                  name="awayTeam"
                  value={formData.awayTeam}
                  onChange={handleInputChange}
                  required
                  className="form-select-custom"
                >
                  <option value="">Select Away Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </Form.Select>
                {formData.awayTeam && (
                  <div className="selected-team-logo">
                    {teams.find((team) => team.name === formData.awayTeam)
                      ?.teamLogoUrl ? (
                      <Image
                        src={
                          teams.find((team) => team.name === formData.awayTeam)
                            ?.teamLogoUrl
                        }
                        alt={`${formData.awayTeam} logo`}
                        width={40}
                        height={40}
                        className="team-logo-small"
                      />
                    ) : (
                      <div className="team-logo-placeholder-small">
                        {formData.awayTeam.charAt(0)}
                      </div>
                    )}
                  </div>
                )}
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
              <Form.Control
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Enter match venue"
                required
                className="form-control-custom"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Match Type</Form.Label>
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
                <Col>
                  <Form.Group>
                    <Form.Label>Home Team Score</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="homeTeamScore"
                      value={formData.homeTeamScore}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Away Team Score</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      name="awayTeamScore"
                      value={formData.awayTeamScore}
                      onChange={handleScoreChange}
                      className="form-control-custom score-input"
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

            {formData.status === "Completed" && (
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
                  {formData.homeTeam && (
                    <option value={formData.homeTeam}>
                      {formData.homeTeam}
                    </option>
                  )}
                  {formData.awayTeam && (
                    <option value={formData.awayTeam}>
                      {formData.awayTeam}
                    </option>
                  )}
                  <option value="Draw">Match Drawn</option>
                </Form.Select>
              </Form.Group>
            )}

            <div className="d-grid mt-4">
              <Button variant="primary" type="submit" className="submit-btn">
                Update Match
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style jsx global>{`
        .match-card {
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.125);
        }

        .match-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .match-teams {
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: center;
        }

        .match-team {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .team-score {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 5px;
        }

        .match-vs {
          padding: 0 10px;
          font-weight: bold;
          color: #6c757d;
        }

        .match-details {
          margin-top: 15px;
          border-top: 1px solid #eee;
          padding-top: 15px;
        }

        .match-details p {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }

        .match-details i {
          margin-right: 8px;
          color: #6c757d;
        }

        .page-title {
          font-weight: bold;
          color: #333;
          border-bottom: 3px solid #f8f9fa;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }

        .add-match-btn {
          border-radius: 50px;
          padding: 8px 20px;
        }

        .match-modal .modal-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }

        .match-modal .modal-body {
          padding: 20px;
        }

        .form-select-custom {
          border-radius: 50px;
          padding: 10px 15px;
        }

        .form-control-custom {
          border-radius: 50px;
          padding: 10px 15px;
        }

        .score-section {
          margin-top: 20px;
        }

        .score-input {
          border-radius: 50px;
          padding: 10px 15px;
        }

        .winner-section {
          margin-top: 20px;
        }

        .winner-select {
          border-radius: 50px;
          padding: 10px 15px;
        }

        .submit-btn {
          border-radius: 50px;
          padding: 10px 15px;
        }

        .team-select-container {
          display: flex;
          align-items: center;
        }

        .selected-team-logo {
          margin-left: 10px;
        }

        .team-logo-small {
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #eee;
        }

        .team-logo-placeholder-small {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #ddd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: bold;
          color: #666;
        }

        .team-logo-container {
          height: 70px;
          width: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .team-logo {
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #eee;
          transition: transform 0.3s ease;
        }

        .match-card:hover .team-logo {
          transform: scale(1.05);
        }

        .team-logo-placeholder {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: #666;
          border: 3px solid #ddd;
        }

        .match-admin-table {
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 30px;
          background-color: #fff;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          overflow: hidden;
        }

        .match-admin-table thead th {
          background-color: #f8f9fa;
          border-bottom: 2px solid #eaeaea;
          padding: 12px;
          font-weight: 600;
          color: #495057;
        }

        .match-admin-table tbody tr {
          transition: all 0.2s ease;
        }

        .match-admin-table tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }

        .match-admin-table tbody tr td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          vertical-align: middle;
        }

        .team-cell {
          min-width: 150px;
        }

        .team-info {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
        }

        .team-logo-container-sm {
          width: 40px;
          height: 40px;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .team-logo-sm {
          border-radius: 50%;
          border: 2px solid #eee;
          object-fit: cover;
        }

        .team-logo-placeholder-sm {
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
          margin-bottom: 4px;
        }

        .match-time {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .winner-badge-sm {
          font-size: 0.7rem;
          padding: 0.25em 0.6em;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        @media (max-width: 992px) {
          .match-admin-table {
            min-width: 900px;
          }
        }
      `}</style>
    </Container>
  );
}
