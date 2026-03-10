import React, { useState, useEffect } from "react";
import Header from "../../../Components/Header";
import Footer from "../../../Components/Footer";
import Meta from "../../../Components/Meta";
import AuctionTeamCard from "../../../Components/AuctionTeamCard";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import Link from "next/link";

const AuctionTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auction/teams");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setTeams(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta title="Auction Teams | Chennai Khatri Sports Club" />
      <Header />
      <main className="flex-grow-1 auction-teams-page">
        <div className="page-header">
          <Container>
            <div className="header-content">
              <Link href="/auction" className="back-link">
                <i className="fas fa-arrow-left"></i> Back to Auction
              </Link>
              <h1 className="page-title">Auction Teams</h1>
              <p className="page-subtitle">
                View all teams and their squad members
              </p>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3 text-muted">Loading teams...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
              <h4 className="text-danger">Error Loading Teams</h4>
              <p className="text-muted">{error}</p>
              <button className="btn btn-primary" onClick={fetchTeams}>
                Try Again
              </button>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h4 className="text-muted">No Teams Found</h4>
              <p className="text-muted">Teams will appear here once created</p>
            </div>
          ) : (
            <>
              <div className="teams-summary mb-4">
                <Row className="g-3">
                  <Col xs={6} md={4}>
                    <div className="summary-card">
                      <span className="summary-value">{teams.length}</span>
                      <span className="summary-label">Total Teams</span>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="summary-card">
                      <span className="summary-value">
                        {teams.reduce(
                          (acc, t) => acc + (t.playerCount || 0),
                          0,
                        )}
                      </span>
                      <span className="summary-label">Total Players</span>
                    </div>
                  </Col>
                  <Col xs={6} md={4}>
                    <div className="summary-card">
                      <span className="summary-value">
                        {teams.filter((t) => t.status === "active").length}
                      </span>
                      <span className="summary-label">Active Teams</span>
                    </div>
                  </Col>
                </Row>
              </div>

              <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                {teams.map((team) => (
                  <Col key={team.id}>
                    <AuctionTeamCard team={team} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Container>
      </main>
      <Footer />

      <style jsx>{`
        .auction-teams-page {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .page-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 40px 0;
          color: white;
        }

        .header-content {
          text-align: center;
        }

        .back-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          color: white;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .page-subtitle {
          font-size: 1.1rem;
          opacity: 0.8;
          margin: 0;
        }

        .summary-card {
          background: white;
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1a1a2e;
        }

        .summary-label {
          font-size: 0.8rem;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 1.8rem;
          }

          .summary-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AuctionTeamsPage;
