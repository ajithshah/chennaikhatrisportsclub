import Head from "next/head";
import Card from "../Components/Card";
import Header from "../Components/Header";
import kanchiSuperKingsLogo from "../public/kanchisuperkings/kanchi_super_kings_logo.png";
import vadilsBetaLogo from "../public/vadilsbeta/vadils_beta_logo.png";
import shaWarriorsLogo from "../public/shawarriors/sha_warriors_logo.png";
import khatriDawlatzLogo from "../public/khatridawlatz/khatri_dawlatz_logo.png";
import Footer from "../Components/Footer";
import Meta from "../Components/Meta";

const teamDetails = [
  {
    id: "kanchisuperkings",
    teamName: "Kanchi Super Kings",
    description: "Chennai",
    image: kanchiSuperKingsLogo,
  },
  {
    id: "vadilsbeta",
    teamName: "Vadils Beta",
    description: "Mumbai",
    image: vadilsBetaLogo,
  },
  {
    id: "kanchisuperkings",
    teamName: "Kanchi Super Kings",
    description: "Chennai",
    image: kanchiSuperKingsLogo,
  },
  {
    id: "khatridawlatz",
    teamName: "Khatri Dawlatz",
    description: "Kanchipuram",
    image: khatriDawlatzLogo,
  },
  {
    id: "shawarriors",
    teamName: "Sha Warriors",
    description: "Kanchipuram",
    image: shaWarriorsLogo,
  },
];

export default function Home() {
  return (
    <>
      <Meta />
      <Header />
      <div className="row justify-content-center align-items-center text-center pt-2 g-4">
        {teamDetails.map((item, index) => (
          <div
            className="col-sm-4 pt-4 col-md-4 col-lg-3 d-flex justify-content-center"
            key={index}
          >
            <Card
              id={item.id}
              teamName={item.teamName}
              image={item.image}
              description={item.description}
            />
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
}
