import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase";
import Link from "next/link";
import Image from "next/image";
import {
  Container,
  Spinner,
  Badge,
  Row,
  Col,
  Card,
  Modal,
  Button,
} from "react-bootstrap";

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const handleShowRules = () => setShowRules(true);
  const handleCloseRules = () => setShowRules(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsCollection = collection(db, "cricket_teams");
        const activeTeamsQuery = query(
          teamsCollection,
          where("status", "in", ["freeze", "active"])
        );
        const teamSnapshot = await getDocs(activeTeamsQuery);
        const teamsList = teamSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamsList);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <Container
        className="py-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px" }}
      >
        <Spinner animation="border" role="status" variant="primary"></Spinner>
      </Container>
    );
  }

  // Return null if there are no teams
  if (teams.length === 0) {
    return null;
  }

  return (
    <section
      className="py-5"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      }}
    >
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4 mb-md-5">
          <h2 className="fw-bold">
            <span className="border-bottom border-primary border-3 pb-2">
              KPL Season 3 Cricket Teams
            </span>
          </h2>
          {/* <Button
            variant="outline-primary"
            onClick={handleShowRules}
            className="rounded-pill"
          >
            <i className="fas fa-info-circle me-2"></i>
            Tournament Rules
          </Button> */}
        </div>

        <Row xs={1} md={3} className="g-4 justify-content-center">
          {teams.map((team) => (
            <Col key={team.id}>
              <Card className="stylish-card h-100 border-0 shadow-sm">
                <div className="text-center p-4 team-logo-bg">
                  <Image
                    src={team.teamLogoUrl}
                    alt={`${team.name} logo`}
                    width={120}
                    height={120}
                    objectFit="contain"
                    priority
                    className="team-logo"
                  />
                </div>

                <Card.Body className="text-center d-flex flex-column">
                  <Card.Title className="fw-bold">{team.name}</Card.Title>

                  {/* <div className="mt-3">
                    <Badge bg="light" text="dark" className="border px-3 py-2">
                      {team.players?.length || 0} Players
                    </Badge>
                  </div> */}

                  <div className="mt-auto pt-3">
                    <Link href={`/team/${team.id}`} passHref legacyBehavior>
                      <a className="btn btn-outline-primary rounded-pill px-4">
                        <i className="fas fa-users me-2"></i>View Team
                      </a>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <Modal show={showRules} onHide={handleCloseRules} size="lg" centered>
        <Modal.Header>
          <Modal.Title>KPL Season 3 Tournament Rules</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-3">
            <h5 className="text-primary mb-3">General Rules</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-circle-check text-success me-2"></i>
                Each team must have a minimum of 11 players and maximum of 15
                players
              </li>
              <li className="mb-2">
                <i className="fas fa-circle-check text-success me-2"></i>
                Matches will be played with 20 overs per innings (T20 format)
              </li>
              <li className="mb-2">
                <i className="fas fa-circle-check text-success me-2"></i>
                Power play: Only 2 fielders allowed outside 30-yard circle
                (first 6 overs)
              </li>
              <li className="mb-2">
                <i className="fas fa-circle-check text-success me-2"></i>
                Each bowler can bowl a maximum of 4 overs per match
              </li>
              <li className="mb-2">
                <i className="fas fa-circle-check text-success me-2"></i>
                Free hit will be awarded for all no-balls
              </li>
              <li className="mb-2">
                <i className="fas fa-circle-check text-success me-2"></i>
                DLS method will be used for rain-affected matches
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Playing Conditions</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-cricket text-info me-2"></i>
                Wide ball rules as per T20 international standards
              </li>
              <li className="mb-2">
                <i className="fas fa-cricket text-info me-2"></i>5 penalty runs
                for ball hitting helmet placed behind keeper
              </li>
              <li className="mb-2">
                <i className="fas fa-cricket text-info me-2"></i>
                Maximum 5 fielders on leg side at any time
              </li>
              <li className="mb-2">
                <i className="fas fa-cricket text-info me-2"></i>
                Minimum 4 fielders (excluding bowler & keeper) inside circle at
                all times
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Points System</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-trophy text-warning me-2"></i>
                Win: 2 points
              </li>
              <li className="mb-2">
                <i className="fas fa-handshake text-info me-2"></i>
                Tie/No Result: 1 point
              </li>
              <li className="mb-2">
                <i className="fas fa-times text-danger me-2"></i>
                Loss: 0 points
              </li>
              <li className="mb-2">
                <i className="fas fa-bolt text-warning me-2"></i>
                Bonus Point: 0.5 (for run rate 1.25 times that of opposition)
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Additional Regulations</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-clock text-secondary me-2"></i>
                Teams must complete their overs within 80 minutes
              </li>
              <li className="mb-2">
                <i className="fas fa-user-clock text-secondary me-2"></i>
                Player registration deadline: 24 hours before first match
              </li>
              <li className="mb-2">
                <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                Three warnings for slow over-rate will result in point deduction
              </li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRules}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx global>{`
        .modal-body li {
          transition: all 0.2s ease;
        }

        .modal-body h5 {
          border-left: 4px solid #0d6efd;
          padding-left: 10px;
        }
        .stylish-card {
          transition: all 0.25s ease;
          border-radius: 0.75rem;
          overflow: hidden;
          background-color: white;
        }

        .stylish-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important;
        }

        .team-logo-bg {
          background: linear-gradient(120deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .team-logo {
          transition: transform 0.4s ease;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }

        .stylish-card:hover .team-logo {
          transform: scale(1.05);
        }

        .ribbon-corner {
          position: absolute;
          top: 0;
          right: 0;
          background: #0d6efd;
          color: white;
          text-align: center;
          padding: 5px 10px;
          font-size: 0.7rem;
          font-weight: bold;
          clip-path: polygon(100% 0, 100% 100%, 0 0);
          width: 70px;
          height: 70px;
          z-index: 2;
        }

        .ribbon-corner span {
          position: absolute;
          right: 5px;
          top: 10px;
          transform: rotate(45deg);
          transform-origin: top right;
          white-space: nowrap;
        }

        .card-title {
          position: relative;
          display: inline-block;
          padding-bottom: 8px;
        }

        .card-title:after {
          content: "";
          position: absolute;
          width: 40%;
          height: 2px;
          background-color: #0d6efd;
          bottom: 0;
          left: 30%;
          transition: width 0.3s ease, left 0.3s ease;
        }

        .stylish-card:hover .card-title:after {
          width: 70%;
          left: 15%;
        }

        section {
          position: relative;
          overflow: hidden;
        }

        section:before,
        section:after {
          content: "";
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background-color: rgba(13, 110, 253, 0.05);
          z-index: 0;
        }

        section:before {
          top: -100px;
          left: -100px;
        }

        section:after {
          bottom: -100px;
          right: -100px;
        }
      `}</style>
    </section>
  );
};

export default Team;
