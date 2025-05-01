import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Table,
  Button,
  Modal,
  Spinner,
  Form,
} from "react-bootstrap";
import Select from "react-select";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import Meta from "@/Components/Meta";

export default function ManageTeam() {
  const router = useRouter();
  const { id } = router.query;
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState(null);
  const [isBrowser, setIsBrowser] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "",
    userId: "",
    phoneNumber: "",
    isCaptain: false,
    isViceCaptain: false,
    jerseyNumber: "",
    jerseyName: "",
    jerseySize: "",
  });

  // Fetch team data
  const fetchTeamData = async () => {
    if (!id) return;

    try {
      const teamRef = doc(db, "cricket_teams", id);
      const teamSnap = await getDoc(teamRef);

      if (teamSnap.exists()) {
        setTeamData({ id: teamSnap.id, ...teamSnap.data() });
      } else {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error fetching team:", error);
      router.push("/profile");
    }
  };

  // Fetch available players from users collection
  const fetchAvailablePlayers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const players = usersSnap.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().name,
          email: doc.data().email,
          phoneNumber: doc.data().phoneNumber,
          photoURL: doc.data().photoURL,
        }))
        .filter((player) => player.phoneNumber); // Only include players with phone numbers

      setAvailablePlayers(players);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.role || !newPlayer.userId) return;

    // Check if player already exists in team
    if (
      teamData?.players?.some((player) => player.userId === newPlayer.userId)
    ) {
      alert("This player is already in the team!");
      return;
    }
    // Check if team has reached maximum number of players
    if (teamData?.players?.length >= 15) {
      alert("You can only add up to 15 players to the team!");
      return;
    }

    try {
      setIsModalAnimating(true);
      const teamRef = doc(db, "cricket_teams", id);
      const players = teamData.players || [];

      const playerData = {
        name: newPlayer.name,
        role: newPlayer.role,
        userId: newPlayer.userId,
        phoneNumber: newPlayer.phoneNumber,
        isCaptain: newPlayer.isCaptain,
        isViceCaptain: newPlayer.isViceCaptain,
        jerseyNumber: newPlayer.jerseyNumber,
        jerseyName: newPlayer.jerseyName,
        jerseySize: newPlayer.jerseySize,
        photoURL: newPlayer.photoURL,
      };

      // Update team data
      await updateDoc(teamRef, {
        players: [...players, playerData],
      });

      // Update local state
      setTeamData({
        ...teamData,
        players: [...players, playerData],
      });

      // Reset form
      setNewPlayer({
        name: "",
        role: "",
        userId: "",
        phoneNumber: "",
        isCaptain: false,
        isViceCaptain: false,
        jerseyNumber: "",
        jerseyName: "",
        jerseySize: "",
        photoURL: "",
      });

      setTimeout(() => {
        setIsModalAnimating(false);
        setShowModal(false);
      }, 500);
    } catch (error) {
      console.error("Error adding player:", error);
      setIsModalAnimating(false);
    }
  };

  // Handle removing player
  const handleRemovePlayer = async (index) => {
    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You need to be logged in to manage the team");
      return;
    }

    // Get the player to be removed
    const playerToRemove = teamData.players[index];

    // Check if current user is captain or vice-captain of the team
    const captainUser = teamData.players.find(
      (player) => player.isCaptain
    )?.userId;
    const viceCaptainUser = teamData.players.find(
      (player) => player.isViceCaptain
    )?.userId;

    const isUserCaptain = currentUser.uid === captainUser;
    const isUserViceCaptain = currentUser.uid === viceCaptainUser;

    // Only captain or vice-captain can remove players
    if (!isUserCaptain && !isUserViceCaptain) {
      alert("Only team captain or vice-captain can remove players");
      return;
    }

    // Captain and vice-captain can't remove themselves
    if (
      (isUserCaptain && playerToRemove.isCaptain) ||
      (isUserViceCaptain && playerToRemove.isViceCaptain)
    ) {
      alert("You cannot remove yourself from the team");
      return;
    }

    // Captain cannot remove vice-captain
    if (isUserCaptain && playerToRemove.isViceCaptain) {
      alert("Captain cannot remove Vice-Captain from the team");
      return;
    }

    // Vice-captain cannot remove captain
    if (isUserViceCaptain && playerToRemove.isCaptain) {
      alert("Vice-Captain cannot remove Captain from the team");
      return;
    }

    if (!window.confirm("Are you sure you want to remove this player?")) return;

    try {
      const teamRef = doc(db, "cricket_teams", id);
      const players = [...teamData.players];
      players.splice(index, 1);

      await updateDoc(teamRef, { players });
      setTeamData({ ...teamData, players });
    } catch (error) {
      console.error("Error removing player:", error);
    }
  };

  const handleEditPlayer = (index) => {
    const player = teamData.players[index];
    setEditingPlayer({
      name: player.name,
      role: player.role,
      userId: player.userId,
      phoneNumber: player.phoneNumber,
      isCaptain: player.isCaptain,
      isViceCaptain: player.isViceCaptain,
      jerseyNumber: player.jerseyNumber || "",
      jerseyName: player.jerseyName || "",
      // Ensure jersey size is lowercase for consistent comparison with dropdown values
      jerseySize: player.jerseySize ? player.jerseySize.toLowerCase() : "",
      photoURL: player.photoURL || "",
    });
    setEditingPlayerIndex(index);
    setShowEditModal(true);
  };

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        await Promise.all([fetchTeamData(), fetchAvailablePlayers()]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    if (!editingPlayer.role) return;

    try {
      setIsModalAnimating(true);
      const teamRef = doc(db, "cricket_teams", id);
      const updatedPlayers = [...teamData.players];

      // If making this player captain, remove captain status from others
      if (editingPlayer.isCaptain) {
        updatedPlayers.forEach((player, idx) => {
          if (idx !== editingPlayerIndex) {
            player.isCaptain = false;
          }
        });
      }

      // If making this player vice captain, remove vice captain status from others
      if (editingPlayer.isViceCaptain) {
        updatedPlayers.forEach((player, idx) => {
          if (idx !== editingPlayerIndex) {
            player.isViceCaptain = false;
          }
        });
      }

      updatedPlayers[editingPlayerIndex] = {
        ...updatedPlayers[editingPlayerIndex],
        ...editingPlayer,
      };

      await updateDoc(teamRef, { players: updatedPlayers });

      setTeamData({
        ...teamData,
        players: updatedPlayers,
      });

      setTimeout(() => {
        setIsModalAnimating(false);
        setShowEditModal(false);
        setEditingPlayer(null);
        setEditingPlayerIndex(null);
      }, 500);
    } catch (error) {
      console.error("Error updating player:", error);
      setIsModalAnimating(false);
    }
  };

  // Print team player details function
  const printPlayersList = () => {
    if (!teamData) return;

    const printWindow = window.open("", "_blank");

    // Safe access for properties
    const teamName = teamData.name || "Team";
    const teamStatus = teamData.status || "unknown";
    const captain = teamData.captain || "Not assigned";
    const viceCaptain = teamData.viceCaptain || "Not assigned";
    const viceCaptainPhoneNumber = teamData.viceCaptainPhoneNumber || "-";
    const captainPhone = teamData.captainPhoneNumber || "-";
    const teamLogo = teamData.teamLogoUrl || "";

    // Ensure players is an array
    const players = Array.isArray(teamData.players) ? teamData.players : [];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${teamName} - Players List</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .print-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .team-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #0d6efd;
          }
          .team-logo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 15px;
            display: block;
            border: 3px solid #0d6efd;
          }
          .team-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #0d6efd;
          }
          .team-info {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #6c757d;
          }
          .info-value {
            font-weight: normal;
          }
          .team-status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            color: white;
            background-color: ${
              teamStatus === "active" ? "#198754" : "#6c757d"
            };
          }
          .players-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .players-table th,
          .players-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .players-table th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .empty-message {
            text-align: center;
            padding: 20px;
            background-color: #fff3cd;
            border: 1px solid #ffecb5;
            color: #664d03;
            border-radius: 5px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .profile-image {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #0d6efd;
            display: inline-block;
          }
          .profile-placeholder {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #e9ecef;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            color: #6c757d;
            border: 2px solid #dee2e6;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            background-color: #0d6efd;
            margin-left: 5px;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="team-header">
            ${
              teamLogo
                ? `<img src="${teamLogo}" class="team-logo" alt="${teamName} Logo">`
                : ""
            }
            <h1 class="team-name">${teamName}</h1>
          </div>
          
          <div class="team-info">
            <div class="info-item">
              <span class="info-label">Captain:</span>
              <span class="info-value">${captain}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Contact:</span>
              <span class="info-value">${captainPhone}</span>
            </div>
          </div>
          <div class="team-info">
            <div class="info-item">
              <span class="info-label">Vice-Captain:</span>
              <span class="info-value">${viceCaptain}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Contact:</span>
              <span class="info-value">${viceCaptainPhoneNumber}</span>
            </div>
          </div>
          
          <h2>Team Players</h2>
          
          ${
            players.length > 0
              ? `
            <table class="players-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Jersey Name</th>
                  <th>Jersey No</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${players
                  .map((player) => {
                    if (!player) return "";

                    const playerName = player.name || "-";
                    const playerRole = player.role || "-";

                    // Find player data
                    const playerData = availablePlayers.find(
                      (p) => p.id === player.userId
                    );
                    const playerPhone = playerData?.phoneNumber || "-";
                    const playerPhotoURL = playerData?.photoURL || "";

                    const jerseyName = player.jerseyName || "-";
                    const jerseyNumber = player.jerseyNumber || "-";

                    return `
                  <tr>
                    <td>
                      ${
                        playerPhotoURL
                          ? `<img src="${playerPhotoURL}" class="profile-image" alt="${playerName}">`
                          : `<div class="profile-placeholder">${playerName
                              .charAt(0)
                              .toUpperCase()}</div>`
                      }
                    </td>
                    <td>
                      ${playerName}
                      ${player.isCaptain ? '<span class="badge">C</span>' : ""}
                      ${
                        player.isViceCaptain
                          ? '<span class="badge">VC</span>'
                          : ""
                      }
                    </td>
                    <td>${playerPhone}</td>
                    <td>${playerRole}</td>
                    <td>${jerseyName}</td>
                    <td>${jerseyNumber}</td>
                    <td></td>
                  </tr>
                `;
                  })
                  .join("")}
              </tbody>
            </table>
          `
              : `
            <div class="empty-message">
              No players added yet.
            </div>
          `
          }
          
          <div class="footer">
            <p>Printed from Chennai Khatri Sports Club</p>
            <p>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #0d6efd; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
              Print This Page
            </button>
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
    <>
      <Meta title={teamData?.name || "Manage Team"} />
      <style jsx global>{`
        /* Animation for card */
        .team-card {
          transform: translateY(20px);
          opacity: 0;
          animation: slideUp 0.6s ease forwards;
        }

        @keyframes slideUp {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Team header animations */
        .team-header h2 {
          opacity: 0;
          transform: translateX(-20px);
          animation: fadeSlideIn 0.5s 0.3s ease forwards;
        }

        .team-header .badge {
          opacity: 0;
          transform: translateX(20px);
          animation: fadeSlideIn 0.5s 0.4s ease forwards;
        }

        @keyframes fadeSlideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Team info animations */
        .team-info > div {
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }

        .team-info > div:nth-child(1) {
          animation-delay: 0.5s;
        }

        .team-info > div:nth-child(2) {
          animation-delay: 0.6s;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        /* Section header animation */
        .section-header {
          position: relative;
          overflow: hidden;
        }

        .section-header h4 {
          animation: pulseText 2s infinite;
        }

        @keyframes pulseText {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .section-header .btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .section-header .btn:hover {
          transform: translateY(-3px);
        }

        .section-header .btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .section-header .btn:hover::after {
          transform: translateX(100%);
        }

        /* Table animations */
        .team-table {
          opacity: 0;
          animation: fadeIn 0.8s 0.8s ease forwards;
        }

        .team-table thead {
          background: linear-gradient(
            to right,
            rgba(13, 110, 253, 0.05),
            transparent
          );
        }

        .team-table tbody tr {
          transition: all 0.3s ease;
          transform: translateX(-10px);
          opacity: 0;
          animation: tableRowIn 0.5s ease forwards;
        }

        .team-table tbody tr:nth-child(1) {
          animation-delay: 0.9s;
        }
        .team-table tbody tr:nth-child(2) {
          animation-delay: 1s;
        }
        .team-table tbody tr:nth-child(3) {
          animation-delay: 1.1s;
        }
        .team-table tbody tr:nth-child(4) {
          animation-delay: 1.2s;
        }
        .team-table tbody tr:nth-child(5) {
          animation-delay: 1.3s;
        }
        .team-table tbody tr:nth-child(6) {
          animation-delay: 1.4s;
        }
        .team-table tbody tr:nth-child(7) {
          animation-delay: 1.5s;
        }
        .team-table tbody tr:nth-child(8) {
          animation-delay: 1.6s;
        }
        .team-table tbody tr:nth-child(9) {
          animation-delay: 1.7s;
        }
        .team-table tbody tr:nth-child(10) {
          animation-delay: 1.8s;
        }
        .team-table tbody tr:nth-child(11) {
          animation-delay: 1.9s;
        }
        .team-table tbody tr:nth-child(12) {
          animation-delay: 2s;
        }
        .team-table tbody tr:nth-child(13) {
          animation-delay: 2.1s;
        }
        .team-table tbody tr:nth-child(14) {
          animation-delay: 2.2s;
        }
        .team-table tbody tr:nth-child(15) {
          animation-delay: 2.3s;
        }

        @keyframes tableRowIn {
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .team-table tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          z-index: 1;
          position: relative;
        }

        /* Button animations */
        .action-button {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .action-button:hover {
          transform: translateY(-2px);
        }

        .action-button.edit-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(40, 167, 69, 0.2);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .action-button.edit-btn:hover::before {
          transform: translateX(0);
        }

        .action-button.remove-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(220, 53, 69, 0.2);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .action-button.remove-btn:hover::before {
          transform: translateX(0);
        }

        /* Modal animations */
        .modal-content {
          transform: scale(0.9);
          opacity: 0;
          animation: scaleIn 0.3s ease forwards;
        }

        @keyframes scaleIn {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .modal-content.animate-out {
          animation: scaleOut 0.3s ease forwards;
        }

        @keyframes scaleOut {
          to {
            transform: scale(0.9);
            opacity: 0;
          }
        }

        .formGroup {
          opacity: 0;
          transform: translateY(10px);
          animation: formFieldIn 0.3s ease forwards;
        }

        .formGroup:nth-child(1) {
          animation-delay: 0.1s;
        }
        .formGroup:nth-child(2) {
          animation-delay: 0.15s;
        }
        .formGroup:nth-child(3) {
          animation-delay: 0.2s;
        }
        .formGroup:nth-child(4) {
          animation-delay: 0.25s;
        }
        .formGroup:nth-child(5) {
          animation-delay: 0.3s;
        }
        .formGroup:nth-child(6) {
          animation-delay: 0.35s;
        }
        .formGroup:nth-child(7) {
          animation-delay: 0.4s;
        }
        .formGroup:nth-child(8) {
          animation-delay: 0.45s;
        }

        @keyframes formFieldIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Loading animation */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
        }

        .loading-text {
          margin-top: 20px;
          opacity: 0;
          animation: pulseOpacity 1.5s ease-in-out infinite alternate;
        }

        @keyframes pulseOpacity {
          from {
            opacity: 0.6;
          }
          to {
            opacity: 1;
          }
        }

        .custom-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <Container className="py-5">
        {loading ? (
          <div className="loading-container">
            <div className="custom-spinner"></div>
            <h4 className="loading-text mt-4">Loading team data...</h4>
          </div>
        ) : (
          <Card className="border-0 shadow-sm team-card">
            <Card.Body className="p-4">
              {/* Team Header */}
              <div className="d-flex justify-content-between align-items-center mb-4 team-header">
                <h2 className="fw-bold mb-0">Team : {teamData?.name}</h2>
                <div>
                  <Button
                    variant="outline-primary mr-2"
                    className="me-2 rounded-pill"
                    onClick={printPlayersList}
                  >
                    <i className="fas fa-print me-2 mr-2"></i>
                    Print Team
                  </Button>
                  <Badge
                    bg={
                      teamData?.status === "active"
                        ? "success"
                        : teamData?.status === "inactive"
                        ? "danger"
                        : "warning"
                    }
                    className="px-5 py-2 rounded-pill text-light"
                  >
                    {teamData?.status}
                  </Badge>
                </div>
              </div>

              {/* Team Info */}
              <Row className="mb-4 team-info">
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>
                      Team Captain:
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div>{teamData?.captain}</div>
                      <Badge
                        bg="primary ml-2"
                        className="rounded-pill text-light"
                      >
                        C
                      </Badge>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div className="text-muted" style={{ width: "140px" }}>
                      Contact:
                    </div>
                    <div>{teamData?.captainPhoneNumber}</div>
                  </div>
                </Col>
              </Row>

              {/* Players Section */}
              {teamData?.status === "active" && (
                <div className="d-flex justify-content-between align-items-center mb-3 section-header">
                  <h4 className="mb-0">Team Players</h4>
                  <Button
                    variant="primary"
                    className="rounded-pill"
                    onClick={() => setShowModal(true)}
                  >
                    <i className="fas fa-plus me-2 mr-2"></i>
                    Add Player
                  </Button>
                </div>
              )}

              {/* Players Table */}
              <Table responsive hover className="align-middle team-table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Jersey Name</th>
                    <th>Jersey Number</th>
                    <th>Jersey Size</th>
                    {teamData?.status === "active" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {teamData?.players?.map((player, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {availablePlayers.find((p) => p.id === player.userId)
                            ?.photoURL ? (
                            <img
                              src={
                                availablePlayers.find(
                                  (p) => p.id === player.userId
                                )?.photoURL
                              }
                              alt={player.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid #0d6efd",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor: "#e9ecef",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: "#6c757d",
                                border: "2px solid #dee2e6",
                              }}
                            >
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {player.name}
                          {player.isCaptain && (
                            <Badge
                              bg="primary ml-2"
                              className="rounded-pill text-light"
                            >
                              C
                            </Badge>
                          )}
                          {player.isViceCaptain && (
                            <Badge
                              bg="primary ml-2"
                              className="rounded-pill text-light"
                            >
                              VC
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        {
                          availablePlayers.find((p) => p.id === player.userId)
                            ?.phoneNumber
                        }
                      </td>
                      <td>{player.role}</td>
                      <td>{player.jerseyName}</td>
                      <td>{player.jerseyNumber}</td>
                      <td>{player.jerseySize.toUpperCase()}</td>
                      <td>
                        {teamData?.status === "active" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline-success"
                              className="rounded-pill action-button edit-btn"
                              onClick={() => handleEditPlayer(index)}
                            >
                              Edit
                            </Button>{" "}
                            <Button
                              size="sm"
                              variant="outline-danger"
                              className="rounded-pill action-button remove-btn ms-1"
                              onClick={() => handleRemovePlayer(index)}
                            >
                              Remove
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!teamData?.players || teamData.players.length === 0) && (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No players added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {/* Add Player Modal */}
        <Modal
          show={showModal}
          onHide={() => !isModalAnimating && setShowModal(false)}
          centered
          backdrop="static"
        >
          <div
            className={`modal-content ${isModalAnimating ? "animate-out" : ""}`}
          >
            <Modal.Header>
              <Modal.Title>Add New Player</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleAddPlayer}>
              <Modal.Body>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Select Player</Form.Label>
                  <Select
                    value={availablePlayers.find(
                      (p) => p.id === newPlayer.userId
                    )}
                    onChange={(selected) =>
                      setNewPlayer({
                        ...newPlayer,
                        name: selected?.name || "",
                        userId: selected?.value || "",
                        phoneNumber: selected?.phoneNumber || "",
                        jerseyNumber: selected?.jerseyNumber || "",
                        jerseyName: selected?.jerseyName || "",
                        jerseySize: selected?.jerseySize || "",
                        role: selected?.role || "",
                        isCaptain: selected?.isCaptain || false,
                        isViceCaptain: selected?.isViceCaptain || false,
                        photoURL: selected?.photoURL || "",
                      })
                    }
                    options={availablePlayers.map((player) => ({
                      value: player.id,
                      label: `${player.name} ${
                        player.phoneNumber ? `(${player.phoneNumber})` : ""
                      }`,
                      name: player.name,
                      phoneNumber: player.phoneNumber,
                      photoURL: player.photoURL,
                    }))}
                    placeholder="Search and select player..."
                    isSearchable
                    isClearable
                    className="basic-single"
                    classNamePrefix="select"
                    menuPortalTarget={isBrowser ? document.body : null}
                    menuPosition={"fixed"}
                    styles={{
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      control: (base, state) => ({
                        ...base,
                        borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
                        boxShadow: state.isFocused
                          ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
                          : "none",
                        "&:hover": {
                          borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
                        },
                        backgroundColor: "#fff",
                        borderRadius: "0.375rem",
                        padding: "0.1rem",
                        transition:
                          "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
                        animation: "fadeIn 0.3s ease forwards",
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: "0.1rem 0.75rem",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#6c757d",
                        fontSize: "1rem",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#0d6efd"
                          : state.isFocused
                          ? "rgba(13, 110, 253, 0.1)"
                          : null,
                        color: state.isSelected ? "white" : "black",
                        padding: "0.5rem 1rem",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        "&:active": {
                          backgroundColor: state.isSelected
                            ? "#0d6efd"
                            : "rgba(13, 110, 253, 0.2)",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        borderRadius: "0.375rem",
                        animation: "scaleIn 0.2s ease forwards",
                      }),
                      input: (base) => ({
                        ...base,
                        margin: "0",
                        padding: "0",
                        color: "#495057",
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        padding: "0.25rem",
                      }),
                      clearIndicator: (base) => ({
                        ...base,
                        padding: "0.25rem",
                        color: "#6c757d",
                        "&:hover": {
                          color: "#495057",
                        },
                      }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        backgroundColor: "#dee2e6",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#495057",
                      }),
                    }}
                    noOptionsMessage={() => "No players found"}
                    formatOptionLabel={({ name, phoneNumber }) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ marginLeft: "5px" }}>
                          <div style={{ fontWeight: "500" }}>{name}</div>
                          {phoneNumber && (
                            <div
                              style={{ fontSize: "0.8rem", color: "#6c757d" }}
                            >
                              {phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  />
                </Form.Group>

                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Player Name</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    disabled={true}
                    value={newPlayer.name}
                    placeholder="Player name will be auto-filled"
                  />
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Contact</Form.Label>
                  <Form.Control
                    type="tel"
                    disabled
                    value={newPlayer.phoneNumber}
                    placeholder="Contact will be auto-filled"
                  />
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    required
                    value={newPlayer.role}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, role: e.target.value })
                    }
                  >
                    <option value="">Select role</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Jersey Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Jersey Name"
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, jerseyName: e.target.value })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Jersey Number</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Jersey Number"
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        jerseyNumber: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Jersey Size</Form.Label>
                  <Form.Select
                    required
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, jerseySize: e.target.value })
                    }
                  >
                    <option value="">Select Size</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXL</option>
                  </Form.Select>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!isModalAnimating) {
                      setIsModalAnimating(true);
                      setTimeout(() => {
                        setShowModal(false);
                        setIsModalAnimating(false);
                      }, 300);
                    }
                  }}
                  disabled={isModalAnimating}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={
                    !newPlayer.name || !newPlayer.role || isModalAnimating
                  }
                >
                  {isModalAnimating ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    "Add Player"
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </div>
        </Modal>

        {/* Edit Player Modal */}
        <Modal
          show={showEditModal}
          onHide={() => !isModalAnimating && setShowEditModal(false)}
          centered
          backdrop="static"
        >
          <div
            className={`modal-content ${isModalAnimating ? "animate-out" : ""}`}
          >
            <Modal.Header>
              <Modal.Title>Edit Player</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdatePlayer}>
              <Modal.Body>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingPlayer?.name || ""}
                    disabled
                  />
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Contact</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingPlayer?.phoneNumber || ""}
                    disabled
                  />
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    required
                    value={editingPlayer?.role || ""}
                    onChange={(e) =>
                      setEditingPlayer({
                        ...editingPlayer,
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="">Select role</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Jersey Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Jersey Name"
                    value={editingPlayer?.jerseyName || ""}
                    onChange={(e) =>
                      setEditingPlayer({
                        ...editingPlayer,
                        jerseyName: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Jersey Number</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Jersey Number"
                    value={editingPlayer?.jerseyNumber || ""}
                    onChange={(e) =>
                      setEditingPlayer({
                        ...editingPlayer,
                        jerseyNumber: e.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3 formGroup">
                  <Form.Label>Jersey Size</Form.Label>
                  <Form.Select
                    value={editingPlayer?.jerseySize || ""}
                    onChange={(e) =>
                      setEditingPlayer({
                        ...editingPlayer,
                        jerseySize: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Size</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXL</option>
                  </Form.Select>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!isModalAnimating) {
                      setIsModalAnimating(true);
                      setTimeout(() => {
                        setShowEditModal(false);
                        setIsModalAnimating(false);
                      }, 300);
                    }
                  }}
                  disabled={isModalAnimating}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isModalAnimating}
                >
                  {isModalAnimating ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    "Update Player"
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </div>
        </Modal>
      </Container>
    </>
  );
}
