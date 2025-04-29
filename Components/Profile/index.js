import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Container, Card, Row, Col, Button, Badge } from "react-bootstrap";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Header from "../../Components/Header";
import Meta from "../../Components/Meta";

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState(null);
  const [animateEdit, setAnimateEdit] = useState(false);

  const fetchTeamData = async (userData) => {
    if (!userData?.phoneNumber) {
      console.error("No phone number found for user");
      return;
    }

    try {
      const teamsRef = collection(db, "cricket_teams");
      const userPhone = userData.phoneNumber;

      // First check if user is a team owner (captain or viceCaptain)
      const teamQuery = query(
        teamsRef,
        where("captainPhoneNumber", "==", userPhone)
      );
      const teamSnapshot = await getDocs(teamQuery);

      // Check if user is vice captain
      const viceCaptainQuery = query(
        teamsRef,
        where("viceCaptainPhoneNumber", "==", userPhone)
      );
      const viceCaptainSnapshot = await getDocs(viceCaptainQuery);

      let foundAsOwner = false;

      if (!teamSnapshot.empty) {
        const teamDoc = teamSnapshot.docs[0];
        const teamData = teamDoc.data();
        foundAsOwner = true;
        setTeamData({
          id: teamDoc.id,
          ...teamData,
          role: "Captain",
          jerseyNumber:
            teamData.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseyNumber || "",
          jerseyName:
            teamData.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseyName || "",
          jerseySize:
            teamData.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseySize || "",
          isCaptain: true,
          isViceCaptain: false,
        });
      } else if (!viceCaptainSnapshot.empty) {
        const teamDoc = viceCaptainSnapshot.docs[0];
        const teamData = teamDoc.data();
        foundAsOwner = true;
        setTeamData({
          id: teamDoc.id,
          ...teamData,
          role: "Vice Captain",
          jerseyNumber:
            teamData.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseyNumber || "",
          jerseyName:
            teamData.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseyName || "",
          jerseySize:
            teamData.players?.find((p) => p.phoneNumber === userPhone)
              ?.jerseySize || "",
          isCaptain: false,
          isViceCaptain: true,
        });
      }

      if (!foundAsOwner) {
        // Then check if user exists in any team's players array
        const teamsSnapshot = await getDocs(teamsRef);
        let playerTeam = null;

        // Search through all teams for matching player
        for (const doc of teamsSnapshot.docs) {
          const team = doc.data();
          const playerMatch = team.players?.find(
            (player) => player.phoneNumber === userPhone
          );
          if (playerMatch) {
            playerTeam = { id: doc.id, ...team, playerDetails: playerMatch };
            break;
          }
        }

        if (playerTeam) {
          setTeamData({
            id: playerTeam.id,
            name: playerTeam.name,
            role: "Player",
            jerseyNumber: playerTeam.playerDetails.jerseyNumber || "",
            jerseyName: playerTeam.playerDetails.jerseyName || "",
            jerseySize: playerTeam.playerDetails.jerseySize || "",
            isCaptain: playerTeam.playerDetails.isCaptain || false,
            isViceCaptain: playerTeam.playerDetails.isViceCaptain || false,
          });
        } else {
          console.log("User not found in any team");
          setTeamData(null);
        }
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      setTeamData(null);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = { ...userSnap.data(), id: user.uid };
          setUserData(userData);
          await fetchTeamData(userData); // Pass the full userData object
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const calculateAge = (dateOfBirth) => {
    try {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return "Invalid date";
      }
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return `${age} years`;
    } catch (error) {
      console.error("Error calculating age:", error);
      return "Error calculating age";
    }
  };

  return (
    <>
      <Meta
        title={userData ? `${userData.displayName} | Profile` : "Profile"}
      />
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

        @keyframes slideInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
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

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes borderPulse {
          0% {
            border-color: rgba(13, 110, 253, 0.7);
          }
          50% {
            border-color: rgba(13, 110, 253, 0.3);
          }
          100% {
            border-color: rgba(13, 110, 253, 0.7);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        /* Loading animation styling */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 75vh;
          text-align: center;
          background: linear-gradient(165deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .loading-spinner-container {
          position: relative;
          width: 100px;
          height: 100px;
          margin-bottom: 2.5rem;
        }

        .loading-spinner {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 5px solid rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          border-top-color: #0d6efd;
          animation: spin 1.2s linear infinite;
        }

        .loading-spinner-inner {
          position: absolute;
          top: 20px;
          left: 20px;
          width: 60px;
          height: 60px;
          border: 5px solid rgba(13, 110, 253, 0.15);
          border-radius: 50%;
          border-top-color: #0d6efd;
          opacity: 0.7;
          animation: spin 0.8s linear infinite reverse;
        }

        .loading-text {
          font-size: 1.8rem;
          font-weight: 700;
          color: #0d6efd;
          margin-bottom: 0.8rem;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards 0.3s;
          background: linear-gradient(90deg, #0d6efd, #0099ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .loading-subtext {
          color: #6c757d;
          font-size: 1.1rem;
          opacity: 0;
          animation: fadeIn 0.6s ease forwards 0.6s;
        }

        /* Main profile styles */
        .profile-container {
          min-height: calc(100vh - 56px);
          background: linear-gradient(165deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 3rem 1rem;
        }

        .profile-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
        }

        .profile-header-card {
          border: none;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
          margin-bottom: 1.5rem;
          background: white;
          opacity: 0;
          animation: slideInUp 0.8s ease forwards;
        }

        .profile-header-bg {
          height: 180px;
          background: linear-gradient(135deg, #3a7bd5, #00d2ff);
          position: relative;
        }

        .profile-header-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.1;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .profile-image-outer {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: white;
          padding: 6px;
          margin: -90px auto 0;
          position: relative;
          z-index: 2;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          opacity: 0;
          animation: scaleIn 0.8s ease forwards 0.3s;
        }

        .profile-image-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #3a7bd5;
          animation: borderPulse 3s infinite;
        }

        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #3a7bd5, #00d2ff);
        }

        .profile-name-section {
          text-align: center;
          padding: 1rem 1rem 2rem;
          opacity: 0;
          animation: fadeIn 0.8s ease forwards 0.5s;
        }

        .profile-name {
          font-size: 2.2rem;
          font-weight: 700;
          color: #212529;
          margin-bottom: 0.5rem;
          position: relative;
          display: inline-block;
        }

        .profile-name::after {
          content: "";
          position: absolute;
          bottom: -12px;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3a7bd5, #00d2ff);
          border-radius: 2px;
          width: 60px;
          margin: 0 auto;
        }

        .profile-team-badge {
          display: inline-block;
          margin-top: 1.5rem;
          padding: 0.6rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1rem;
          color: white !important;
          background: linear-gradient(90deg, #3a7bd5, #00d2ff);
          box-shadow: 0 5px 15px rgba(58, 123, 213, 0.3);
          transition: all 0.3s ease;
          animation: fadeIn 0.8s ease forwards 0.8s;
          opacity: 0;
        }

        .profile-team-badge:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(58, 123, 213, 0.4);
        }

        .role-badge {
          display: inline-block;
          margin: 0.5rem 0.5rem 0;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
          opacity: 0;
          animation: fadeIn 0.8s ease forwards 1s;
        }

        .captain-badge {
          background: linear-gradient(90deg, #28a745, #20c997);
          color: white !important;
          box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3);
        }

        .vice-captain-badge {
          background: linear-gradient(90deg, #17a2b8, #0dcaf0);
          color: white !important;
          box-shadow: 0 4px 10px rgba(23, 162, 184, 0.3);
        }

        /* Profile details card */
        .profile-details-card {
          border: none;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
          background: white;
          opacity: 0;
          animation: slideInUp 0.8s ease forwards 0.2s;
        }

        .profile-details-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          background: linear-gradient(
            to right,
            rgba(58, 123, 213, 0.05),
            rgba(0, 210, 255, 0.05)
          );
        }

        .profile-details-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #3a7bd5;
          position: relative;
          display: inline-block;
          padding-left: 15px;
        }

        .profile-details-title::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: linear-gradient(to bottom, #3a7bd5, #00d2ff);
          border-radius: 5px;
        }

        .profile-details-body {
          padding: 2rem;
        }

        .detail-group {
          margin-bottom: 2rem;
          opacity: 0;
        }

        .detail-group:nth-child(odd) {
          animation: slideInLeft 0.8s ease forwards
            calc(0.7s + (var(--i) * 0.1s));
        }

        .detail-group:nth-child(even) {
          animation: slideInRight 0.8s ease forwards
            calc(0.7s + (var(--i) * 0.1s));
        }

        .detail-label {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6c757d;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        .detail-label i {
          margin-right: 0.5rem;
          color: #3a7bd5;
          font-size: 1.1rem;
        }

        .detail-value {
          background-color: #f8f9fa;
          border-radius: 10px;
          padding: 1rem 1.25rem;
          position: relative;
          font-weight: 500;
          color: #212529;
          transition: all 0.3s ease;
          border-left: 4px solid #3a7bd5;
          overflow: hidden;
        }

        .detail-value::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: linear-gradient(to bottom, #3a7bd5, #00d2ff);
        }

        .detail-value:hover {
          transform: translateX(8px);
          background-color: #f0f7ff;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .detail-value .badge {
          margin-left: 0.5rem;
          font-weight: 600;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
        }

        /* Address formatting */
        .address-line {
          margin-bottom: 0.25rem;
        }

        .address-line:last-child {
          margin-bottom: 0;
        }

        /* Admin badge */
        .admin-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: linear-gradient(90deg, #dc3545, #fd7e14);
          color: white !important;
          border-radius: 8px;
          font-weight: 600;
          box-shadow: 0 4px 10px rgba(220, 53, 69, 0.3);
        }

        /* Action buttons section */
        .profile-actions {
          margin-top: 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          opacity: 0;
          animation: fadeIn 0.8s ease forwards 1.3s;
          padding-top: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .profile-action-btn {
          padding: 0.9rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          min-width: 180px;
          position: relative;
          overflow: hidden;
        }

        .profile-action-btn::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: -100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.3),
            rgba(255, 255, 255, 0)
          );
          transition: all 0.6s ease;
        }

        .profile-action-btn:hover::after {
          left: 100%;
        }

        .profile-action-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .profile-action-btn i {
          margin-right: 0.75rem;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .profile-action-btn:hover i {
          transform: translateY(-3px);
        }

        .btn-home {
          background: linear-gradient(90deg, #3a7bd5, #00d2ff);
          border: none;
          color: white;
        }

        .btn-edit {
          background: linear-gradient(90deg, #6c5ce7, #a29bfe);
          border: none;
          color: white;
        }

        .btn-team {
          background: white;
          border: 2px solid #20c997;
          color: #20c997;
        }

        .btn-team:hover {
          background: linear-gradient(90deg, #20c997, #0acf97);
          color: white;
          border-color: transparent;
        }

        .btn-manage {
          background: white;
          border: 2px solid #28a745;
          color: #28a745;
        }

        .btn-manage:hover {
          background: linear-gradient(90deg, #28a745, #20c997);
          color: white;
          border-color: transparent;
        }

        .btn-admin {
          background: white;
          border: 2px solid #dc3545;
          color: #dc3545;
        }

        .btn-admin:hover {
          background: linear-gradient(90deg, #dc3545, #fd7e14);
          color: white;
          border-color: transparent;
        }

        /* Animation for edit button glow */
        .edit-button-glow {
          animation: editGlow 2s ease-in-out;
        }

        @keyframes editGlow {
          0% {
            box-shadow: 0 5px 15px rgba(108, 92, 231, 0.3);
          }
          50% {
            box-shadow: 0 5px 30px rgba(108, 92, 231, 0.8);
          }
          100% {
            box-shadow: 0 5px 15px rgba(108, 92, 231, 0.3);
          }
        }

        /* Responsive styles */
        @media (max-width: 992px) {
          .profile-image-outer {
            width: 160px;
            height: 160px;
            margin: -80px auto 0;
          }

          .profile-name {
            font-size: 2rem;
          }

          .profile-details-body {
            padding: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 1.5rem 0.5rem;
          }

          .profile-header-bg {
            height: 150px;
          }

          .profile-image-outer {
            width: 140px;
            height: 140px;
            margin: -70px auto 0;
          }

          .profile-name {
            font-size: 1.8rem;
          }

          .profile-team-badge {
            padding: 0.5rem 1.2rem;
            font-size: 1rem;
          }

          .profile-details-header {
            padding: 1.25rem 1.5rem;
          }

          .profile-details-title {
            font-size: 1.3rem;
          }

          .profile-details-body {
            padding: 1.25rem;
          }

          .detail-value {
            padding: 0.9rem 1rem;
          }

          .profile-actions {
            flex-direction: column;
            gap: 0.8rem;
          }

          .profile-action-btn {
            width: 100%;
          }
        }

        @media (max-width: 576px) {
          .profile-header-bg {
            height: 130px;
          }

          .profile-image-outer {
            width: 120px;
            height: 120px;
            margin: -60px auto 0;
          }

          .profile-name {
            font-size: 1.6rem;
          }

          .profile-placeholder {
            font-size: 3rem;
          }

          .detail-label {
            font-size: 0.8rem;
          }

          .detail-value {
            padding: 0.8rem 0.9rem;
            font-size: 0.95rem;
          }

          .profile-action-btn {
            padding: 0.8rem 1rem;
            font-size: 1rem;
          }
        }
      `}</style>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <div className="loading-spinner-inner"></div>
          </div>
          <h2 className="loading-text">Loading Your Profile</h2>
          <p className="loading-subtext">
            Please wait while we fetch your information...
          </p>
        </div>
      ) : (
        <div className="profile-container">
          <div className="profile-wrapper">
            {/* Profile Header Card */}
            <Card className="profile-header-card">
              <div className="profile-header-bg">
                <div className="profile-header-pattern"></div>
              </div>

              <div className="profile-image-outer">
                <div className="profile-image-inner">
                  {userData?.photoURL ? (
                    <Image
                      src={userData.photoURL}
                      alt="Profile"
                      width={180}
                      height={180}
                      className="profile-image"
                      priority
                    />
                  ) : (
                    <div className="profile-placeholder">
                      {userData?.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-name-section">
                <h2 className="profile-name">{userData?.displayName}</h2>

                {teamData && (
                  <>
                    <div className="profile-team-badge">{teamData.name}</div>

                    {(teamData.isCaptain || teamData.role === "Captain") && (
                      <div className="role-badge captain-badge">
                        <i className="fas fa-crown me-1"></i> Team Captain
                      </div>
                    )}

                    {(teamData.isViceCaptain ||
                      teamData.role === "Vice Captain") && (
                      <div className="role-badge vice-captain-badge">
                        <i className="fas fa-chess-knight me-1"></i> Vice
                        Captain
                      </div>
                    )}
                  </>
                )}

                {userData?.isAdmin && (
                  <div className="admin-badge mt-2">
                    <i className="fas fa-user-shield me-1"></i> Administrator
                  </div>
                )}
              </div>
            </Card>

            {/* Profile Details Card */}
            <Card className="profile-details-card">
              <div className="profile-details-header">
                <h3 className="profile-details-title">Personal Information</h3>
              </div>

              <div className="profile-details-body">
                <Row className="g-4">
                  <Col lg={6}>
                    <div className="detail-group" style={{ "--i": 1 }}>
                      <div className="detail-label">
                        <i className="fas fa-user"></i> Full Name
                      </div>
                      <div className="detail-value">
                        {userData?.displayName || "Not provided"}
                      </div>
                    </div>

                    <div className="detail-group" style={{ "--i": 2 }}>
                      <div className="detail-label">
                        <i className="fas fa-envelope"></i> Email Address
                      </div>
                      <div className="detail-value">
                        {userData?.email || "Not provided"}
                      </div>
                    </div>

                    <div className="detail-group" style={{ "--i": 3 }}>
                      <div className="detail-label">
                        <i className="fas fa-phone-alt"></i> Phone Number
                      </div>
                      <div className="detail-value">
                        {userData?.phoneNumber || "Not provided"}
                      </div>
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="detail-group" style={{ "--i": 1 }}>
                      <div className="detail-label">
                        <i className="fas fa-birthday-cake"></i> Date of Birth
                      </div>
                      <div className="detail-value">
                        {userData?.dateOfBirth || "Not provided"}
                        {userData?.dateOfBirth && (
                          <Badge bg="secondary" className="ms-2 text-light">
                            {calculateAge(userData.dateOfBirth)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="detail-group" style={{ "--i": 2 }}>
                      <div className="detail-label">
                        <i className="fas fa-map-marker-alt"></i> Address
                      </div>
                      <div className="detail-value">
                        {userData?.address ? (
                          <>
                            {userData.address.street && (
                              <div className="address-line">
                                {userData.address.street}
                              </div>
                            )}
                            <div className="address-line">
                              {[
                                userData.address.city,
                                userData.address.state,
                                userData.address.pincode,
                              ]
                                .filter(Boolean)
                                .join(", ") || "Not provided"}
                            </div>
                          </>
                        ) : (
                          "Not provided"
                        )}
                      </div>
                    </div>

                    <div className="detail-group" style={{ "--i": 3 }}>
                      <div className="detail-label">
                        <i className="fas fa-clock"></i> Last Login
                      </div>
                      <div className="detail-value">
                        {userData?.lastLogin
                          ? new Date(userData.lastLogin).toLocaleString()
                          : "Not available"}
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="profile-actions">
                  <Button
                    variant="primary"
                    onClick={() => router.push("/")}
                    className="profile-action-btn btn-home"
                  >
                    <i className="fas fa-home"></i>
                    Home
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => router.push("/profile/edit")}
                    className={`profile-action-btn btn-edit ${
                      animateEdit ? "edit-button-glow" : ""
                    }`}
                  >
                    <i className="fas fa-edit"></i>
                    Edit Profile
                  </Button>

                  {teamData && (
                    <Button
                      variant="outline-success"
                      // disabled={true}
                      onClick={() => router.push(`/team/${teamData.id}`)}
                      className="profile-action-btn btn-team"
                    >
                      <i className="fas fa-users"></i>
                      View Team
                    </Button>
                  )}

                  {teamData &&
                    (userData.phoneNumber === teamData.captainPhoneNumber ||
                      userData.phoneNumber ===
                        teamData.viceCaptainPhoneNumber) && (
                      <Button
                        variant="outline-success"
                        // disabled={true}
                        onClick={() =>
                          router.push(`/team/manage/${teamData.id}`)
                        }
                        className="profile-action-btn btn-manage"
                      >
                        <i className="fas fa-user-cog"></i>
                        Manage Team
                      </Button>
                    )}

                  {userData?.isAdmin && (
                    <Button
                      variant="outline-primary"
                      onClick={() => router.push("/adminpanel")}
                      className="profile-action-btn btn-admin"
                    >
                      <i className="fas fa-users-cog"></i>
                      Admin Panel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
