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

import { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {

  return (
    <>
      <Meta />
      <Header />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-200 opacity-10"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center"></div>
        <div className="absolute inset-0 bg-black opacity-60"></div>{" "}
        <Head>
          <title>Launching Soon</title>
        </Head>
        <div className="d-flex justify-content-center align-items-center vh-100 text-center text-white fade-in relative">
          <div
            className="p-4 container mx-auto"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <h1
              className="text-4xl md:text-10xl lg:text-10xl font-bold mb-4 animate-pulse"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              LAUNCHING SOON
            </h1>
            <p
              className="text-lg md:text-2xl lg:text-4xl mb-4 font-bold"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              Stay tuned for updates!
            </p>
          </div>
        </div>
      <Footer />
    </>
  );
}
