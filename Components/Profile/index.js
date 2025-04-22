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
        @keyframes floatUp {
          from {
            transform: translateY(40px);
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
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
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(13, 110, 253, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
          }
        }

        @keyframes glow {
          0% {
            box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
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

        @keyframes wave {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0);
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
          animation: fadeIn 0.5s ease forwards 0.3s,
            pulse 2s ease-in-out infinite alternate;
        }

        .loading-subtext {
          color: #6c757d;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.5s;
        }

        /* Profile card styling */
        .profile-container {
          padding: 3rem 1rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: calc(100vh - 56px);
        }

        .profile-card {
          border-radius: 15px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transform: translateY(40px);
          opacity: 0;
          animation: floatUp 0.8s ease forwards;
          border: none;
        }

        .profile-card:hover {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
          transform: translateY(-5px);
          transition: all 0.5s ease;
        }

        .profile-section {
          padding: 2rem;
          border-radius: 15px;
        }

        /* Profile image styling */
        .profile-header {
          position: relative;
        }

        .profile-bg {
          height: 120px;
          width: 100%;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          position: relative;
          overflow: hidden;
        }

        .profile-bg::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
        }

        .profile-image-container {
          position: relative;
          display: inline-block;
          margin-top: -60px;
          border-radius: 50%;
          padding: 5px;
          background: white;
          z-index: 1;
          opacity: 0;
          animation: fadeIn 0.8s ease forwards 0.3s;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .profile-image {
          transition: all 0.3s ease;
          border: 4px solid #0d6efd !important;
          box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.8);
        }

        .profile-image-container:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }

        .profile-image-container::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          box-shadow: 0 0 0 8px rgba(13, 110, 253, 0.3);
          animation: pulse 2s infinite;
          pointer-events: none;
          z-index: -1;
        }

        .profile-placeholder {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6c757d;
          font-size: 3rem;
          font-weight: 700;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        /* Profile content styling */
        .profile-name {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 0.5rem;
          color: #212529;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 0.6s;
          position: relative;
          display: inline-block;
        }

        .profile-name::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          height: 3px;
          background: #0d6efd;
          border-radius: 3px;
          animation: expandWidth 0.5s ease forwards 0.8s;
        }

        .info-label {
          color: #6c757d;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
          margin-bottom: 0.25rem;
        }

        .info-value {
          color: #212529;
          font-weight: 500;
          background-color: #f8f9fa;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border-left: 3px solid #0d6efd;
          transition: all 0.3s ease;
        }

        .info-value:hover {
          background-color: #e9ecef;
          transform: translateX(5px);
        }

        .profile-detail {
          margin-bottom: 1.25rem;
          opacity: 0;
          transform: translateX(20px);
          animation: slideInRight 0.5s ease forwards;
        }

        .profile-detail:nth-child(1) {
          animation-delay: 0.7s;
        }
        .profile-detail:nth-child(2) {
          animation-delay: 0.8s;
        }
        .profile-detail:nth-child(3) {
          animation-delay: 0.9s;
        }
        .profile-detail:nth-child(4) {
          animation-delay: 1s;
        }
        .profile-detail:nth-child(5) {
          animation-delay: 1.1s;
        }
        .profile-detail:nth-child(6) {
          animation-delay: 1.2s;
        }
        .profile-detail:nth-child(7) {
          animation-delay: 1.3s;
        }
        .profile-detail:nth-child(8) {
          animation-delay: 1.4s;
        }

        /* Team badge styling */
        .team-badge {
          padding: 0.5rem 1rem;
          border-radius: 30px;
          font-weight: 600;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 8px rgba(13, 110, 253, 0.15);
          transition: all 0.3s ease;
          animation: pulse 3s infinite;
        }

        .team-badge:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 16px rgba(13, 110, 253, 0.2);
        }

        .badge {
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        /* Button styling */
        .profile-buttons {
          opacity: 0;
          animation: fadeIn 0.8s ease forwards 1.6s;
          padding-top: 1.5rem;
          margin-top: 1.5rem;
          border-top: 1px solid #dee2e6;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
        }

        .profile-btn {
          border-radius: 50px;
          padding: 0.6rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .profile-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .profile-btn::after {
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

        .profile-btn:hover::after {
          transform: translateX(100%);
        }

        .btn-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border: none;
        }

        .btn-outline-success {
          border-color: #198754;
          color: #198754;
        }

        .btn-outline-success:hover {
          background: linear-gradient(135deg, #198754 0%, #157347 100%);
          color: white;
          border-color: transparent;
        }

        .btn-outline-primary {
          border-color: #0d6efd;
          color: #0d6efd;
        }

        .btn-outline-primary:hover {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          color: white;
          border-color: transparent;
        }

        .edit-button-glow {
          animation: glow 1.5s ease-in-out;
        }

        /* Icon styling */
        .btn i {
          margin-right: 0.5rem;
          transition: all 0.3s ease;
        }

        .btn:hover i {
          transform: translateY(-2px);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .profile-card {
            border-radius: 12px;
          }

          .profile-section {
            padding: 1.5rem;
          }

          .profile-image-container {
            margin-top: -50px;
          }

          .profile-name {
            font-size: 1.5rem;
          }

          .profile-buttons {
            flex-direction: column;
            align-items: center;
          }

          .profile-btn {
            width: 100%;
            margin-bottom: 0.5rem;
            text-align: center;
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
          <Container>
            <Card className="profile-card">
              <div className="profile-header">
                <div className="profile-bg"></div>
                <div className="text-center">
                  {userData?.photoURL ? (
                    <div className="profile-image-container">
                      <Image
                        src={userData.photoURL}
                        alt="Profile"
                        width={150}
                        height={150}
                        className="profile-image rounded-circle"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="profile-image-container">
                      <div className="profile-placeholder">
                        {userData?.displayName?.charAt(0) || "U"}
                      </div>
                    </div>
                  )}
                  <h2 className="profile-name">{userData?.displayName}</h2>
                </div>
              </div>

              <Card.Body className="profile-section">
                <Row className="g-4">
                  <Col lg={6}>
                    <div className="profile-detail">
                      <div className="info-label">Full Name</div>
                      <div className="info-value">
                        {userData?.displayName || "Not provided"}
                      </div>
                    </div>

                    <div className="profile-detail">
                      <div className="info-label">Email Address</div>
                      <div className="info-value">
                        {userData?.email || "Not provided"}
                      </div>
                    </div>

                    <div className="profile-detail">
                      <div className="info-label">Phone Number</div>
                      <div className="info-value">
                        {userData?.phoneNumber || "Not provided"}
                      </div>
                    </div>

                    <div className="profile-detail">
                      <div className="info-label">Date of Birth</div>
                      <div className="info-value">
                        {userData?.dateOfBirth || "Not provided"}
                        {userData?.dateOfBirth && (
                          <Badge bg="secondary" className="ms-2 text-light ml-1">
                            {calculateAge(userData.dateOfBirth)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="profile-detail">
                      <div className="info-label">Address</div>
                      <div className="info-value">
                        {userData?.address ? (
                          <>
                            {userData.address.street && (
                              <div>{userData.address.street}</div>
                            )}
                            <div>
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

                    <div className="profile-detail">
                      <div className="info-label">Last Login</div>
                      <div className="info-value">
                        {userData?.lastLogin
                          ? new Date(userData.lastLogin).toLocaleString()
                          : "Not available"}
                      </div>
                    </div>

                    {userData?.isAdmin && (
                      <div className="profile-detail">
                        <div className="info-label">Access Level</div>
                        <div className="info-value">
                          <Badge bg="danger" className="px-3 py-2 text-light">
                            Administrator
                          </Badge>
                        </div>
                      </div>
                    )}

                    {teamData && (
                      <div className="profile-detail">
                        <div className="info-label">Cricket Team</div>
                        <div className="info-value d-flex align-items-center flex-wrap gap-2">
                          <span>Member of</span>
                          <Badge
                            bg="primary"
                            className="team-badge px-3 py-2 ms-2 text-light ml-1"
                          >
                            {teamData.name}
                          </Badge>
                          {(teamData.isCaptain ||
                            teamData.role === "Captain") && (
                            <Badge
                              bg="success"
                              className="px-3 py-2 text-light ml-1"
                            >
                              Team Captain
                            </Badge>
                          )}
                          {(teamData.isViceCaptain ||
                            teamData.role === "Vice Captain") && (
                            <Badge bg="info" className="px-3 py-2 text-light ml-1">
                              Vice Captain
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>

                <div className="profile-buttons">
                  <Button
                    variant="primary"
                    onClick={() => router.push("/")}
                    className="profile-btn"
                  >
                    <i className="fas fa-home"></i>
                    Home
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => router.push("/profile/edit")}
                    className={`profile-btn ${
                      animateEdit ? "edit-button-glow" : ""
                    }`}
                  >
                    <i className="fas fa-edit"></i>
                    Edit Profile
                  </Button>

                  {teamData && (
                    <Button
                      variant="outline-success"
                      disabled={true}
                      onClick={() => router.push(`/team/${teamData.id}`)}
                      className="profile-btn"
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
                        className="profile-btn"
                      >
                        <i className="fas fa-user-cog"></i>
                        Manage Team
                      </Button>
                    )}

                  {userData?.isAdmin && (
                    <Button
                      variant="outline-primary"
                      onClick={() => router.push("/adminpanel")}
                      className="profile-btn"
                    >
                      <i className="fas fa-users-cog"></i>
                      Admin Panel
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Container>
        </div>
      )}
    </>
  );
}
