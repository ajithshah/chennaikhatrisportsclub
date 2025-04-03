import React from "react";
import Image from "next/image";

const PlayerCard = ({
  name,
  jerseyName,
  age,
  role,
  jerseySize,
  jerseyNumber,
  isCaptain,
  isViceCaptain,
  image,
}) => {
  return (
    <div
      className="card shadow-sm shadow mb-3 mx-2"
      style={{ maxWidth: "540px" }}
    >
      <div className="row g-0 p-2">
        <div className="col-md-4 d-flex align-items-center justify-content-center">
          <div className="position-relative">
            <Image
              src={image}
              width={200}
              height={200}
              className="rounded-circle img-fluid"
              alt={`${name}'s profile`}
              priority
              objectFit="cover"
            />
          </div>
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title d-flex align-items-center">
              {name}
              {isCaptain && <span className="badge bg-primary ms-2">C</span>}
              {isViceCaptain && (
                <span className="badge bg-secondary ms-2">VC</span>
              )}
            </h5>
            <div className="card-text">
              <div className="row">
                <div className="col-6">
                  <p className="mb-1">
                    <small className="text-muted">Role</small>
                    <br />
                    {role}
                  </p>
                  <p className="mb-1">
                    <small className="text-muted">Age</small>
                    <br />
                    {age}
                  </p>
                  <p className="mb-1">
                    <small className="text-muted">Jersey Name</small>
                    <br />
                    {jerseyName}
                  </p>
                </div>
                <div className="col-6">
                  <p className="mb-1">
                    <small className="text-muted">Jersey Number</small>
                    <br />
                    {jerseyNumber}
                  </p>
                  <p className="mb-1">
                    <small className="text-muted">Jersey Size</small>
                    <br />
                    {jerseySize}
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
