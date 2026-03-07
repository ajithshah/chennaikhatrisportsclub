import React from "react";
import Image from "next/image";

const AuctionPlayerCard = ({ player }) => {
  // Convert Google Drive share URL to our proxy API (avoids CORS/rate limiting)
  const getImageUrl = (url) => {
    if (!url) return null;
    
    // Handle Google Drive URLs
    if (url.includes("drive.google.com") || url.includes("drive.usercontent.google.com")) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null;
      
      if (url.includes("/file/d/")) {
        fileId = url.split("/file/d/")[1]?.split("/")[0];
      } else if (url.includes("id=")) {
        fileId = url.split("id=")[1]?.split("&")[0];
      } else if (url.includes("open?id=")) {
        fileId = url.split("open?id=")[1]?.split("&")[0];
      }
      
      if (fileId) {
        // Use our proxy API to avoid CORS and rate limiting
        return `/api/image-proxy/${fileId}`;
      }
    }
    
    return url;
  };

  const imageUrl = getImageUrl(player.photoURL);
  const isSold = player.status?.toLowerCase() === "sold";
  const isAvailable = player.status?.toLowerCase() === "available";

  return (
    <div className={`auction-player-card ${isSold ? "sold" : ""}`}>
      {/* Player Image */}
      <div className="player-image-section">
        {isSold && <div className="sold-banner">SOLD</div>}
        {isAvailable && <div className="available-banner">AVAILABLE</div>}
        {imageUrl ? (
          <div className="image-wrapper">
            <Image
              src={imageUrl}
              alt={`${player.name}'s profile`}
              fill
              className="profile-image"
              sizes="(max-width: 576px) 150px, 180px"
              unoptimized
            />
          </div>
        ) : (
          <div className="placeholder-image">
            <span className="initials">
              {player.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="player-info">
        <h3 className="player-name">{player.name}</h3>
        
        {player.jerseyName && (
          <div className="jersey-name">"{player.jerseyName}"</div>
        )}
        
        <div className="skill-badge">
          <span className="badge skill">
            {player.skill || "Unknown"}
          </span>
        </div>

        <div className="player-details">
          <div className="detail-row">
            <div className="detail-item">
              <span className="label">Age</span>
              <span className="value">{player.age || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Jersey #</span>
              <span className="value">{player.jerseyNumber || "-"}</span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <span className="label">Batting</span>
              <span className="value">{player.battingStyle || "-"}</span>
            </div>
            <div className="detail-item">
              <span className="label">Bowling</span>
              <span className="value">{player.bowlingStyle || "-"}</span>
            </div>
          </div>

          <div className="detail-row single">
            <div className="detail-item full">
              <span className="label">Location</span>
              <span className="value">{player.location || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {isSold && player.team && (
        <div className="sold-team">{player.team}</div>
      )}

      <style jsx>{`
        .auction-player-card {
          background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .auction-player-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .auction-player-card.sold {
          filter: brightness(0.5);
        }

        .sold-banner,
        .available-banner {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 5;
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 6px;
          letter-spacing: 1px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .sold-banner {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
        }

        .available-banner {
          background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
        }

        .sold-team {
          text-align: center;
          background: linear-gradient(135deg, #ffd700 0%, #ffb300 100%);
          color: #1a202c;
          font-size: 0.85rem;
          font-weight: 800;
          padding: 8px 12px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
          box-shadow: 0 -2px 10px rgba(255, 215, 0, 0.3);
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            box-shadow: 0 -2px 10px rgba(255, 215, 0, 0.3);
          }
          to {
            box-shadow: 0 -2px 20px rgba(255, 215, 0, 0.6);
          }
        }

        .player-image-section {
          position: relative;
          width: 100%;
          height: 220px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-wrapper {
          position: relative;
          width: 180px;
          height: 180px;
          border-radius: 10%;
          overflow: hidden;
          border: 2px solid white;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }

        .profile-image {
          object-fit: cover;
        }

        .placeholder-image {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: 4px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .initials {
          font-size: 48px;
          font-weight: bold;
          color: white;
        }

        .player-info {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .player-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 5px 0;
          text-align: center;
        }

        .jersey-name {
          font-size: 0.9rem;
          color: #718096;
          text-align: center;
          font-style: italic;
          margin-bottom: 12px;
        }

        .skill-badge {
          text-align: center;
          margin-bottom: 15px;
        }

        .badge {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .skill,
        .skill-batter {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .player-details {
          flex: 1;
        }

        .detail-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .detail-row.single {
          display: block;
        }

        .detail-item {
          flex: 1;
          background: #f7fafc;
          padding: 10px;
          border-radius: 10px;
        }

        .detail-item.full {
          width: 100%;
        }

        .label {
          display: block;
          font-size: 0.7rem;
          color: #a0aec0;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .value {
          display: block;
          font-size: 0.9rem;
          color: #2d3748;
          font-weight: 500;
        }

        @media (max-width: 576px) {
          .auction-player-card {
            flex-direction: row;
            border-radius: 12px;
            min-height: auto;
          }

          .auction-player-card:hover {
            transform: translateY(-4px);
          }

          .sold-banner,
          .available-banner {
            font-size: 0.55rem;
            padding: 3px 8px;
            top: 6px;
            left: 6px;
          }

          .sold-team {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            font-size: 0.65rem;
            padding: 5px 8px;
            border-radius: 0 0 12px 12px;
            font-weight: 800;
          }

          .player-image-section {
            width: 120px;
            min-width: 120px;
            height: auto;
            min-height: 180px;
            border-radius: 12px 0 0 12px;
          }

          .image-wrapper {
            width: 90px;
            height: 90px;
            border-radius: 8px;
          }

          .placeholder-image {
            width: 80px;
            height: 80px;
          }

          .initials {
            font-size: 28px;
          }

          .player-info {
            padding: 10px;
            justify-content: flex-start;
          }

          .player-name {
            font-size: 0.95rem;
            text-align: left;
            margin-bottom: 2px;
          }

          .jersey-name {
            text-align: left;
            font-size: 0.7rem;
            margin-bottom: 4px;
          }

          .skill-badge {
            text-align: left;
            margin-bottom: 6px;
          }

          .badge {
            padding: 3px 8px;
            font-size: 0.6rem;
          }

          .player-details {
            display: block;
          }

          .detail-row {
            gap: 4px;
            margin-bottom: 4px;
          }

          .detail-row.single {
            display: flex;
          }

          .detail-item {
            padding: 4px 6px;
            border-radius: 4px;
          }

          .detail-item.full {
            flex: 1;
          }

          .label {
            font-size: 0.55rem;
            margin-bottom: 0;
          }

          .value {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AuctionPlayerCard;
