import React from "react";
import Link from "next/link";
import Image from "next/image";

const AuctionTeamCard = ({ team }) => {
  // Generate team color based on team name (you can customize these)
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

  const colors = getTeamColor(team.teamName);

  return (
    <div className="auction-team-card">
      <div
        className="team-header"
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        }}
      >
        <div className="team-short-name">{team.shortName}</div>
        {team.teamLogo ? (
          <div className="team-logo-wrapper">
            <Image
              src={team.teamLogo}
              alt={`${team.teamName} logo`}
              width={80}
              height={80}
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
      </div>

      <div className="team-body">
        <h3 className="team-name">{team.teamName}</h3>

        <div className="team-stats">
          <div className="stat-item">
            <span className="stat-value">{team.playerCount || 0}</span>
            <span className="stat-label">Players</span>
          </div>
          <div className="stat-item">
            <span
              className="stat-value status"
              style={{
                color:
                  team.status === "active"
                    ? "#28a745"
                    : team.status === "freeze"
                    ? "#ffc107"
                    : "#6c757d",
              }}
            >
              {team.status || "Active"}
            </span>
            <span className="stat-label">Status</span>
          </div>
        </div>

        <Link href={`/auction/teams/${team.id}`} className="view-team-btn">
          <span>View Squad</span>
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      <style jsx>{`
        .auction-team-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .auction-team-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .team-header {
          padding: 30px 20px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 120px;
        }

        .team-short-name {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          letter-spacing: 1px;
        }

        .team-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 800;
          color: ${colors.primary};
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .team-logo-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }

        .team-body {
          padding: 25px 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
          text-align: center;
        }

        .team-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .team-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 20px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1a1a2e;
          text-transform: capitalize;
        }

        .stat-value.status {
          font-size: 1rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }

        .view-team-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(
            135deg,
            ${colors.primary} 0%,
            ${colors.secondary} 100%
          );
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 600;
          text-decoration: none;
          margin-top: auto;
          transition: all 0.3s ease;
        }

        .view-team-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          color: white;
        }

        .view-team-btn i {
          transition: transform 0.3s ease;
        }

        .view-team-btn:hover i {
          transform: translateX(5px);
        }
      `}</style>
    </div>
  );
};

export default AuctionTeamCard;
