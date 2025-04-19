import React, { useState, useEffect } from "react";
import Image from "next/image";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const PlayerCard = ({ player }) => {
  const [user, setUser] = useState(null);
  const userId = player.userId;

  useEffect(() => {
    if (userId) {
      fetchUser(userId);
    }
  }, [userId]);

  const fetchUser = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUser(userDoc.data());
      } else {
        console.error("No such user!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  return (
    <div className="card shadow-sm shadow mb-3 mx-2" style={{ maxWidth: "540px" }}>
      <div className="row g-0 p-2">
        <div className="col-12 col-md-4 d-flex align-items-center justify-content-center">
          <div className="position-relative">
            <Image
              src="/profile_user.jpg" // You can set the player.profile or other source here
              width={200}
              height={200}
              className="rounded-circle img-fluid"
              alt={`${player.name}'s profile`}
              priority
            />
          </div>
        </div>
        <div className="col-12 col-md-8">
          <div className="card-body">
            <h5 className="card-title d-flex align-items-center">
              {player.name}
              {player.isCaptain && <span className="badge bg-primary ml-2">C</span>}
              {player.isViceCaptain && <span className="badge bg-secondary ml-1">VC</span>}
            </h5>
            <div className="card-text">
              <div className="row">
                <div className="col-6 col-md-6">
                  <p className="mb-1">
                    <small className="text-muted">Role</small>
                    <br />
                    {player.role || "-"}
                  </p>
                </div>
                <div className="col-6 col-md-6">
                  <p className="mb-1">
                    <small className="text-muted">Age</small>
                    <br />
                    {user ? calculateAge(user.dateOfBirth) : "-"}
                  </p>
                  <p className="mb-1">
                    <small className="text-muted">Jersey Name</small>
                    <br />
                    {player.jerseyName || "-"}
                  </p>
                </div>
                <div className="col-6 col-md-6">
                  <p className="mb-1">
                    <small className="text-muted">Jersey No</small>
                    <br />
                    {player.jerseyNumber || "-"}
                  </p>
                </div>
                <div className="col-6 col-md-6">
                  <p className="mb-1">
                    <small className="text-muted">Jersey Size</small>
                    <br />
                    {player.jerseySize ? player.jerseySize.toUpperCase() : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
