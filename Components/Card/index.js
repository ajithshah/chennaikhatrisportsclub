import React from "react";
import Image from "next/image";
import Link from "next/link";

const Card = ({ id, teamName, image, description }) => {
  return (
    <div className="card" style={{ width: "18rem", margin: "0.1rem" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "0",
          paddingBottom: "100%",
        }}
      >
        <Image
          style={{ padding: "1rem", borderRadius: "25px" }}
          src={image}
          alt={teamName}
          className="card-img-top"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
      <div className="card-body">
        <h5 className="card-title">{teamName}</h5>
        <p className="card-text">{description}</p>
        <Link href={`/team/${id}`}>
          <button className="btn btn-primary">View Player Details</button>
        </Link>
      </div>
    </div>
  );
};

export default Card;
