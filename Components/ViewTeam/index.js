import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "@/firebase";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import PlayerCard from "../PlayerCard";
import { Container, Spinner } from "react-bootstrap";

const ViewTeam = () => {
  const router = useRouter();
  const [team, setTeam] = useState(null);
  const { teamId } = router.query;

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
    }
  }, [teamId]);

  const fetchTeam = async (teamId) => {
    try {
      const teamDoc = await getDoc(doc(db, "cricket_teams", teamId));
      if (teamDoc.exists()) {
        setTeam(teamDoc.data());
      } else {
        console.error("No such team!");
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  if (!team) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden"></span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <div className="row mb-3">
        <div className="col-md-6">
          <h2 className="text-primary">Team Name: {team.name.toUpperCase()}</h2>
        </div>
      </div>
      <div className="text-center mb-3">
        <Image
          src={team.teamLogoUrl}
          alt={`${team.name} logo`}
          layout="intrinsic"
          width={150}
          height={150}
          priority
          className="img-fluid rounded mx-auto d-block" // Bootstrap classes for centering and styling
        />
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <h3 className="text-secondary">Captain: {team.captain}</h3>
          <p>Captain's Phone Number: {team.captainPhoneNumber}</p>
        </div>
        <div className="col-md-6">
          <h3 className="text-secondary">Vice Captain: {team.viceCaptain}</h3>
          <p>Vice Captain's Phone Number: {team.viceCaptainPhoneNumber}</p>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col">
          <h3 className="text-success">Players</h3>
        </div>
      </div>
      <div className="row">
        {team.players.map((player) => (
          <div key={player.userId} className="col-md-4 mb-3">
            <PlayerCard player={player} />
          </div>
        ))}
      </div>
    </Container>
  );
};

export default ViewTeam;
