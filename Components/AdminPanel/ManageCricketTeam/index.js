"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { auth, db } from "../../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Image from "next/image";
import Header from "@/Components/Header";
import Meta from "@/Components/Meta";
import Select from "react-select";

export default function ManageCricketTeam() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [viewShowModal, setViewShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableCaptains, setAvailableCaptains] = useState([]);
  const [viewTeamDetails, setViewTeamDetails] = useState(null);
  const [file, setFile] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    captain: "",
    viceCaptain: "",
    captainPhoneNumber: "",
    viceCaptainPhoneNumber: "",
    status: "freeze",
    email: "",
    players: [],
    teamLogoUrl: "",
  });

  useEffect(() => {
    const checkAuthAndFetchData = async (currentUser) => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || !userSnap.data().isAdmin) {
          router.push("/");
          return;
        }

        await fetchAvailableCaptains();

        const teamsSnap = await getDocs(collection(db, "cricket_teams"));
        const teamsData = teamsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTeams(teamsData);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        router.push("/");
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAuthAndFetchData(user);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchAvailableCaptains = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const captains = usersSnap.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.data().displayName,
          phoneNumber: doc.data().phoneNumber,
          email: doc.data().email,
          photoURL: doc.data().photoURL || doc.data().profilePic || "",
        }))
        .filter((captain) => captain.phoneNumber);

      setAvailableCaptains(captains);
    } catch (error) {
      console.error("Error fetching captains:", error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTeamForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Check file size - 400 KB = 400 * 1024 bytes
    if (selectedFile && selectedFile.size > 400 * 1024) {
      alert("File size exceeds 400 KB. Please select a smaller image.");
      e.target.value = null;
      return;
    }

    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const validateForm = () => {
    // Basic validation for captain and vice-captain
    if (
      !teamForm.captain ||
      !teamForm.viceCaptain ||
      teamForm.captain === teamForm.viceCaptain
    ) {
      alert(
        "Captain and Vice-Captain cannot be the same person and must be selected."
      );
      return false;
    }

    // Check if the selected players are already in other teams
    if (!isEditing) {
      // For new team creation

      // Check if captain is already assigned to any team
      const existingCaptainTeam = teams.find(
        (team) =>
          team.captain === teamForm.captain ||
          team.viceCaptain === teamForm.captain ||
          team.players.some((player) => player.name === teamForm.captain)
      );
      if (existingCaptainTeam) {
        alert(
          `Captain ${teamForm.captain} is already assigned to another team. Please select a different captain.`
        );
        return false;
      }

      // Check if vice-captain is already assigned to any team
      const existingViceCaptainTeam = teams.find(
        (team) =>
          team.viceCaptain === teamForm.viceCaptain ||
          team.captain === teamForm.viceCaptain ||
          team.players.some((player) => player.name === teamForm.viceCaptain)
      );
      if (existingViceCaptainTeam) {
        alert(
          `Vice-Captain ${teamForm.viceCaptain} is already assigned to another team. Please select a different vice-captain.`
        );
        return false;
      }

      // Check for other team members (if any are being added)
      if (teamForm.players && teamForm.players.length > 2) {
        const additionalPlayers = teamForm.players.filter(
          (player) => !player.isCaptain && !player.isViceCaptain
        );

        for (const player of additionalPlayers) {
          const existingPlayerTeam = teams.find(
            (team) =>
              team.captain === player.name ||
              team.viceCaptain === player.name ||
              team.players.some((p) => p.name === player.name)
          );

          if (existingPlayerTeam) {
            alert(
              `Player ${player.name} is already assigned to another team. Please select unique players.`
            );
            return false;
          }
        }
      }
    } else {
      // Similar changes for the editing validation logic...
      // ...existing code...
    }

    return true;
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error("You must be logged in to add a team.");
    }

    let teamLogoUrl = null;

    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        // Fixed fetch call to handle SSL certificate issues
        const uploadUrlResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          // Skip certificate validation in development
          agent:
            process.env.NODE_ENV === "development"
              ? { rejectUnauthorized: false }
              : undefined,
        });

        const urlData = await uploadUrlResponse.json();
        if (!uploadUrlResponse.ok) {
          throw new Error(
            urlData.error || `HTTP error: ${uploadUrlResponse.status}`
          );
        }
        teamLogoUrl = urlData.fileUrl;
      }

      const newTeam = {
        ...teamForm,
        players: [
          {
            name: teamForm.captain,
            isCaptain: true,
            isViceCaptain: false,
            phoneNumber: teamForm.captainPhoneNumber,
            jerseyNumber: "",
            jerseyName: "",
            jerseySize: "",
            role: "",
            userId:
              availableCaptains.find(
                (captain) => captain.name === teamForm.captain
              )?.id || "",
          },
          {
            name: teamForm.viceCaptain,
            isCaptain: false,
            isViceCaptain: true,
            phoneNumber: teamForm.viceCaptainPhoneNumber,
            jerseyNumber: "",
            jerseyName: "",
            jerseySize: "",
            role: "",
            userId:
              availableCaptains.find(
                (captain) => captain.name === teamForm.viceCaptain
              )?.id || "",
          },
        ],
        teamLogoUrl: teamLogoUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save newTeam to database (e.g., Firestore)
      const docRef = await addDoc(collection(db, "cricket_teams"), newTeam);
      setTeams([...teams, { id: docRef.id, ...newTeam }]);

      // Close modal and reset form (if applicable)
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error adding team:", error);
      alert(`Error adding team: ${error.message}`);
    }
  };

  const handleEditTeam = async (team) => {
    setIsEditing(true);
    setTeamForm({
      id: team.id,
      name: team.name,
      captain: team.captain,
      viceCaptain: team.viceCaptain || "",
      captainPhoneNumber: team.captainPhoneNumber || "",
      viceCaptainPhoneNumber: team.viceCaptainPhoneNumber || "",
      status: team.status || "freeze",
      email: team.email || "",
      players: team.players || [],
      teamLogoUrl: team.teamLogoUrl,
    });
    setShowModal(true);
    setPreview(team.teamLogoUrl);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    let teamLogoUrl = teamForm.teamLogoUrl;
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        // Fixed fetch call to handle SSL certificate issues
        const uploadUrlResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          // Skip certificate validation in development
          agent:
            process.env.NODE_ENV === "development"
              ? { rejectUnauthorized: false }
              : undefined,
        });

        const urlData = await uploadUrlResponse.json();
        if (!uploadUrlResponse.ok) {
          throw new Error(
            urlData.error || `HTTP error: ${uploadUrlResponse.status}`
          );
        }
        teamLogoUrl = urlData.fileUrl;
      }

      // Create updated players array with correct captain assignments
      let updatedPlayers = [];
      const captainExists = teamForm.players.some(
        (p) => p.name === teamForm.captain
      );
      const viceCaptainExists = teamForm.players.some(
        (p) => p.name === teamForm.viceCaptain
      );

      // First, check if the captain and vice-captain are in the existing players
      if (teamForm.players && teamForm.players.length > 0) {
        // Map through existing players and update captain/vice-captain flags
        updatedPlayers = teamForm.players.map((player) => {
          // If this player is now the captain
          if (player.name === teamForm.captain) {
            return {
              ...player,
              isCaptain: true,
              isViceCaptain: false,
              phoneNumber: teamForm.captainPhoneNumber,
              userId:
                availableCaptains.find(
                  (captain) => captain.name === teamForm.captain
                )?.id ||
                player.userId ||
                "",
            };
          }
          // If this player is now the vice-captain
          else if (player.name === teamForm.viceCaptain) {
            return {
              ...player,
              isCaptain: false,
              isViceCaptain: true,
              phoneNumber: teamForm.viceCaptainPhoneNumber,
              userId:
                availableCaptains.find(
                  (captain) => captain.name === teamForm.viceCaptain
                )?.id ||
                player.userId ||
                "",
            };
          }
          // For any other player, ensure they are not marked as captain or vice-captain
          else {
            return {
              ...player,
              isCaptain: false,
              isViceCaptain: false,
            };
          }
        });
      }

      // If the captain doesn't exist in the player list, add them
      if (!captainExists) {
        updatedPlayers.push({
          name: teamForm.captain,
          isCaptain: true,
          isViceCaptain: false,
          phoneNumber: teamForm.captainPhoneNumber,
          jerseyNumber: "",
          jerseyName: "",
          jerseySize: "",
          role: "",
          userId:
            availableCaptains.find(
              (captain) => captain.name === teamForm.captain
            )?.id || "",
        });
      }

      // If the vice-captain doesn't exist in the player list, add them
      if (!viceCaptainExists) {
        updatedPlayers.push({
          name: teamForm.viceCaptain,
          isCaptain: false,
          isViceCaptain: true,
          phoneNumber: teamForm.viceCaptainPhoneNumber,
          jerseyNumber: "",
          jerseyName: "",
          jerseySize: "",
          role: "",
          userId:
            availableCaptains.find(
              (captain) => captain.name === teamForm.viceCaptain
            )?.id || "",
        });
      }

      const teamRef = doc(db, "cricket_teams", teamForm.id);
      const updateData = {
        name: teamForm.name,
        captain: teamForm.captain,
        viceCaptain: teamForm.viceCaptain,
        captainPhoneNumber: teamForm.captainPhoneNumber,
        viceCaptainPhoneNumber: teamForm.viceCaptainPhoneNumber,
        status: teamForm.status,
        email: teamForm.email,
        players: updatedPlayers,
        updatedAt: new Date().toISOString(),
        teamLogoUrl: teamLogoUrl,
      };

      await updateDoc(teamRef, updateData);

      setTeams(
        teams.map((team) =>
          team.id === teamForm.id ? { ...team, ...updateData } : team
        )
      );

      setShowModal(false);
      setIsEditing(false);
      resetForm();
    } catch (error) {
      console.error("Error updating team:", error);
      alert("Error updating team: " + error.message);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const teamRef = doc(db, "cricket_teams", teamId);
      const teamSnap = await getDoc(teamRef);

      if (!teamSnap.exists()) {
        console.error("Team not found");
        return;
      }

      const teamData = teamSnap.data();

      if (teamData.players && teamData.players.length > 2) {
        // Allow deletion if only captain and vice-captain exist
        alert(
          "Cannot delete team with existing members. Please remove all members first."
        );
        return;
      }

      if (window.confirm("Are you sure you want to delete this team?")) {
        await deleteDoc(teamRef);
        setTeams(teams.filter((team) => team.id !== teamId));
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      alert("Error deleting team. Please try again.");
    }
  };

  const handleViewTeam = async (teamId) => {
    try {
      const teamRef = doc(db, "cricket_teams", teamId);
      const teamSnap = await getDoc(teamRef);

      if (teamSnap.exists()) {
        const teamData = teamSnap.data();
        setViewTeamDetails(teamData);

        const membersData = teamData.players.map((player, index) => ({
          id: index.toString(),
          name: player.name,
          role: player.role || "",
          jerseyNumber: player.jerseyNumber || "",
          jerseyName: player.jerseyName || "",
          jerseySize: player.jerseySize || "",
          phoneNumber: player.phoneNumber || "",
          userId: player.userId || "", // Include userId for profile photo lookup
        }));

        setTeamMembers(membersData);
        setViewShowModal(true);
      }
    } catch (error) {
      console.error("Error viewing team:", error);
      alert("Error viewing team: " + error.message);
    }
  };

  const resetForm = () => {
    setTeamForm({
      name: "",
      captain: "",
      viceCaptain: "",
      captainPhoneNumber: "",
      viceCaptainPhoneNumber: "",
      status: "freeze",
      email: "",
      players: [],
      teamLogoUrl: "",
    });
    setFile(null);
    setPreview(null);
  };

  // ---------------- printTeamDetails ----------------
  const printTeamDetails = () => {
    if (!viewTeamDetails) return;

    const printWindow = window.open("", "_blank");

    // Safe access for properties
    const teamName = viewTeamDetails.name || "Team";
    const teamLogo = viewTeamDetails.teamLogoUrl || "";
    const teamStatus = viewTeamDetails.status || "unknown";
    const captain = viewTeamDetails.captain || "Not assigned";
    const viceCaptain = viewTeamDetails.viceCaptain || "Not assigned";
    const captainPhone = viewTeamDetails.captainPhoneNumber || "-";
    const viceCaptainPhone = viewTeamDetails.viceCaptainPhoneNumber || "-";

    // Ensure players is an array
    const players = Array.isArray(viewTeamDetails.players)
      ? viewTeamDetails.players
      : [];

    // Ensure teamMembers is an array
    const members = Array.isArray(teamMembers) ? teamMembers : [];

    // Ensure availableCaptains is an array
    const captains = Array.isArray(availableCaptains) ? availableCaptains : [];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${teamName} - Team Details</title>
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
            padding-bottom: 20px;
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
          .team-date {
            color: #666;
            font-style: italic;
            margin-bottom: 15px;
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
          .leadership-section {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            flex-wrap: wrap;
          }
          .leader-card {
            width: 45%;
            min-width: 200px;
            border: 1px solid #dee2e6;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            margin-bottom: 15px;
          }
          .leader-title {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 14px;
            color: white;
            background-color: #0d6efd;
            margin-bottom: 10px;
          }
          .leader-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .leader-phone {
            color: #666;
          }
          .members-title {
            font-size: 20px;
            font-weight: bold;
            margin: 30px 0 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #ddd;
            color: #333;
          }
          .members-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .members-table th,
          .members-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .members-table th {
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
            width: 65px;
            height: 65px;
            border-radius: 10%;
            object-fit: cover;
            border: 1px solid #0d6efd;
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
          
          <div class="leadership-section">
            <div class="leader-card">
              <div class="leader-title" style="background-color: #0d6efd;">Captain</div>
              <div class="leader-name">${captain}</div>
              <div class="leader-phone">${captainPhone}</div>
            </div>
            
            <div class="leader-card">
              <div class="leader-title" style="background-color: #0dcaf0;">Vice Captain</div>
              <div class="leader-name">${viceCaptain}</div>
              <div class="leader-phone">${viceCaptainPhone}</div>
            </div>
          </div>
          
          <h2 class="members-title">Team Members</h2>
          
          ${
            members.length > 0
              ? `
            <table class="members-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Jersey Name</th>
                  <th>Jersey No</th>
                  <th>Jersey Size</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${members
                  .map((member) => {
                    if (!member) return "";

                    const memberName = member.name || "";
                    const memberRole = member.role || "-";
                    const memberPhone = member.phoneNumber || "-";
                    const jerseyName = member.jerseyName || "-";
                    const jerseyNumber = member.jerseyNumber || "-";
                    const jerseySize = member.jerseySize || "";

                    let memberPhotoURL = "";

                    // Find player in team players
                    const player = players.find(
                      (p) => p && p.name === memberName
                    );

                    // Find photo URL from available captains
                    if (player && player.userId) {
                      const captain = captains.find(
                        (c) => c && c.id === player.userId
                      );
                      if (captain && captain.photoURL) {
                        memberPhotoURL = captain.photoURL;
                      }
                    }

                    return `
                  <tr>
                    <td>
                      ${
                        memberPhotoURL
                          ? `<img src="${memberPhotoURL}" class="profile-image" alt="${memberName}" width="80" height="80">`
                          : `<div class="profile-placeholder">${memberName
                              .charAt(0)
                              .toUpperCase()}</div>`
                      }
                    </td>
                    <td>${memberName}</td>
                    <td>${memberRole}</td>
                    <td>${memberPhone}</td>
                    <td>${jerseyName}</td>
                    <td>${jerseyNumber}</td>
                    <td>${jerseySize ? jerseySize.toUpperCase() : "-"}</td>
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
              No team members added yet.
            </div>
          `
          }
          
          <div class="footer">
            <p>Printed from Chennai Khatri Sports Club Admin Panel</p>
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
  // ---------------- printTeamDetails ----------------

  return (
    <>
      <Meta title="Manage Cricket Teams | Admin Panel" />
      <Header />
      <style jsx global>{`
        /* Base animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 50px;
          }
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-3deg);
          }
          75% {
            transform: rotate(3deg);
          }
        }

        /* Loading animation */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          text-align: center;
        }

        .loading-spinner-container {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 2rem;
        }

        .loading-spinner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 4px solid rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          animation: spin 1s linear infinite;
        }

        .loading-spinner-inner {
          position: absolute;
          top: 15px;
          left: 15px;
          width: 50px;
          height: 50px;
          border: 4px solid rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          opacity: 0.7;
          animation: spin 0.8s linear infinite reverse;
        }

        .loading-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0d6efd;
          margin-bottom: 0.5rem;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.3s;
        }

        .loading-subtext {
          color: #6c757d;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.5s;
        }

        /* Main container styling */
        .admin-container {
          padding: 3rem 1rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: calc(100vh - 56px);
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }

        .admin-card {
          border-radius: 15px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          opacity: 0;
          transform: translateY(30px);
          animation: slideUp 0.8s ease forwards 0.3s;
          border: none;
        }

        .admin-card:hover {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
          transition: all 0.5s ease;
        }

        /* Header styling */
        .card-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.5s;
        }

        .card-title {
          position: relative;
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0;
          color: #212529;
        }

        .card-title::after {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 0;
          height: 3px;
          width: 0;
          background: #0d6efd;
          border-radius: 3px;
          animation: expandWidth 0.8s ease forwards 0.6s;
        }

        /* Badge styling */
        .teams-count-badge {
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 8px rgba(25, 135, 84, 0.15);
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.6s;
        }

        .teams-count-badge:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(25, 135, 84, 0.2);
        }

        .status-badge {
          padding: 0.4rem 1rem;
          border-radius: 50px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
        }

        .status-badge.active {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
        }

        .status-badge.inactive,
        .status-badge.freeze {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        }

        /* Button styling */
        .action-button {
          border-radius: 50px;
          padding: 0.6rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .action-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .action-button::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }

        .action-button:hover::after {
          transform: translateX(100%);
        }

        .add-button {
          width: 50px;
          height: 40px;
          dorder: 2px solid #0d6efd;
          border-radius: 50%;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          box-shadow: 0 4px 8px rgba(13, 110, 253, 0.2);
          transition: all 0.3s ease;
          border: none;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.7s;
          margin-left: 1rem;
        }

        .add-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 15px rgba(13, 110, 253, 0.3);
        }

        .add-button:active {
          transform: translateY(-1px) scale(0.98);
        }

        .btn-sm.action-button {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
        }

        .btn-outline-success,
        .btn-outline-primary,
        .btn-outline-danger {
          background: white;
        }

        .btn-outline-success:hover {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          border-color: transparent;
        }

        .btn-outline-primary:hover {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border-color: transparent;
        }

        .btn-outline-danger:hover {
          background: linear-gradient(135deg, #dc3545 0%, #bb2d3b 100%);
          border-color: transparent;
        }

        /* Table styling */
        .teams-table {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.8s;
        }

        .teams-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          border-top: none;
          border-bottom: 2px solid #e9ecef;
        }

        .teams-table td {
          vertical-align: middle;
          border-bottom: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .teams-table tr:hover td {
          background-color: #f8f9fa;
        }

        .teams-table tr {
          transition: all 0.3s ease;
        }

        .teams-table tr:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }

        /* Team logo styling */
        .team-logo-container {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .team-logo-container:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .team-placeholder {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
        }

        /* Empty state styling */
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          color: #6c757d;
          background-color: #f8f9fa;
          border-radius: 10px;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.8s;
        }

        .empty-state i {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          opacity: 0.7;
          animation: pulse 2s infinite;
        }

        .empty-state h5 {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          opacity: 0.8;
        }

        /* Modal styling */
        .modal-content {
          border-radius: 15px;
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .modal-header {
          border-bottom: 1px solid #e9ecef;
          background-color: #f8f9fa;
          padding: 1.25rem 1.5rem;
        }

        .modal-header .modal-title {
          font-weight: 700;
          color: #212529;
        }

        .modal-footer {
          border-top: 1px solid #e9ecef;
          padding: 1.25rem 1.5rem;
          background-color: #f8f9fa;
        }

        .modal-body {
          padding: 1.5rem;
        }

        /* Form styling */
        .formGroup {
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }

        .form-label {
          font-weight: 600;
          color: #495057;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .form-control,
        .form-select {
          border-radius: 8px;
          padding: 0.625rem 1rem;
          transition: all 0.3s ease;
          border: 1px solid #dee2e6;
          background-color: #f8f9fa;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
          background-color: #fff;
        }

        /* File upload styling - enhanced */
        .custom-file-upload {
          margin-bottom: 1.5rem;
        }

        .file-upload-wrapper {
          position: relative;
          width: 100%;
          transition: all 0.3s ease;
        }

        .file-upload-label {
          display: block;
          width: 100%;
          min-height: 120px;
          padding: 2rem 1rem;
          background-color: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .file-upload-label:hover {
          border-color: #0d6efd;
          background-color: #f0f7ff;
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(13, 110, 253, 0.1);
        }

        .file-upload-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
        }

        .file-upload-icon {
          font-size: 2rem;
          color: #0d6efd;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .file-upload-label:hover .file-upload-icon {
          transform: translateY(-5px);
        }

        /* Image preview styling */
        .image-preview-container {
          margin-top: 1.5rem;
          transition: all 0.3s ease;
          text-align: center;
          transform: scale(0.95);
          opacity: 0;
          animation: fadeIn 0.5s ease forwards;
        }

        .image-preview-wrapper {
          position: relative;
          display: inline-block;
          border-radius: 50%;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .image-preview-wrapper:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
        }

        .image-preview {
          border-radius: 50%;
          object-fit: cover;
          transition: all 0.3s ease;
        }

        .remove-image-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          opacity: 0.8;
          cursor: pointer;
        }

        .remove-image-btn:hover {
          opacity: 1;
          transform: scale(1.1);
          background-color: #f8d7da;
          color: #dc3545;
        }

        /* Team details modal styling */
        .team-details-header {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }

        .team-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #198754;
          margin-bottom: 1rem;
          position: relative;
          display: inline-block;
        }

        .team-name::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 50px;
          height: 3px;
          background: #198754;
          border-radius: 3px;
        }

        .team-logo-display {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          margin: 0 auto 1.5rem;
          transition: all 0.3s ease;
        }

        .team-logo-display:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
        }

        .team-members-table {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .team-members-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
        }

        .team-members-table td {
          vertical-align: middle;
        }

        .team-members-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #495057;
          position: relative;
          display: inline-block;
        }

        .team-members-title::after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 30px;
          height: 2px;
          background: #0d6efd;
          border-radius: 2px;
        }

        /* Team members table styling */
        .empty-members-message {
          padding: 2rem;
          text-align: center;
          border-radius: 10px;
          background-color: #fff3cd;
          border: 1px solid #ffecb5;
          color: #664d03;
        }

        /* React-select customization */
        .basic-single {
          border-radius: 8px;
          box-shadow: none;
        }

        .select__control {
          border-radius: 8px !important;
          border: 1px solid #dee2e6 !important;
          min-height: 45px !important;
          box-shadow: none !important;
          background-color: #f8f9fa !important;
          transition: all 0.3s ease !important;
        }

        .select__control:hover {
          border-color: #0d6efd !important;
        }

        .select__control--is-focused {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25) !important;
          background-color: #fff !important;
        }

        .select__menu {
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
          z-index: 100;
        }

        .select__option {
          padding: 0.625rem 1rem !important;
          transition: all 0.2s ease !important;
        }

        .select__option--is-selected {
          background-color: #0d6efd !important;
        }

        .select__option--is-focused {
          background-color: #f0f7ff !important;
          color: #0d6efd !important;
        }

        .select__indicator-separator {
          display: none !important;
        }

        .select__dropdown-indicator {
          color: #6c757d !important;
        }

        .select__dropdown-indicator:hover {
          color: #0d6efd !important;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .admin-card {
            border-radius: 12px;
            margin: 0 -0.5rem;
          }

          .card-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }

          .card-header-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            width: 100%;
            margin-bottom: 2rem;
          }

          .badge-container {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .teams-count-badge {
            flex-grow: 1;
            text-align: center;
            max-width: 70%;
            white-space: normal;
            height: auto;
            line-height: 1.5;
            padding: 0.6rem 1rem;
          }

          .add-button {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 9999;
            width: 65px;
            height: 65px;
            font-size: 1.8rem;
            box-shadow: 0 6px 15px rgba(13, 110, 253, 0.4);
            border: 2px solid white;
            margin-left: 0;
          }

          .add-button:hover,
          .add-button:focus,
          .add-button:active {
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(13, 110, 253, 0.5);
          }

          .action-button-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
          }

          .action-button-group .action-button {
            width: 100%;
            padding: 0.6rem 0;
            font-size: 0.9rem;
          }

          /* Table improvements for mobile */
          .teams-table th,
          .teams-table td {
            padding: 0.75rem 0.5rem;
            font-size: 0.9rem;
          }

          .teams-table .team-logo-container {
            margin: 0 auto;
          }

          /* Modal improvements for mobile */
          .modal-title {
            font-size: 1.3rem;
          }

          .modal-body {
            padding: 1rem;
          }

          /* Better form experience on mobile */
          .formGroup {
            margin-bottom: 1.25rem;
          }

          .file-upload-label {
            min-height: 100px;
            padding: 1rem;
          }

          /* Team details view mobile improvements */
          .team-details-header {
            padding: 1.2rem;
          }

          .team-logo-display {
            width: 120px;
            height: 120px;
          }

          .team-members-table th,
          .team-members-table td {
            padding: 0.5rem;
            font-size: 0.85rem;
          }
        }
      `}</style>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <div className="loading-spinner-inner"></div>
          </div>
          <h3 className="loading-text">Loading Cricket Teams</h3>
        </div>
      ) : (
        <div className="admin-container">
          <Container>
            <Card className="admin-card">
              <Card.Body className="p-4">
                <div className="card-header-container">
                  <h2 className="card-title">Cricket Teams</h2>
                  <div
                    className="d-flex align-items-center justify-content-between"
                    style={{ width: "100%", maxWidth: "300px" }}
                  >
                    <Badge
                      bg="success"
                      className="teams-count-badge text-light w-100"
                    >
                      <i className="fas fa-users me-2"></i>
                      Total Teams: {teams.length}
                    </Badge>
                    <Button
                      variant="primary"
                      className="add-button d-none d-md-flex"
                      onClick={() => setShowModal(true)}
                      aria-label="Add new team"
                      style={{
                        zIndex: 1050,
                        position: "relative",
                        // borderRadius: "50%",
                        justifyContent: "center",
                        boxShadow: "0 6px 15px rgba(13, 110, 253, 0.4)",
                        border: "2px solid white",
                      }}
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                </div>

                {/* Mobile floating action button */}
                <Button
                  variant="primary"
                  className="d-md-none mobile-add-button"
                  onClick={() => setShowModal(true)}
                  aria-label="Add new team"
                  style={{
                    position: "fixed",
                    bottom: "2rem",
                    right: "2rem",
                    zIndex: 9999,
                    width: "55px",
                    height: "55px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 15px rgba(13, 110, 253, 0.4)",
                    border: "2px solid white",
                  }}
                >
                  <i className="fas fa-plus" style={{ fontSize: "1.8rem" }}></i>
                </Button>

                {teams.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-users-slash"></i>
                    <h5>No Teams Added Yet</h5>
                    <p>Click the + button to create your first cricket team</p>
                  </div>
                ) : (
                  <Table responsive hover className="teams-table align-middle">
                    <thead>
                      <tr>
                        <th className="px-4 py-3">Logo</th>
                        <th className="px-4 py-3">Team Name</th>
                        <th className="px-4 py-3">Captain/Vice-Captain</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team) => (
                        <tr key={team.id}>
                          <td className="px-4 py-3">
                            <div className="team-logo-container">
                              {team.teamLogoUrl ? (
                                <Image
                                  src={team.teamLogoUrl}
                                  width={50}
                                  height={50}
                                  className="img-fluid"
                                  alt={`${team.name}'s logo`}
                                />
                              ) : (
                                <div className="team-placeholder">
                                  {team.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 fw-semibold">{team.name}</td>
                          <td className="px-4 py-3">
                            <div className="mb-2">
                              <Badge
                                bg="primary"
                                className="me-2 px-2 py-1 text-light"
                              >
                                C
                              </Badge>
                              {team.captain}
                            </div>
                            <div>
                              <Badge
                                bg="info"
                                className="me-2 px-2 py-1 text-light"
                              >
                                VC
                              </Badge>
                              {team.viceCaptain}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="mb-2">
                              <small className="text-muted d-block">
                                Captain:
                              </small>
                              {team.captainPhoneNumber}
                            </div>
                            <div>
                              <small className="text-muted d-block">
                                Vice-Captain:
                              </small>
                              {team.viceCaptainPhoneNumber}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              bg={
                                team.status === "active"
                                  ? "success"
                                  : "secondary"
                              }
                              className={`status-badge ${team.status} text-light`}
                            >
                              {team.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex gap-2 justify-content-center action-button-group">
                              <Button
                                size="sm"
                                variant="outline-success"
                                className="action-button"
                                onClick={() => handleViewTeam(team.id)}
                              >
                                <i className="fas fa-eye me-1"></i> View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                className="action-button ml-1"
                                onClick={() => handleEditTeam(team)}
                              >
                                <i className="fas fa-edit me-1"></i> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                className="action-button ml-1"
                                onClick={() => handleDeleteTeam(team.id)}
                              >
                                <i className="fas fa-trash-alt me-1"></i> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Container>

          {/* Add/Edit Team Modal */}
          <Modal
            show={showModal}
            onHide={() => {
              setShowModal(false);
              setIsEditing(false);
              resetForm();
            }}
            centered
            backdrop="static"
            className="team-modal"
          >
            <Modal.Header>
              <Modal.Title>
                {isEditing ? (
                  <>
                    <i className="fas fa-edit me-2"></i>Edit Team
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle me-2"></i>Add New Cricket
                    Team
                  </>
                )}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={isEditing ? handleUpdateTeam : handleAddTeam}>
              <Modal.Body>
                <Form.Group className="formGroup">
                  <Form.Label>Team Name</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    name="name"
                    value={teamForm.name}
                    onChange={handleFormChange}
                    placeholder="Enter team name"
                  />
                </Form.Group>

                <Form.Group className="formGroup">
                  <Form.Label>Captain*</Form.Label>
                  <Select
                    required
                    value={availableCaptains.find(
                      (c) => c.name === teamForm.captain
                    )}
                    onChange={(selected) =>
                      setTeamForm({
                        ...teamForm,
                        captain: selected ? selected.name : "",
                        captainPhoneNumber: selected
                          ? selected.phoneNumber
                          : "",
                        email: selected ? selected.email : "",
                      })
                    }
                    options={availableCaptains.map((captain) => ({
                      value: captain.id,
                      label: `${captain.name} (${captain.phoneNumber})`,
                      name: captain.name,
                      phoneNumber: captain.phoneNumber,
                      email: captain.email,
                    }))}
                    placeholder="Search and select captain..."
                    isSearchable
                    className="basic-single"
                    classNamePrefix="select"
                    styles={{
                      valueContainer: (base) => ({
                        ...base,
                        backgroundColor: teamForm.captain
                          ? "#e9ecef"
                          : base.backgroundColor,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#212529",
                        fontWeight: teamForm.captain ? "500" : base.fontWeight,
                      }),
                    }}
                  />
                  {teamForm.captain ? (
                    <div className="mt-2">
                      <div className="d-flex align-items-center mb-2">
                        <Badge bg="primary mr-1" className="me-2 px-2 py-1">
                          C
                        </Badge>
                        <span className="fw-medium">{teamForm.captain}</span>
                        <span className="ms-2 text-muted">
                          {" "}
                          - {teamForm.captainPhoneNumber}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Search and select from registered users
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="formGroup">
                  <Form.Label>Vice-Captain*</Form.Label>
                  <Select
                    required
                    value={availableCaptains.find(
                      (c) => c.name === teamForm.viceCaptain
                    )}
                    onChange={(selected) =>
                      setTeamForm({
                        ...teamForm,
                        viceCaptain: selected ? selected.name : "",
                        viceCaptainPhoneNumber: selected
                          ? selected.phoneNumber
                          : "",
                      })
                    }
                    options={availableCaptains.map((captain) => ({
                      value: captain.id,
                      label: `${captain.name} (${
                        captain.phoneNumber || "No phone"
                      })`,
                      name: captain.name,
                      phoneNumber: captain.phoneNumber,
                      email: captain.email,
                      isDisabled: teamForm.captain === captain.name,
                    }))}
                    placeholder="Search and select vice-captain..."
                    isSearchable
                    className="basic-single"
                    classNamePrefix="select"
                    styles={{
                      valueContainer: (base) => ({
                        ...base,
                        backgroundColor: teamForm.viceCaptain
                          ? "#e9ecef"
                          : base.backgroundColor,
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: "#212529",
                        fontWeight: teamForm.viceCaptain
                          ? "500"
                          : base.fontWeight,
                      }),
                    }}
                  />
                  {teamForm.viceCaptain ? (
                    <div className="mt-2">
                      <div className="d-flex align-items-center mb-2">
                        <Badge bg="info mr-1" className="me-2 px-2 py-1">
                          VC
                        </Badge>
                        <span className="fw-medium">
                          {teamForm.viceCaptain}
                        </span>
                        <span className="ms-2 text-muted">
                          {" "}
                          - {teamForm.viceCaptainPhoneNumber}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Search and select from registered users (cannot be the
                      same as captain)
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="formGroup">
                  <Form.Label>Team Logo</Form.Label>
                  <div className="custom-file-upload">
                    <div className="file-upload-wrapper">
                      <label
                        htmlFor="teamLogo"
                        className="file-upload-label d-flex flex-column align-items-center justify-content-center"
                      >
                        <i className="fas fa-cloud-upload-alt mb-2 text-primary file-upload-icon"></i>
                        <span className="text-center">
                          {file
                            ? file.name
                            : "Drag & Drop or Click to Select Team Logo"}
                        </span>
                        <small className="text-muted mt-1">
                          JPEG, PNG, or JPG (Max 400 KB)
                        </small>
                      </label>
                      <Form.Control
                        type="file"
                        name="file"
                        id="teamLogo"
                        required={!isEditing}
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className="file-upload-input"
                      />
                    </div>
                  </div>

                  {preview && (
                    <div className="image-preview-container">
                      <div className="image-preview-wrapper">
                        <img
                          src={preview}
                          width={120}
                          height={120}
                          alt="Team Logo Preview"
                          className="image-preview"
                        />
                        <Button
                          variant="light"
                          size="sm"
                          className="remove-image-btn"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="formGroup">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={teamForm.status}
                    onChange={handleFormChange}
                  >
                    <option value="freeze">Freeze</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Modal.Body>

              <Modal.Footer>
                <Button
                  variant="outline-secondary"
                  className="action-button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditing(false);
                    resetForm();
                  }}
                >
                  <i className="fas fa-times me-1"></i> Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="action-button"
                >
                  {isEditing ? (
                    <>
                      <i className="fas fa-save me-1"></i> Update Team
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus-circle me-1"></i> Add Team
                    </>
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* View Team Details Modal */}
          <Modal
            show={viewShowModal}
            onHide={() => {
              setViewShowModal(false);
              setViewTeamDetails(null);
              setTeamMembers([]);
            }}
            size="lg"
            centered
            className="view-team-modal"
          >
            <Modal.Header>
              <Modal.Title>
                <i className="fas fa-users me-2 mr-1"></i>
                Team Details
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {viewTeamDetails && (
                <Container>
                  <div className="team-details-header">
                    <h4 className="team-name">{viewTeamDetails.name}</h4>

                    {viewTeamDetails.teamLogoUrl && (
                      <div className="text-center">
                        <div className="team-logo-display">
                          <Image
                            src={viewTeamDetails.teamLogoUrl}
                            width={150}
                            height={150}
                            alt="Team Logo"
                            className="img-fluid"
                          />
                        </div>
                      </div>
                    )}

                    <div className="d-flex flex-wrap justify-content-around mt-4">
                      <div className="text-center mb-3">
                        <Badge
                          bg="primary"
                          className="px-3 py-2 rounded-pill text-light"
                        >
                          Captain
                        </Badge>
                        <h5 className="mt-2 mb-0">{viewTeamDetails.captain}</h5>
                        <p className="text-muted">
                          {viewTeamDetails.captainPhoneNumber}
                        </p>
                      </div>

                      <div className="text-center mb-3">
                        <Badge
                          bg="info"
                          className="px-3 py-2 rounded-pill text-light"
                        >
                          Vice Captain
                        </Badge>
                        <h5 className="mt-2 mb-0">
                          {viewTeamDetails.viceCaptain}
                        </h5>
                        <p className="text-muted">
                          {viewTeamDetails.viceCaptainPhoneNumber}
                        </p>
                      </div>

                      <div className="text-center mb-3">
                        <Badge
                          bg={
                            viewTeamDetails.status === "active"
                              ? "success"
                              : "secondary"
                          }
                          className="px-3 py-2 rounded-pill text-light"
                        >
                          {viewTeamDetails.status.toUpperCase()}
                        </Badge>
                        <h5 className="mt-2 mb-0">Team Status</h5>
                        <p className="text-muted">
                          Created:{" "}
                          {new Date(
                            viewTeamDetails.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h5 className="team-members-title">Team Members</h5>

                  {teamMembers.length > 0 ? (
                    <Table responsive striped className="team-members-table">
                      <thead>
                        <tr>
                          <th>Profile</th>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Contact</th>
                          <th>Jersey Name</th>
                          <th>Jersey No</th>
                          <th>Jersey Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.map((member) => (
                          <tr key={member.id}>
                            <td>
                              {availableCaptains.find(
                                (c) =>
                                  c.id ===
                                  viewTeamDetails.players.find(
                                    (p) => p.name === member.name
                                  )?.userId
                              )?.photoURL ? (
                                <img
                                  src={
                                    availableCaptains.find(
                                      (c) =>
                                        c.id ===
                                        viewTeamDetails.players.find(
                                          (p) => p.name === member.name
                                        )?.userId
                                    )?.photoURL
                                  }
                                  alt={member.name}
                                  style={{
                                    width: "60px",
                                    height: "60px",
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
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </td>
                            <td className="fw-semibold">{member.name}</td>
                            <td>{member.role || "-"}</td>
                            {/* <td>
                              <Badge
                                bg={
                                  member.role === "Captain"
                                    ? "primary"
                                    : member.role === "Vice Captain"
                                    ? "info"
                                    : "secondary"
                                }
                                className="rounded-pill px-2 text-light"
                              >
                                {member.role}
                              </Badge>
                            </td> */}
                            <td>{member.phoneNumber}</td>
                            <td>{member.jerseyName || "-"}</td>
                            <td>{member.jerseyNumber || "-"}</td>
                            <td>
                              {member.jerseySize
                                ? member.jerseySize.toUpperCase()
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Alert variant="warning" className="empty-members-message">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      No team members added yet.
                    </Alert>
                  )}
                </Container>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                className="action-button"
                onClick={() => setViewShowModal(false)}
              >
                <i className="fas fa-times me-1 mr-1"></i>
                Close
              </Button>
              <Button
                variant="primary"
                className="action-button"
                onClick={printTeamDetails}
              >
                <i className="fas fa-print me-1 mr-1"></i>
                Print
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
}
