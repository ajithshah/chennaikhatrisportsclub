import React, { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

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
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
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
          min-height: 440px;
          width: 100%;
          max-width: 320px;
          border-radius: 20px;
          transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
          background-color: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.04);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          position: relative;
          margin-bottom: 2rem;
        }

        .player-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .player-card:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, #3a7bd5, #00d2ff);
        }

        .player-image-container {
          width: 120px;
          height: 120px;
          margin-bottom: 15px;
          position: relative;
          overflow: hidden;
          border: 3px solid #ffffff;
          box-shadow: 0 5px 15px rgba(0, 123, 255, 0.2);
          transition: all 0.3s ease;
        }

        .player-card:hover .player-image-container {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 123, 255, 0.3);
        }

        .image-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 50%;
        }

        .profile-image {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          border-radius: 50%;
        }

        .first-letter-container {
          background: linear-gradient(135deg, #3a7bd5, #00d2ff);
          color: white;
          font-size: 2.3rem;
          width: 120px;
          height: 120px;
          font-weight: bold;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
        }

        .card-body {
          padding: 1.5rem;
          position: relative;
          z-index: 1;
          background-color: #ffffff;
        }

        .card-body:before {
          content: "";
          position: absolute;
          top: -50px;
          left: 0;
          width: 100%;
          height: 50px;
          background: linear-gradient(to top, #ffffff, transparent);
          z-index: -1;
        }

        .card-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1.2rem;
        }

        .text-muted {
          color: #718096 !important;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .fw-medium {
          font-weight: 500;
          color: #2d3748;
          font-size: 0.95rem;
        }

        .badge {
          padding: 0.35em 0.7em;
          font-weight: 700;
          border-radius: 6px;
        }

        .badge.bg-primary {
          background: linear-gradient(90deg, #3a7bd5, #00d2ff) !important;
          box-shadow: 0 2px 5px rgba(58, 123, 213, 0.3);
        }

        .badge.bg-secondary {
          background: linear-gradient(90deg, #606c88, #3f4c6b) !important;
          box-shadow: 0 2px 5px rgba(96, 108, 136, 0.3);
        }

        .row {
          margin-top: 0.5rem;
        }

        @media (max-width: 576px) {
          .player-card {
            min-height: 410px;
            max-width: 290px;
          }

          .player-image-container {
            width: 100px;
            height: 100px;
          }

          .first-letter-container {
            width: 100px;
            height: 100px;
            font-size: 1.8rem;
          }

          .card-body {
            padding: 1.2rem;
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
