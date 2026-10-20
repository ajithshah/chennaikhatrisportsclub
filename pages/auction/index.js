import { authFetch } from "@/lib/authFetch";
import withSeason3Guard from "@/Components/Season3Guard";
import React, { useState, useEffect } from "react";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import Meta from "../../Components/Meta";
import AuctionPlayerCard from "../../Components/AuctionPlayerCard";

const AuctionPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh interval (10 seconds)
  const REFRESH_INTERVAL = 10000;

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Auto-refresh polling
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchPlayers(true); // silent refresh
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isLive]);

  const fetchPlayers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsRefreshing(true);
      
      const response = await authFetch("/api/auction/players?t=" + Date.now());
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setPlayers(data.players || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching players:", err);
      if (!silent) setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredPlayers = players.filter((player) => {
    const matchesFilter = filter === "all" || player.skill?.toLowerCase()?.includes(filter.toLowerCase());
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || [
      player.name,
      player.jerseyName,
      player.jerseyNumber,
      player.skill,
      player.battingStyle,
      player.bowlingStyle,
      player.location,
      player.team,
      player.status,
      player.age != null ? String(player.age) : "",
    ].some(field => field?.toLowerCase()?.includes(query));
    return matchesFilter && matchesSearch;
  });

  const skillFilters = [];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta title="Player Auction | Chennai Khatri Sports Club" />
      <Header />
      <main className="flex-grow-1 auction-page">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h1 className="auction-title">Player Auction</h1>
            <p className="auction-subtitle">
              Browse all registered players for the upcoming auction
            </p>
            
            {/* Live Controls */}
            <div className="live-controls mt-3">
              <button
                className={`live-badge ${isLive ? "active" : ""}`}
                onClick={() => setIsLive(!isLive)}
                title={isLive ? "Click to pause auto-refresh" : "Click to enable auto-refresh"}
              >
                <span className={`live-dot ${isLive ? "pulse" : ""}`}></span>
                {isLive ? "LIVE" : "PAUSED"}
              </button>
              
              <button
                className="refresh-btn"
                onClick={() => fetchPlayers()}
                disabled={isRefreshing}
                title="Refresh now"
              >
                <svg
                  className={`refresh-icon ${isRefreshing ? "spinning" : ""}`}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
              </button>
              
              {lastUpdated && (
                <span className="last-updated">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="search-section mb-4">
            <div className="search-wrapper">
              <svg
                className="search-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, skill, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="filter-section mb-4">
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {skillFilters.map((skillFilter) => (
                <button
                  key={skillFilter.value}
                  className={`filter-btn ${filter === skillFilter.value ? "active" : ""}`}
                  onClick={() => setFilter(skillFilter.value)}
                >
                  {skillFilter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Player Count */}
          <div className="text-center mb-4">
            <span className="player-count">
              {filteredPlayers.length} {filteredPlayers.length === 1 ? "Player" : "Players"} Found
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden"></span>
              </div>
              <p className="mt-3 text-muted">Loading players...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="alert alert-danger text-center" role="alert">
              <strong>Error:</strong> {error}
              <button className="btn btn-link" onClick={fetchPlayers}>
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPlayers.length === 0 && (
            <div className="text-center py-5">
              <div className="empty-state">
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-muted mb-3"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <h5 className="text-muted">No players found</h5>
                <p className="text-muted">
                  {searchQuery
                    ? `No players match "${searchQuery}". Try a different search term.`
                    : filter !== "all"
                    ? "No players match the selected filter. Try selecting a different category."
                    : "No players have registered yet."}
                </p>
              </div>
            </div>
          )}

          {/* Players Grid */}
          {!loading && !error && filteredPlayers.length > 0 && (
            <div className="row g-4">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="col-12 col-sm-6 col-lg-4 col-xl-3"
                >
                  <AuctionPlayerCard player={player} />
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .auction-page {
            background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
            min-height: 80vh;
          }

          .auction-title {
            font-size: 2.5rem;
            font-weight: 800;
            color: #2d3748;
            margin-bottom: 10px;
          }

          .auction-subtitle {
            font-size: 1.1rem;
            color: #718096;
          }

          .search-section {
            display: flex;
            justify-content: center;
          }

          .search-wrapper {
            position: relative;
            width: 100%;
            max-width: 400px;
          }

          .search-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
            pointer-events: none;
          }

          .search-input {
            width: 100%;
            padding: 14px 45px;
            border: 2px solid #e2e8f0;
            border-radius: 30px;
            font-size: 1rem;
            background: white;
            transition: all 0.2s ease;
            outline: none;
          }

          .search-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .search-input::placeholder {
            color: #a0aec0;
          }

          .clear-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: #e2e8f0;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #718096;
            transition: all 0.2s ease;
          }

          .clear-btn:hover {
            background: #cbd5e0;
            color: #4a5568;
          }

          .filter-section {
            padding: 10px 0;
          }

          .filter-btn {
            padding: 10px 20px;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 25px;
            font-weight: 600;
            color: #4a5568;
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .filter-btn:hover {
            border-color: #667eea;
            color: #667eea;
          }

          .filter-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: transparent;
            color: white;
          }

          .player-count {
            background: #e2e8f0;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 600;
            color: #4a5568;
            font-size: 0.9rem;
          }

          .empty-state {
            padding: 50px 20px;
          }

          .live-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .live-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 1px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #e2e8f0;
            color: #718096;
          }

          .live-badge.active {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
          }

          .live-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
          }

          .live-dot.pulse {
            animation: pulse 1.5s infinite;
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.2);
            }
          }

          .refresh-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 2px solid #e2e8f0;
            background: white;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #4a5568;
          }

          .refresh-btn:hover {
            border-color: #667eea;
            color: #667eea;
          }

          .refresh-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .refresh-icon.spinning {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .last-updated {
            font-size: 0.8rem;
            color: #a0aec0;
          }

          @media (max-width: 576px) {
            .auction-title {
              font-size: 1.8rem;
            }

            .search-wrapper {
              max-width: 100%;
            }

            .search-input {
              padding: 12px 40px;
              font-size: 0.95rem;
            }

            .filter-btn {
              padding: 8px 16px;
              font-size: 0.85rem;
            }
          }
        `}</style>
      </main>
      <Footer />
    </div>
  );
};

export default withSeason3Guard(AuctionPage);
