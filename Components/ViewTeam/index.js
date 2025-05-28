import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/firebase";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import PlayerCard from "../PlayerCard";
import { Container, Spinner, Card, Row, Col, Badge } from "react-bootstrap";

const ViewTeam = () => {
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});
  const { teamId } = router.query;

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
    }
  }, [teamId]);

  const fetchTeam = async (teamId) => {
    try {
      const teamDoc = await getDoc(doc(db, "cricket_teams", teamId));
      if (teamDoc.exists()) {
        const teamData = teamDoc.data();
        setTeam(teamData);

        // Fetch profile photos for team members
        if (teamData.players && teamData.players.length > 0) {
          const userProfilesObj = {};
          const userPromises = teamData.players
            .filter((player) => player.userId)
            .map(async (player) => {
              try {
                const userDoc = await getDoc(doc(db, "users", player.userId));
                if (userDoc.exists()) {
                  userProfilesObj[player.userId] = {
                    photoURL: userDoc.data().photoURL || null,
                    displayName:
                      userDoc.data().displayName || userDoc.data().name,
                  };
                }
              } catch (err) {
                console.error("Error fetching user data:", err);
              }
            });

          await Promise.all(userPromises);
          setUserProfiles(userProfilesObj);
        }
      } else {
        console.error("No such team!");
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !team) {
    return (
      <Container
        className="py-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <Spinner animation="border" role="status" variant="primary"></Spinner>
      </Container>
    );
  }

  return (
    <div className="team-page-wrapper">
      <Container>
        <Card className="team-header-card mb-5 border-0 shadow-sm">
          <Card.Body className="p-0">
            <Row className="g-0">
              <Col
                md={4}
                className="d-flex justify-content-center align-items-center team-logo-container p-4"
              >
                <div className="responsive-image-container">
                  <Image
                    src={team.teamLogoUrl}
                    alt={`${team.name} logo`}
                    width={200}
                    height={200}
                    priority
                    className="team-logo"
                    sizes="(max-width: 768px) 150px, (max-width: 1200px) 180px, 200px"
                  />
                </div>
              </Col>
              <Col md={8} className="p-4 team-info">
                <div className="team-name-badge mb-2">TEAM PROFILE</div>
                <h1 className="team-name mb-4">{team.name.toUpperCase()}</h1>

                <Row className="g-4">
                  <Col sm={6} className="captain-info">
                    <h3 className="position-title">Captain</h3>
                    <div className="d-flex align-items-center">
                      {team.players?.find((p) => p.isCaptain)?.userId &&
                      userProfiles[team.players.find((p) => p.isCaptain).userId]
                        ?.photoURL ? (
                        <div className="captain-photo">
                          <div className="responsive-captain-image">
                            <Image
                              src={
                                userProfiles[
                                  team.players.find((p) => p.isCaptain).userId
                                ].photoURL
                              }
                              alt={team.captain}
                              width={50}
                              height={50}
                              className="captain-img"
                              sizes="50px"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="captain-icon">
                          {team.captain.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="captain-name">{team.captain}</h4>
                        <p className="captain-phone">
                          {team.captainPhoneNumber}
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col sm={6} className="vice-captain-info">
                    <h3 className="position-title">Vice Captain</h3>
                    <div className="d-flex align-items-center">
                      {team.players?.find((p) => p.isViceCaptain)?.userId &&
                      userProfiles[
                        team.players.find((p) => p.isViceCaptain).userId
                      ]?.photoURL ? (
                        <div className="captain-photo">
                          <div className="responsive-captain-image">
                            <Image
                              src={
                                userProfiles[
                                  team.players.find((p) => p.isViceCaptain)
                                    .userId
                                ].photoURL
                              }
                              alt={team.viceCaptain}
                              width={50}
                              height={50}
                              className="captain-img"
                              sizes="50px"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="captain-icon vice">
                          {team.viceCaptain.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="captain-name">{team.viceCaptain}</h4>
                        <p className="captain-phone">
                          {team.viceCaptainPhoneNumber}
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Team Jersey Section */}
        <Card className="jersey-card mb-5 border-0 shadow-sm">
          <Card.Body className="p-4">
            <div className="section-header mb-4">
              <h2 className="section-title">
                <span className="title-icon">
                  <i className="fas fa-tshirt"></i>
                </span>
                Team Jersey
              </h2>
            </div>
            <Row>
              <Col sm={6} className="text-center mb-4 mb-sm-0">
                {team.frontJerseyUrl ? (
                  <div className="jersey-image-container">
                    <Image
                      src={team.frontJerseyUrl}
                      alt={`${team.name} jersey front`}
                      width={300}
                      height={300}
                      className="jersey-image"
                      sizes="(max-width: 768px) 250px, 300px"
                    />
                    <div className="jersey-label">Front View</div>
                  </div>
                ) : (
                  <div className="jersey-placeholder">
                    <div className="placeholder-icon">
                      <i className="fas fa-tshirt"></i>
                    </div>
                    <div className="placeholder-text">
                      Front View Not Available
                    </div>
                  </div>
                )}
              </Col>
              <Col sm={6} className="text-center">
                {team.backJerseyUrl ? (
                  <div className="jersey-image-container">
                    <Image
                      src={team.backJerseyUrl}
                      alt={`${team.name} jersey back`}
                      width={300}
                      height={300}
                      className="jersey-image"
                      sizes="(max-width: 768px) 250px, 300px"
                    />
                    <div className="jersey-label">Back View</div>
                  </div>
                ) : (
                  <div className="jersey-placeholder">
                    <div className="placeholder-icon">
                      <i className="fas fa-tshirt"></i>
                    </div>
                    <div className="placeholder-text">
                      Back View Not Available
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="players-section">
          <div className="section-header mb-4">
            <h2 className="section-title">
              <span className="title-icon">
                <i className="fas fa-users"></i>
              </span>
              Team Players
            </h2>
          </div>

          <Row xs={1} md={2} lg={3} className="g-4">
            {team.players.map((player) => (
              <Col key={player.userId}>
                <PlayerCard
                  player={player}
                  userProfile={userProfiles[player.userId]}
                />
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      <style jsx global>{`
        .team-page-wrapper {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
          padding-top: 120px; !important;
        }

        .team-header-card {
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .team-header-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .responsive-image-container {
          position: relative;
          width: 100%;
          max-width: 200px;
          height: auto;
          aspect-ratio: 1/1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .team-logo-container {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          position: relative;
          overflow: hidden;
        }

        .team-logo-container:after {
          content: "";
          position: absolute;
          width: 150%;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(45deg);
          top: -80px;
          left: -100px;
        }

        .team-logo {
          filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.2));
          transition: transform 0.5s ease;
          z-index: 2;
          position: relative;
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        .team-header-card:hover .team-logo {
          transform: scale(1.05) rotate(5deg);
        }

        .team-info {
          background: white;
        }

        .team-name-badge {
          display: inline-block;
          background: #f0f4ff;
          color: #0d6efd;
          font-size: 0.8rem;
          font-weight: bold;
          padding: 5px 15px;
          border-radius: 20px;
          letter-spacing: 1px;
        }

        .team-name {
          font-size: 2rem;
          font-weight: 700;
          color: #212529;
        }

        .position-title {
          font-size: 1rem;
          font-weight: 600;
          color: #6c757d;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding-bottom: 5px;
        }

        .responsive-captain-image {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #0d6efd;
          margin-right: 15px;
        }

        .responsive-captain-image.vice {
          border-color: #6c757d;
        }

        .captain-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .captain-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #0d6efd;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 600;
          margin-right: 15px;
        }

        .captain-icon.vice {
          background: #6c757d;
        }

        .captain-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: #212529;
        }

        .captain-phone {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .section-header {
          position: relative;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          padding-bottom: 15px;
        }

        .section-title {
          font-weight: 700;
          color: #212529;
          display: flex;
          align-items: center;
        }

        .title-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #0d6efd;
          color: white;
          border-radius: 10px;
          margin-right: 15px;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .team-name {
            font-size: 1.5rem;
          }

          .responsive-image-container {
            max-width: 150px;
          }

          .captain-name {
            font-size: 1rem;
          }

          .captain-phone {
            font-size: 0.8rem;
          }

          .responsive-captain-image {
            width: 40px;
            height: 40px;
            margin-right: 10px;
          }

          .captain-icon {
            width: 40px;
            height: 40px;
            font-size: 1rem;
            margin-right: 10px;
          }
        }

        .jersey-card {
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.3s ease;
          background: white;
        }

        .jersey-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .jersey-image-container {
          position: relative;
          padding: 1rem;
          border-radius: 10px;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .jersey-image {
          max-width: 100%;
          height: auto;
          filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.1));
          transition: transform 0.5s ease;
        }

        .jersey-card:hover .jersey-image {
          transform: scale(1.03);
        }

        .jersey-label {
          margin-top: 1rem;
          font-weight: 600;
          color: #0d6efd;
          font-size: 1rem;
        }

        .jersey-placeholder {
          padding: 3rem 2rem;
          border-radius: 10px;
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .placeholder-icon {
          font-size: 3rem;
          color: #adb5bd;
          margin-bottom: 1rem;
        }

        .placeholder-text {
          color: #6c757d;
          font-weight: 500;
        }

        @media (max-width: 576px) {
          .responsive-image-container {
            max-width: 120px;
          }
          
          .jersey-image-container {
            padding: 0.5rem;
          }
          
          .placeholder-icon {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewTeam;
