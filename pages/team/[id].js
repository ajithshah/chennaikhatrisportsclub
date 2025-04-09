import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Footer from "../../Components/Footer";
import Header from "../../Components/Header";
import teamData from "../../TeamData/team";
import PlayerCard from "../../Components/PlayerCard";
import { ClipLoader } from "react-spinners";
import Meta from "../../Components/Meta";

const fetchTeamData = async (id) => {
  return teamData[id] || null;
};

const TeamPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTeamData(id).then((data) => setTeamData(data));
    }
  }, [id]);

  if (!teamData) {
    return (
      <>
        <Meta />
        <Header />
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-auto text-center">
            <div className="mb-6">
              <ClipLoader 
                color="#4F46E5" 
                size={60} 
                speedMultiplier={0.7}
                aria-label="Loading..." 
              />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
              Loading Team Details
            </h2>
            <p className="text-gray-500">
              Please wait while we fetch the team information...
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Meta />
      <Header />
      <div className="container mt-5">
        <div className="team-header text-center mb-5">
          <h1 className="display-3 font-weight-bold mb-3">
            {teamData.teamName}
          </h1>
          <div className="team-subtitle">
            <h2 className="h4 text-muted mb-4">Team Players Roster</h2>
            <div className="divider">
              <span className="divider-line"></span>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          {teamData.players.map((item, index) => (
            <PlayerCard
              key={index}
              id={item.id}
              name={item.name}
              age={item.age}
              role={item.role}
              jerseyName={item.jerseyName}
              jerseySize={item.jerseySize}
              jerseyNumber={item.jerseyNumber}
              isCaptain={item.isCaptain}
              isViceCaptain={item.isViceCaptain}
              image={item.image}
            />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TeamPage;
