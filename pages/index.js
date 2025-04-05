// import Head from "next/head";
// import Card from "../Components/Card";
// import Header from "../Components/Header";
// import kanchiSuperKingsLogo from "../public/kanchisuperkings/kanchi_super_kings_logo.png";
// import vadilsBetaLogo from "../public/vadilsbeta/vadils_beta_logo.png";
// import shaWarriorsLogo from "../public/shawarriors/sha_warriors_logo.png";
// import khatriDawlatzLogo from "../public/khatridawlatz/khatri_dawlatz_logo.png";
// import Footer from "../Components/Footer";
// import Meta from "../Components/Meta";
// import { db } from "../firebase";
// import { collection, addDoc } from "firebase/firestore";
// import React, { useState } from "react";
// // import { useAuthState } from "react-firebase-hooks/auth";

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

// async function addData(name, age) {
//   try {
//     if (!name || !age) {
//       throw new Error("Name and age are required");
//     }

//     const docRef = await addDoc(collection(db, "projects"), {
//       name: name,
//       age: age,
//     });
//     console.log("Document written with ID: ", docRef.id);
//     return true;
//   } catch (e) {
//     console.error("Error adding document: ", e);
//     return false;
//   }
// }

// export default function Home() {
//   const [name, setName] = useState("");
//   const [age, setAge] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const success = await addData(name, age);
//       if (success) {
//         setName("");
//         setAge("");
//         alert("Data added successfully");
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       alert("Error adding data. Please try again.");
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <Meta />
//       <Header />
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <input
//           type="number"
//           placeholder="Age"
//           value={age}
//           onChange={(e) => setAge(e.target.value)}
//         />
//       <button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? 'Submitting...' : 'Submit'}
//         </button>
//       </form>

//       {/* <div className="row justify-content-center align-items-center text-center pt-2 g-4"> */}

//       {/* <div
//         style={{
//           display: "flex",
//           height: "100vh",
//           width: "100vw",
//           alignItems: "center",
//           justifyContent: "center",
//           flexDirection: "column",
//           gridGap: 8,
//           background:
//             "linear-gradient(180deg, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
//         }}
//       >
//         {loading && <h4>Loading...</h4>}
//         {!user && <Auth />}
//         {user && (
//           <>
//             <h1>Pineapple on Pizza?</h1>

//             <div style={{ flexDirection: "row", display: "flex" }}>
//               <button
//                 style={{ fontSize: 32, marginRight: 8 }}
//                 onClick={() => addVoteDocument("yes")}
//               >
//                 ✔️🍍🍕
//               </button>
//               <h3>
//                 Pineapple Lovers:{" "}
//                 {votes?.docs?.filter((doc) => doc.data().vote === "yes").length}
//               </h3>
//             </div>
//             <div style={{ flexDirection: "row", display: "flex" }}>
//               <button
//                 style={{ fontSize: 32, marginRight: 8 }}
//                 onClick={() => addVoteDocument("no")}
//               >
//                 ❌🍍🍕
//               </button>
//               <h3>
//                 Pineapple Haters:{" "}
//                 {votes?.docs?.filter((doc) => doc.data().vote === "no").length}
//               </h3>
//             </div>

//             <div style={{ marginTop: "64px" }}>
//               <h3>Voters:</h3>
//               <div
//                 style={{
//                   maxHeight: "320px",
//                   overflowY: "auto",
//                   width: "240px",
//                 }}
//               >
//                 {votes?.docs?.map((doc) => (
//                   <>
//                     <VoterList
//                       id={doc.id}
//                       key={doc.id}
//                       vote={doc.data().vote}
//                     />
//                   </>
//                 ))}
//               </div>
//             </div>
//           </>
//         )}
//       </div> */}
//       {/* <div className="row justify-content-center align-items-center text-center pt-2 g-4">
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
//       </div> */}
//       <Footer />
//     </>
//   );
// }

import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Meta from "../Components/Meta";

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
    <>
      <Meta />
      <Header />
      <div
        className="absolute inset-0 flex flex-col justify-center items-center"
        style={{
          backgroundImage: `
          linear-gradient(
            rgba(0, 0, 0, 0.5),
            rgba(0, 0, 0, 0.5)
          ),
          url(${images[currentImage]})
        `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundColor: "#000",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-200 opacity-10"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center"></div>
        <div className="absolute inset-0 bg-black opacity-60"></div>{" "}
        <Head>
          <title>Chennai Khatri Sports Club</title>
        </Head>
        <div className="d-flex justify-content-center align-items-center vh-100 text-center text-white fade-in relative">
          <div
            className="p-4 container mx-auto"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <h1
              className="text-4xl md:text-10xl lg:text-10xl font-bold mb-4 animate-pulse"
              style={{
                fontFamily: "Arial, sans-serif",
                letterSpacing: ".3em",
                textShadow: "10px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              LAUNCHING SOON
            </h1>
            <p
              className="text-lg md:text-2xl lg:text-4xl mb-4 font-bold"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              Stay tuned for updates...!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
