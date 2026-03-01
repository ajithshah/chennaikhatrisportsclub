import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usersDb } from "@/lib/db";

const PlayerCard = ({ player, userProfile }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = player.userId;

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    } else if (userProfile) {
      setUser(userProfile);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [userId, userProfile]);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const userData = await usersDb.get(userId);
      if (userData) {
        // console.log("User profile data:", userData);
        setUser(userData);
      } else {
        console.error("No user found with ID:", userId);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    try {
      if (!dateOfBirth) {
        return "Not available";
      }

      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return "Invalid date";
      }
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
      ) {
        age--;
      }

      return `${age} years`;
    } catch (error) {
      console.error("Error calculating age:", error);
      return "Error calculating age";
    }
  };

  if (loading) {
    return (
      <div className="card shadow-sm mb-3 mx-auto player-card d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mb-3 mx-auto player-card">
      {/* Image at the top */}
      <div className="text-center pt-5 pb-3">
        <div className="player-image-container rounded-circle mx-auto">
          {user && user.photoURL ? (
            <div className="image-wrapper">
              <Image
                src={user.photoURL}
                priority
                alt={`${player.name}'s profile`}
                width={120}
                height={120}
                className="profile-image"
                sizes="(max-width: 576px) 100px, 120px"
              />
            </div>
          ) : player.name ? (
            <div className="first-letter-container rounded-circle d-flex align-items-center justify-content-center mx-auto">
              <span className="first-letter">
                {player.name.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Details below */}
      <div className="card-body">
        <h5 className="card-title d-flex align-items-center justify-content-center gap-2 mb-3">
          {player.name}
          <div>
            {player.isCaptain && (
              <span className="badge bg-primary me-1 text-light ml-1">C</span>
            )}
            {player.isViceCaptain && (
              <span className="badge bg-secondary text-light ml-1">VC</span>
            )}
          </div>
        </h5>
        <div className="card-text">
          <div className="row g-3">
            <div className="col-6">
              <p className="mb-2">
                <small className="text-muted">Role</small>
                <br />
                <span className="fw-medium">{player.role || "-"}</span>
              </p>
            </div>
            <div className="col-6">
              <p className="mb-2">
                <small className="text-muted">Age</small>
                <br />
                <span className="fw-medium">
                  {user && user.dateOfBirth
                    ? calculateAge(user.dateOfBirth)
                    : "Not available"}
                </span>
              </p>
            </div>
            <div className="col-6">
              <p className="mb-2">
                <small className="text-muted">DOB</small>
                <br />
                <span className="fw-medium">
                  {user && user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString()
                    : "Not available"}
                </span>
              </p>
            </div>
            <div className="col-6">
              <p className="mb-2">
                <small className="text-muted">Jersey No</small>
                <br />
                <span className="fw-medium">{player.jerseyNumber || "-"}</span>
              </p>
            </div>
            <div className="col-6">
              <p className="mb-2">
                <small className="text-muted">Mother's Name</small>
                <br />
                <span className="fw-medium">{player.motherName || "-"}</span>
              </p>
            </div>
            <div className="col-6">
              <p className="mb-2">
                <small className="text-muted">Contact</small>
                <br />
                <span className="fw-medium">
                  {user && user.phoneNumber ? user.phoneNumber : "-"}
                </span>
              </p>
            </div>
            <div className="col-12">
              <p className="mb-2">
                <small className="text-muted">Jersey Name</small>
                <br />
                <span className="fw-medium">{player.jerseyName || "-"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .player-card {
          height: 100%;
          min-height: 450px;
          width: 100%;
          max-width: 320px;
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          background-color: #ffffff;
          overflow: hidden;
          position: relative;
          margin-bottom: 2rem;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
          border: none;
        }

        .player-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
        }

        /* Card background */
        .player-card:before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 35%; /* Cover the top third of the card */
          background: #0d6efd;
          z-index: 0;
        }

        .player-image-container {
          width: 130px;
          height: 130px;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
          border: 4px solid #ffffff;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          z-index: 1;
        }

        .player-card:hover .player-image-container {
          transform: scale(1.05) rotate(3deg);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.18);
        }

        .image-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 50%;
          background-color: #ffffff;
        }

        .profile-image {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          border-radius: 50%;
        }

        .first-letter-container {
          background: linear-gradient(135deg, #0a58ca, #0d6efd);
          color: white;
          font-size: 2.5rem;
          width: 130px;
          height: 130px;
          font-weight: bold;
          text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.3);
          box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.3);
        }

        .card-body {
          padding: 1.8rem 1.5rem;
          position: relative;
          z-index: 1;
          background-color: #ffffff;
          border-radius: 22px 22px 0 0;
          margin-top: -20px;
        }

        .card-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1.3rem;
          position: relative;
          display: inline-block;
        }

        .card-title:after {
          content: "";
          position: absolute;
          width: 40%;
          height: 3px;
          background: linear-gradient(90deg, #0a58ca, #0d6efd);
          bottom: -8px;
          left: 30%;
          border-radius: 2px;
        }

        .text-muted {
          color: #6b7280 !important;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .fw-medium {
          font-weight: 500;
          color: #374151;
          font-size: 0.95rem;
        }

        .badge {
          padding: 0.4em 0.8em;
          font-weight: 700;
          border-radius: 30px;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
        }
        .badge.bg-primary {
          background: linear-gradient(90deg, #0a58ca, #0d6efd) !important;
          box-shadow: 0 2px 5px rgba(13, 110, 253, 0.4);
          border: none;
        }

        .badge.bg-secondary {
          background: linear-gradient(90deg, #5a6268, #6c757d) !important;
          box-shadow: 0 2px 5px rgba(108, 117, 125, 0.4);
          border: none;
        }

        .row {
          margin-top: 0.75rem;
        }

        /* Field styles */
        .col-6 p,
        .col-12 p {
          position: relative;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        @media (max-width: 576px) {
          .player-card {
            min-height: 420px;
            max-width: 300px;
          }

          .player-image-container {
            width: 110px;
            height: 110px;
            margin-bottom: 10px;
          }

          .first-letter-container {
            width: 110px;
            height: 110px;
            font-size: 2rem;
          }

          .card-body {
            padding: 1.4rem 1.2rem;
          }

          .card-title {
            font-size: 1.2rem;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerCard;
