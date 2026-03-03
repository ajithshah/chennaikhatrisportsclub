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

  return (
    <div className={`auction-player-card ${isSold ? "sold" : ""}`}>
      {/* Sold Overlay */}
      {isSold && (
        <div className="sold-overlay">
          <div className="sold-banner">SOLD</div>
        </div>
      )}

      {/* Player Image */}
      <div className="player-image-section">
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
          opacity: 0.85;
        }

        .sold-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .sold-banner {
          background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
          color: white;
          font-size: 2rem;
          font-weight: 800;
          padding: 15px 50px;
          transform: rotate(-15deg);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
          letter-spacing: 3px;
          border: 3px solid white;
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
          .player-image-section {
            height: 180px;
          }

          .image-wrapper,
          .placeholder-image {
            width: 120px;
            height: 120px;
          }

          .initials {
            font-size: 36px;
          }

          .player-name {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AuctionPlayerCard;
