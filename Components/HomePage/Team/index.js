import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import Link from "next/link";
import Image from "next/image";
import { Container, Spinner, Row, Col, Card } from "react-bootstrap";

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsCollection = collection(db, "cricket_teams");
        const teamSnapshot = await getDocs(teamsCollection);
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
        <h2 className="text-center mb-4 mb-md-5 fw-bold">
          <span className="border-bottom border-primary border-3 pb-2">
            KPL Season 3 Cricket Teams
          </span>
        </h2>

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
                  {/* 
                    <div className="mt-3">
                      <Badge
                        bg="light"
                        text="dark"
                        className="border px-3 py-2"
                      >
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

      <style jsx global>{`
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
