// import Head from "next/head";
// import Card from "../Components/Card";
import Header from "../Components/Header";
// import kanchiSuperKingsLogo from "../public/kanchisuperkings/kanchi_super_kings_logo.png";
// import vadilsBetaLogo from "../public/vadilsbeta/vadils_beta_logo.png";
// import shaWarriorsLogo from "../public/shawarriors/sha_warriors_logo.png";
// import khatriDawlatzLogo from "../public/khatridawlatz/khatri_dawlatz_logo.png";
// import Footer from "../Components/Footer";
import Meta from "../Components/Meta";

// const teamDetails = [
//   {
//     id: "kanchisuperkings",
//     teamName: "Kanchi Super Kings",
//     description: "Chennai",
//     image: kanchiSuperKingsLogo,
//   },
//   {
//     id: "vadilsbeta",
//     teamName: "Vadils Beta",
//     description: "Mumbai",
//     image: vadilsBetaLogo,
//   },
//   {
//     id: "kanchisuperkings",
//     teamName: "Kanchi Super Kings",
//     description: "Chennai",
//     image: kanchiSuperKingsLogo,
//   },
//   {
//     id: "khatridawlatz",
//     teamName: "Khatri Dawlatz",
//     description: "Kanchipuram",
//     image: khatriDawlatzLogo,
//   },
//   {
//     id: "shawarriors",
//     teamName: "Sha Warriors",
//     description: "Kanchipuram",
//     image: shaWarriorsLogo,
//   },
// ];

// export default function Home() {
//   return (
//     <>
//       <Meta />
//       <Header />
//       <div className="row justify-content-center align-items-center text-center pt-2 g-4">
//         {teamDetails.map((item, index) => (
//           <div
//             className="col-sm-4 pt-4 col-md-4 col-lg-3 d-flex justify-content-center"
//             key={index}
//           >
//             <Card
//               id={item.id}
//               teamName={item.teamName}
//               image={item.image}
//               description={item.description}
//             />
//           </div>
//         ))}
//       </div>
//       <Footer />
//     </>
//   );
// }

import { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  const images = [
    "https://images.unsplash.com/photo-1509721434272-b79147e0e708?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
    "https://images.unsplash.com/photo-1506710507565-203b9f24669b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1536&q=80",
    "https://images.unsplash.com/photo-1536987333706-fc9adfb10d91?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
  ];

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Implement your backend API call here
      // For example, using fetch API
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        setMessage("Failed to subscribe. Try again!");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again!");
    }
  };
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `url(${images[currentImage]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.7,  // Increase opacity for image background
      }}
    >
      <div className="absolute inset-0 bg-black opacity-100"></div> {/* Change opacity to 60% */}
      <Meta />
      <Header />
      <Head>
        <title>Launching Soon</title>
      </Head>
  
      <div className="d-flex justify-content-center align-items-center vh-100 text-center text-white fade-in relative">
      <div className="p-4 container mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        <h1 className="display-1 fw-bold mb-4 animate-pulse" style={{ fontFamily: 'Arial, sans-serif' }}>
          LAUNCHING SOON
        </h1>
        <p className="fs-4 mb-8 fw-bold" style={{ fontFamily: 'Arial, sans-serif' }}>Stay tuned for updates!</p>
      </div>
    </div>
    </div>
  );
  
}
