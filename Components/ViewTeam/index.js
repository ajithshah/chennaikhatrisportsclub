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
        setTeam(teamDoc.data());
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
    <div className="team-page-wrapper py-5">
      <Container>
        <Card className="team-header-card mb-5 border-0 shadow-sm">
          <Card.Body className="p-0">
            <Row className="g-0">
              <Col md={4} className="d-flex justify-content-center align-items-center team-logo-container p-4">
                <Image
                  src={team.teamLogoUrl}
                  alt={`${team.name} logo`}
                  width={200}
                  height={200}
                  priority
                  className="team-logo"
                />
              </Col>
              <Col md={8} className="p-4 team-info">
                <div className="team-name-badge mb-2">TEAM PROFILE</div>
                <h1 className="team-name mb-4">{team.name.toUpperCase()}</h1>
                
                <Row className="g-4">
                  <Col sm={6} className="captain-info">
                    <h3 className="position-title">Captain</h3>
                    <div className="d-flex align-items-center">
                      <div className="captain-icon">
                        <i className="fas fa-user-tie"></i>
                      </div>
                      <div>
                        <h4 className="captain-name">{team.captain}</h4>
                        <p className="captain-phone">{team.captainPhoneNumber}</p>
                      </div>
                    </div>
                  </Col>
                  <Col sm={6} className="vice-captain-info">
                    <h3 className="position-title">Vice Captain</h3>
                    <div className="d-flex align-items-center">
                      <div className="captain-icon vice">
                        <i className="fas fa-user"></i>
                      </div>
                      <div>
                        <h4 className="captain-name">{team.viceCaptain}</h4>
                        <p className="captain-phone">{team.viceCaptainPhoneNumber}</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="players-section">
          <div className="section-header mb-4">
            <h2 className="section-title">
              <span className="title-icon"><i className="fas fa-users"></i></span>
              Team Players
              <Badge bg="primary" className="ms-2">{team.players?.length || 0}</Badge>
            </h2>
          </div>
          
          <Row xs={1} md={2} lg={3} className="g-4">
            {team.players.map((player) => (
              <Col key={player.userId}>
                <PlayerCard player={player} />
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      <style jsx global>{`
        .team-page-wrapper {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          min-height: 100vh;
        }
        
        .team-header-card {
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .team-header-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
        }
        
        .team-logo-container {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          position: relative;
          overflow: hidden;
        }
        
        .team-logo-container:after {
          content: '';
          position: absolute;
          width: 150%;
          height: 100px;
          background: rgba(255,255,255,0.1);
          transform: rotate(45deg);
          top: -80px;
          left: -100px;
        }
        
        .team-logo {
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
          transition: transform 0.5s ease;
          z-index: 2;
          position: relative;
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
          font-weight: 800;
          color: #212529;
          position: relative;
          display: inline-block;
          margin-bottom: 1.5rem;
        }
        
        .team-name:after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 60px;
          height: 4px;
          background: #0d6efd;
          border-radius: 2px;
        }
        
        .position-title {
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6c757d;
          margin-bottom: 15px;
          font-weight: 600;
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
          margin-right: 15px;
          font-size: 1.2rem;
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
          border-bottom: 1px solid rgba(0,0,0,0.1);
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
      `}</style>
    </div>
  );
};

export default ViewTeam;