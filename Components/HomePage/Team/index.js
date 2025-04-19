import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import Link from "next/link";
import Image from "next/image";
import { Container, Spinner } from "react-bootstrap";

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsCollection = collection(db, "cricket_teams");
        const teamSnapshot = await getDocs(teamsCollection);
        const teamsList = teamSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeams(teamsList);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden"></span>
        </Spinner>
      </Container>
    );
  }

  return (
    <>
      {teams.map((team) => (
        <section className="py-5 bg-light">
          <div className="container">
          <h2 className="text-center mb-5 fw-bold">Our Cricket Teams</h2>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                <div key={team.id} className="col mt-4">
                  <div className="card shadow-sm">
                    <div className="text-center">
                      <Image
                        src="/cricket.png"
                        alt={`${team.name} logo`}
                        layout="responsive"
                        width={150}
                        height={150}
                        priority
                        className="img-fluid"
                      />
                    </div>
                    <hr></hr>
                    <div className="card-body d-flex flex-column">
                      <h3 className="card-title h5 text-center mb-3">
                        {team.name}
                      </h3>
                      <Link href={`/team/${team.id}`} passHref legacyBehavior>
                        <button className="btn btn-primary mt-auto mx-auto">
                          View Team Members
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
};

export default Team;
