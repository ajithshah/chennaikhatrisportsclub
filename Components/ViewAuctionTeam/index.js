import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Container, Spinner, Row, Col, Card, Badge } from "react-bootstrap";
import AuctionPlayerCard from "../AuctionPlayerCard";
import Link from "next/link";
import Image from "next/image";

const ViewAuctionTeam = () => {
  const router = useRouter();
  const { teamId } = router.query;
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
    }
  }, [teamId]);

  const fetchTeam = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auction/teams/${id}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setTeam(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching team:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTeamColor = (teamName) => {
    const colors = {
      "Chennai Khatri Kings": { primary: "#ffc107", secondary: "#ffd54f" },
      "Mumbai Khatri Wala": { primary: "#1e88e5", secondary: "#64b5f6" },
      "Kolkata Khatri Riders": { primary: "#7b1fa2", secondary: "#ba68c8" },
      "Bangalore Khatri Challengers": { primary: "#d32f2f", secondary: "#ef5350" },
      "Gujarat Khatri Titans": { primary: "#00897b", secondary: "#4db6ac" },
      "Punjab Khatri Kings": { primary: "#e64a19", secondary: "#ff7043" },
      "Delhi Khatri Capitals": { primary: "#303f9f", secondary: "#5c6bc0" },
      "Lucknow Khatri Giants": { primary: "#0288d1", secondary: "#4fc3f7" },
    };
    return colors[teamName] || { primary: "#6c757d", secondary: "#adb5bd" };
  };

  const filteredPlayers = team?.players?.filter((player) => {
    const matchesFilter =
      filter === "all" ||
      player.skill?.toLowerCase()?.includes(filter.toLowerCase());
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      [
        player.name,
        player.jerseyName,
        player.jerseyNumber,
        player.skill,
        player.battingStyle,
        player.bowlingStyle,
      ].some((field) => field?.toLowerCase()?.includes(query));
    return matchesFilter && matchesSearch;
  }) || [];

  const skillCounts = team?.players?.reduce((acc, player) => {
    const skills = player.skill?.split(",").map((s) => s.trim()) || ["Unknown"];
    skills.forEach((skill) => {
      if (skill) {
        acc[skill] = (acc[skill] || 0) + 1;
      }
    });
    return acc;
  }, {}) || {};

  if (loading) {
    return (
      <Container
        className="py-5 d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status" variant="primary" />
      </Container>
    );
  }

  if (error || !team) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2 className="text-danger">Team Not Found</h2>
          <p className="text-muted">{error || "Could not load team data"}</p>
          <Link href="/auction/teams" className="btn btn-primary">
            Back to Teams
          </Link>
        </div>
      </Container>
    );
  }

  const colors = getTeamColor(team.teamName);

  return (
    <div className="view-auction-team">
      {/* Team Header */}
      <div
        className="team-banner"
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        }}
      >
        <Container>
          <div className="banner-content">
            <Link href="/auction/teams" className="back-link text-light">
              <i className="fas fa-arrow-left"></i> All Teams
            </Link>
            <div className="team-info">
              {team.teamLogo ? (
                <div className="team-logo-wrapper">
                  <Image
                    src={team.teamLogo}
                    alt={`${team.teamName} logo`}
                    width={100}
                    height={100}
                    className="team-logo-img"
                    style={{ objectFit: "contain" }}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="team-icon">
                  {team.teamName?.charAt(0)?.toUpperCase() || "T"}
                </div>
              )}
              <div className="team-details">
                <span className="team-short">{team.shortName}</span>
                <h1 className="team-name">{team.teamName}</h1>
                <div className="team-meta">
                  <Badge bg="light" text="dark" className="me-2">
                    {team.players?.length || 0} Players
                  </Badge>
                  <Badge
                    bg={team.status === "active" ? "success" : "secondary"}
                  >
                    {team.status || "Active"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Filters & Search */}
        <div className="filters-section mb-4">
          <Row className="align-items-center g-3">
            <Col md={6}>
              <div className="search-box">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control search-input"
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="skill-filters d-flex flex-wrap gap-2">
                <button
                  className={`filter-btn ${filter === "all" ? "active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All ({team.players?.length || 0})
                </button>
                {Object.entries(skillCounts).slice(0, 5).map(([skill, count]) => (
                  <button
                    key={skill}
                    className={`filter-btn ${filter === skill ? "active" : ""}`}
                    onClick={() => setFilter(skill)}
                  >
                    {skill} ({count})
                  </button>
                ))}
              </div>
            </Col>
          </Row>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-users fa-3x text-muted mb-3"></i>
            <h4 className="text-muted">No players found</h4>
            <p className="text-muted">
              {team.players?.length === 0
                ? "This team has no players yet"
                : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredPlayers.map((player) => (
              <Col key={player.id}>
                <AuctionPlayerCard player={player} />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <style jsx>{`
        .view-auction-team {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .team-banner {
          padding: 40px 0;
          color: white;
        }

        .banner-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .back-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          transform: translateX(-5px);
        }

        .team-info {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .team-icon {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 800;
          color: ${colors.primary};
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .team-logo-wrapper {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .team-short {
          font-size: 0.9rem;
          opacity: 0.9;
          letter-spacing: 2px;
        }

        .team-name {
          font-size: 2rem;
          font-weight: 800;
          margin: 5px 0 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }

        .search-input {
          padding-left: 45px;
          border-radius: 30px;
          border: 2px solid #e9ecef;
          height: 48px;
        }

        .search-input:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 0.2rem rgba(0, 0, 0, 0.05);
        }

        .filter-btn {
          background: white;
          border: 2px solid #e9ecef;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #495057;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          border-color: ${colors.primary};
          color: ${colors.primary};
        }

        .filter-btn.active {
          background: ${colors.primary};
          border-color: ${colors.primary};
          color: white;
        }

        @media (max-width: 768px) {
          .team-info {
            flex-direction: column;
            text-align: center;
          }

          .team-icon {
            width: 80px;
            height: 80px;
            font-size: 2.5rem;
          }

          .team-name {
            font-size: 1.5rem;
          }

          .skill-filters {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewAuctionTeam;
