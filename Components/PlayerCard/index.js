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
        console.log("User profile data:", userData);
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
    console.log("Date of Birth:", dateOfBirth);

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
      <div className="text-center pt-4 pb-2">
        <div className="player-image-container mx-auto">
          {user && user.photoURL ? (
            <Image
              src={user.photoURL}
              priority
              alt={`${player.name}'s profile`}
              width={120}
              height={120}
              className="rounded-circle"
              sizes="(max-width: 576px) 100px, 120px"
            />
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
          <div className="row g-2">
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
          min-height: 400px; /* Increased to accommodate vertical layout */
          width: 100%;
          max-width: 350px; /* Reduced width for a more compact card */
          border-radius: 12px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .player-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .player-image-container {
          width: 120px;
          height: 120px;
          margin-bottom: 10px;
        }

        .first-letter-container {
          background-color: #007bff;
          color: white;
          font-size: 2rem;
          width: 120px;
          height: 120px;
        }

        @media (max-width: 576px) {
          .player-card {
            min-height: 380px;
          }

          .player-image-container {
            width: 100px;
            height: 100px;
          }

          .first-letter-container {
            width: 100px;
            height: 100px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerCard;
