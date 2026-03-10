import React from "react";
import Image from "next/image";

const AuctionPlayerCard = ({ player }) => {
  // Convert Google Drive share URL to our proxy API (avoids CORS/rate limiting)
  const getImageUrl = (url) => {
    if (!url) return null;
    
    // Handle Google Drive URLs
    if (url.includes("drive.google.com") || url.includes("drive.usercontent.google.com")) {
      let fileId = null;
      
      if (url.includes("/file/d/")) {
        fileId = url.split("/file/d/")[1]?.split("/")[0];
      } else if (url.includes("id=")) {
        fileId = url.split("id=")[1]?.split("&")[0];
      } else if (url.includes("open?id=")) {
        fileId = url.split("open?id=")[1]?.split("&")[0];
      }
      
      if (fileId) {
        return `/api/image-proxy/${fileId}`;
      }
    }
    
    return url;
  };

  const getSkillIcon = (skill) => {
    const skillLower = skill?.toLowerCase() || "";
    if (skillLower.includes("batsman") || skillLower.includes("batter")) return "🏏";
    if (skillLower.includes("bowler")) return "🎯";
    if (skillLower.includes("all rounder")) return "⭐";
    if (skillLower.includes("wicket")) return "🧤";
    return "🏏";
  };

  const getSkillColor = (skill) => {
    const skillLower = skill?.toLowerCase() || "";
    if (skillLower.includes("batsman") || skillLower.includes("batter")) 
      return { bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", text: "#fff" };
    if (skillLower.includes("bowler")) 
      return { bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", text: "#fff" };
    if (skillLower.includes("all rounder")) 
      return { bg: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", text: "#fff" };
    if (skillLower.includes("wicket")) 
      return { bg: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)", text: "#fff" };
    return { bg: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", text: "#fff" };
  };

  const imageUrl = getImageUrl(player.photoURL);
  const skillColor = getSkillColor(player.skill);

  return (
    <div className="player-card">

      {/* Player Photo Section */}
      <div className="photo-section">
        <div className="photo-bg"></div>
        {imageUrl ? (
          <div className="photo-wrapper">
            <Image
              src={imageUrl}
              alt={player.name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 576px) 80px, 110px"
              unoptimized
            />
          </div>
        ) : (
          <div className="photo-placeholder">
            <span>{player.name?.charAt(0)?.toUpperCase() || "?"}</span>
          </div>
        )}
        
        {/* Jersey Number */}
        {player.jerseyNumber && (
          <div className="jersey-number">#{player.jerseyNumber}</div>
        )}
      </div>

      {/* Player Details */}
      <div className="details-section">
        <h3 className="name">{player.name}</h3>
        {player.jerseyName && player.jerseyName !== player.name && (
          <p className="jersey-name">{player.jerseyName}</p>
        )}

        {/* Skill Badge */}
        <div className="skill-tag" style={{ background: skillColor.bg }}>
          <span className="skill-icon">{getSkillIcon(player.skill)}</span>
          <span className="skill-text">{player.skill || "Player"}</span>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-label">AGE</span>
            <span className="stat-value">{player.age || "-"}</span>
          </div>
          <div className="stat">
            <span className="stat-label">BAT</span>
            <span className="stat-value">{player.battingStyle?.split(" ")[0] || "-"}</span>
          </div>
          <div className="stat">
            <span className="stat-label">BOWL</span>
            <span className="stat-value">{player.bowlingStyle?.split(" ")[0] || "-"}</span>
          </div>
        </div>

        {/* Location */}
        <div className="location">
          <i className="fas fa-map-marker-alt"></i>
          <span>{player.location || "Unknown"}</span>
        </div>
      </div>


      <style jsx>{`
        .player-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .player-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        .player-card.sold {
          opacity: 0.75;
        }

        .player-card.sold:hover {
          opacity: 1;
        }

        .status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .status-badge.sold {
          background: #ef4444;
          color: white;
        }

        .status-badge.available {
          background: #22c55e;
          color: white;
        }

        .photo-section {
          position: relative;
          height: 160px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 20px;
        }

        .photo-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
        }

        .photo-wrapper {
          position: relative;
          width: 110px;
          height: 110px;
          border-radius: 12px;
          overflow: hidden;
          border: 3px solid #fff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          z-index: 2;
          flex-shrink: 0;
        }

        .photo-placeholder {
          width: 110px;
          height: 110px;
          border-radius: 12px;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          border: 3px solid #fff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .photo-placeholder span {
          font-size: 2.5rem;
          font-weight: 700;
          color: #64748b;
        }

        .jersey-number {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.95);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 800;
          color: #1e3a5f;
          z-index: 3;
        }

        .details-section {
          padding: 16px 20px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 2px;
          line-height: 1.3;
        }

        .jersey-name {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 12px;
          font-style: italic;
        }

        .skill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 16px;
        }

        .skill-icon {
          font-size: 0.9rem;
        }

        .skill-text {
          font-size: 0.7rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stats-grid {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          width: 100%;
        }

        .stat {
          flex: 1;
          background: #f8fafc;
          border-radius: 8px;
          padding: 8px 4px;
        }

        .stat-label {
          display: block;
          font-size: 0.6rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .stat-value {
          display: block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #334155;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #64748b;
          margin-top: auto;
        }

        .location i {
          color: #ef4444;
          font-size: 0.7rem;
        }

        .team-footer {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          padding: 10px 16px;
          text-align: center;
        }

        .team-name {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        @media (max-width: 991px) {
          .player-card {
            border-radius: 14px;
          }

          .photo-section {
            height: 140px;
            padding-bottom: 15px;
          }

          .photo-bg {
            height: 85px;
          }

          .photo-wrapper,
          .photo-placeholder {
            width: 95px;
            height: 95px;
          }

          .details-section {
            padding: 14px 16px 16px;
          }

          .name {
            font-size: 1rem;
          }

          .skill-tag {
            padding: 5px 12px;
            margin-bottom: 12px;
          }

          .skill-text {
            font-size: 0.65rem;
          }

          .stat {
            padding: 6px 4px;
          }

          .stat-value {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 767px) {
          .player-card {
            border-radius: 12px;
          }

          .photo-section {
            height: 130px;
            padding-bottom: 12px;
          }

          .photo-bg {
            height: 75px;
          }

          .photo-wrapper,
          .photo-placeholder {
            width: 85px;
            height: 85px;
            border-radius: 10px;
          }

          .photo-placeholder span {
            font-size: 2rem;
          }

          .jersey-number {
            top: 8px;
            left: 8px;
            padding: 3px 8px;
            font-size: 0.75rem;
          }

          .details-section {
            padding: 12px 14px 14px;
          }

          .name {
            font-size: 0.95rem;
          }

          .jersey-name {
            font-size: 0.75rem;
            margin-bottom: 10px;
          }

          .skill-tag {
            padding: 4px 10px;
            margin-bottom: 10px;
          }

          .skill-icon {
            font-size: 0.8rem;
          }

          .skill-text {
            font-size: 0.6rem;
          }

          .stats-grid {
            gap: 6px;
            margin-bottom: 10px;
          }

          .stat {
            padding: 6px 3px;
            border-radius: 6px;
          }

          .stat-label {
            font-size: 0.55rem;
          }

          .stat-value {
            font-size: 0.75rem;
          }

          .location {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 576px) {
          .player-card {
            flex-direction: row;
            height: auto;
            min-height: 120px;
            border-radius: 12px;
          }

          .player-card:hover {
            transform: translateY(-3px);
          }

          .photo-section {
            width: 110px;
            min-width: 110px;
            height: auto;
            min-height: 120px;
            padding: 12px;
            align-items: center;
            justify-content: center;
          }

          .photo-bg {
            height: 100%;
            width: 100%;
            border-radius: 12px 0 0 12px;
          }

          .photo-wrapper,
          .photo-placeholder {
            width: 75px;
            height: 75px;
            border-radius: 10px;
            border-width: 2px;
          }

          .photo-placeholder span {
            font-size: 1.6rem;
          }

          .jersey-number {
            top: 6px;
            left: 6px;
            padding: 2px 6px;
            font-size: 0.65rem;
            border-radius: 4px;
          }

          .details-section {
            padding: 10px 12px 10px 10px;
            align-items: flex-start;
            text-align: left;
            justify-content: center;
            flex: 1;
            min-width: 0;
          }

          .name {
            font-size: 0.9rem;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }

          .jersey-name {
            font-size: 0.65rem;
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }

          .skill-tag {
            padding: 3px 8px;
            margin-bottom: 8px;
            border-radius: 12px;
          }

          .skill-icon {
            font-size: 0.7rem;
          }

          .skill-text {
            font-size: 0.55rem;
            max-width: 100px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .stats-grid {
            gap: 4px;
            margin-bottom: 6px;
            width: 100%;
          }

          .stat {
            padding: 4px 2px;
            border-radius: 5px;
          }

          .stat-label {
            font-size: 0.5rem;
            margin-bottom: 1px;
          }

          .stat-value {
            font-size: 0.7rem;
          }

          .location {
            font-size: 0.65rem;
            gap: 4px;
          }

          .location i {
            font-size: 0.6rem;
          }
        }

        @media (max-width: 400px) {
          .player-card {
            min-height: 110px;
          }

          .photo-section {
            width: 95px;
            min-width: 95px;
            min-height: 110px;
            padding: 10px;
          }

          .photo-wrapper,
          .photo-placeholder {
            width: 65px;
            height: 65px;
          }

          .photo-placeholder span {
            font-size: 1.4rem;
          }

          .jersey-number {
            padding: 1px 4px;
            font-size: 0.6rem;
          }

          .details-section {
            padding: 8px 10px 8px 8px;
          }

          .name {
            font-size: 0.85rem;
          }

          .jersey-name {
            font-size: 0.6rem;
            margin-bottom: 4px;
          }

          .skill-tag {
            padding: 2px 6px;
            margin-bottom: 6px;
          }

          .skill-icon {
            font-size: 0.6rem;
          }

          .skill-text {
            font-size: 0.5rem;
            max-width: 80px;
          }

          .stats-grid {
            gap: 3px;
            margin-bottom: 4px;
          }

          .stat {
            padding: 3px 2px;
          }

          .stat-label {
            font-size: 0.45rem;
          }

          .stat-value {
            font-size: 0.65rem;
          }

          .location {
            font-size: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AuctionPlayerCard;
