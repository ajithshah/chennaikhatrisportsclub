import React, { useState, useEffect } from "react";
import { teamsDb } from "../../../lib/db";
import Link from "next/link";
import Image from "next/image";
import {
  Container,
  Spinner,
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
        const teamsList = await teamsDb.getAll({ status: ["freeze", "active"] });
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
        {/* Banner Image */}
        <div className="text-center mb-5">
          <Image
            src="/bannerSponcers.jpeg"
            alt="KPL Season 3 Sponsors Banner"
            width={1000}
            height={300}
            objectFit="cover"
            priority
            className="banner-image rounded"
          />
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 mb-md-5">
          <h2 className="fw-bold m-0">
            <span className="border-bottom border-primary border-3 pb-2">
              KPL Season 3 Cricket Teams
            </span>
          </h2>
          <br></br>
          <Button
            variant="outline-primary"
            onClick={handleShowRules}
            className="rounded-pill w-md-auto"
          >
            <i className="fas fa-info-circle me-2 mr-1"></i>
            Tournament Rules
          </Button>
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
          <Modal.Title>Khatri Premier League [Season - 3] Rules</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-3">
            <h5 className="text-primary mb-3">Tournament Information</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-users text-success me-2"></i>
                Total Teams: 18 teams registered
              </li>
              <li className="mb-2">
                <i className="fas fa-calendar text-success me-2"></i>
                Match Dates: July 5th (Saturday) and July 6th (Sunday)
              </li>
              <li className="mb-2">
                <i className="fas fa-map-marker-alt text-success me-2"></i>
                Venue: Pachayappas College - Ground B and C
              </li>
              <li className="mb-2">
                <i className="fas fa-clock text-success me-2"></i>
                Timings: 6:00 a.m. to 5:30 p.m.
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Team & Equipment Rules</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-users-cog text-info me-2"></i>
                14 players per team (including substitute and impact player)
              </li>
              <li className="mb-2">
                <i className="fas fa-baseball-ball text-info me-2"></i>
                Ball Type: Sixit Lite tennis balls (new ball each innings)
              </li>
              <li className="mb-2">
                <i className="fas fa-ruler text-info me-2"></i>
                Pitch Length: 24 yards (adjustable upon mutual agreement)
              </li>
              <li className="mb-2">
                <i className="fas fa-baseball-bat text-info me-2"></i>
                Only wooden bats allowed - No fiber or other types
              </li>
              <li className="mb-2">
                <i className="fas fa-tshirt text-info me-2"></i>
                Dress Code: Jersey, sports shoes, and track pants mandatory
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Match Format</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-trophy text-warning me-2"></i>
                League Matches: 8 overs per innings
              </li>
              <li className="mb-2">
                <i className="fas fa-medal text-warning me-2"></i>
                Quarter-Finals & Finals: 10 overs per innings
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Powerplay Rules</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-shield-alt text-info me-2"></i>8 Overs
                Format:
                <ul>
                  <li>First 2 overs: Only 2 fielders outside 30-yard circle</li>
                  <li>3rd over: Only 3 fielders outside 30-yard circle</li>
                </ul>
              </li>
              <li className="mb-2">
                <i className="fas fa-shield-alt text-info me-2"></i>
                10 Overs Format:
                <ul>
                  <li>First 2 overs: Only 2 fielders outside 30-yard circle</li>
                  <li>
                    3rd & 4th over: Only 3 fielders outside 30-yard circle
                  </li>
                </ul>
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Bowling Restrictions</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-bowling-ball text-warning me-2"></i>8
                Overs: Only 3 bowlers can bowl 2 overs
              </li>
              <li className="mb-2">
                <i className="fas fa-bowling-ball text-warning me-2"></i>
                10 Overs: Maximum 2 overs per bowler
              </li>
              <li className="mb-2">
                <i className="fas fa-exclamation-circle text-warning me-2"></i>
                Bowlers must inform guard to umpire before bowling
              </li>
              <li className="mb-2">
                <i className="fas fa-ban text-warning me-2"></i>
                Chucking prohibited - First chuck: No-ball + Free hit, Second
                chuck: Bowler banned
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Special Rules</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-user-friends text-info me-2"></i>
                Impact Player: 2 players listed at toss, 1 deployable anytime
              </li>
              <li className="mb-2">
                <i className="fas fa-hand-paper text-info me-2"></i>
                No LBW/Leg Byes, No gloves allowed for any player
              </li>
              <li className="mb-2">
                <i className="fas fa-running text-info me-2"></i>
                By-runners allowed after 2 overs (restrictions apply)
              </li>
              <li className="mb-2">
                <i className="fas fa-volume-mute text-info me-2"></i>
                No fielder communication during bowler's run-up
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">
              Match Officials & Communication
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-gavel text-warning me-2"></i>
                Umpire's decision is final - No arguments allowed
              </li>
              <li className="mb-2">
                <i className="fas fa-user-tie text-warning me-2"></i>
                Only captain/vice-captain can communicate with officials
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Tie-Break Rules</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-equals text-info me-2"></i>
                Super Over (1 over, 2 wickets)
              </li>
              <li className="mb-2">
                <i className="fas fa-sync text-info me-2"></i>
                Second Super Over with new players if tied
              </li>
              <li className="mb-2">
                <i className="fas fa-trophy text-info me-2"></i>
                Most boundaries wins if second Super Over tied
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Additional Features</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-utensils text-success me-2"></i>
                Meals provided for players and family members
              </li>
              <li className="mb-2">
                <i className="fas fa-video text-success me-2"></i>
                Live streaming on website and YouTube
              </li>
              <li className="mb-2">
                <i className="fas fa-chart-line text-success me-2"></i>
                Live scoring via Cricheroes app with match awards
              </li>
              <li className="mb-2">
                <i className="fas fa-first-aid text-success me-2"></i>
                Medical support available throughout
              </li>
            </ul>

            <h5 className="text-primary mb-3 mt-4">Contact Information</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-phone text-secondary me-2"></i>
                Mr. Vinod Kumar: +91 98408 80873
              </li>
              <li className="mb-2">
                <i className="fas fa-phone text-secondary me-2"></i>
                Mr. Rajini: +91 98415 26709
              </li>
              <li className="mb-2">
                <i className="fas fa-phone text-secondary me-2"></i>
                Mr. Sushil: +91 98417 12284
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
        .banner-image {
          max-width: 100%;
          height: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          transition: all 0.3s ease;
          border: 2px solid rgba(13, 110, 253, 0.1);
        }

        .banner-image:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .banner-image {
            border-radius: 0.5rem !important;
          }
        }

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
