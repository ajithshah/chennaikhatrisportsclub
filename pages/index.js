import React from "react";
import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import Meta from "@/Components/Meta";
import HomePage from "@/Components/HomePage";

export default function Home() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Meta />
      <main className="flex-grow-1">
        <Header />
        <HomePage />
      </main>
      <Footer />
    </div>
  );
}


// import React, { useState, useEffect } from "react";
// import Header from "../Components/Header";
// import Footer from "../Components/Footer";
// import Meta from "../Components/Meta";
// import { useRouter } from "next/router";
// import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
// import { auth, db } from "../firebase";
// import { getDoc, setDoc, doc } from "firebase/firestore";

// export default function Home() {
//   const [user, setUser] = useState(null);
//   const provider = new GoogleAuthProvider();
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setUser(user);
//       } else {
//         setUser(null);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const signInWithGoogle = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;
//       if (user) {
//         const userRef = doc(db, "users", user.uid);
//         const userSnap = await getDoc(userRef);

//         const userData = {
//           uid: user.uid,
//           email: user.email,
//           displayName: user.displayName,
//           photoURL: user.photoURL,
//           providerId: user.providerData[0].providerId,
//           lastLogin: new Date().toISOString(),
//         };

//         await setDoc(userRef, userData, { merge: true });

//         if (!userSnap.exists()) {
//           userData.isAdmin = false;
//           userData.createdAt = new Date().toISOString();
//         }
//         router.push("/profile/edit");

//         await setDoc(userRef, userData, { merge: true });
//       }
//     } catch (error) {
//       console.error("Error signing in with Google:", error);
//     }
//   };
//   return (
//     <>
//       <Meta />
//       <Header />
//       <div className="hero-container">
//         {/* Background Video */}
//         <video
//           autoPlay
//           loop
//           muted
//           playsInline
//           className="video-background"
//           style={{ backgroundColor: "black" }}
//         >
//           <source src="/video.mp4" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>

//         <div
//           className="absolute inset-0 z-10 bg-overlay"
//           style={{
//             background: "linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.65))",
//           }}
//         ></div>

//         {/* Content */}
//         <div className="hero-content">
//           <h1
//             className="hero-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-white animate-fade-in"
//             style={{
//               textShadow: "4px 4px 8px rgba(0, 38, 255, 0.3)",
//               letterSpacing: "0.2em",
//             }}
//           >
//             LAUNCHING SOON
//           </h1>
//           <p
//             className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-12 tracking-wide animate-fade-in"
//             style={{
//               textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
//             }}
//           >
//             Stay tuned for updates...!
//           </p>
//           <p>
//             {user ? (
//               <div
//                 className="text-white text-center animate-fade-in mx-auto"
//                 style={{
//                   width: "auto",
//                   minWidth: "200px",
//                   maxWidth: "300px",
//                   textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
//                   padding: "1rem",
//                   borderRadius: "8px",
//                   background: "rgba(255,255,255,0.1)",
//                   backdropFilter: "blur(10px)",
//                   border: "1px solid rgba(255,255,255,0.2)",
//                 }}
//               >
//                 Welcome,{" "}
//                 <span className="font-semibold">{user.displayName}</span>!
//               </div>
//             ) : (
//               <button
//                 onClick={signInWithGoogle}
//                 className="px-4 py-2 btn btn-primary rounded-pill"
//                 style={{
//                   transition: "all 0.3s ease",
//                   transform: "translateY(0)",
//                   fontWeight: "500",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.transform = "translateY(-2px)";
//                   e.currentTarget.style.boxShadow =
//                     "0 4px 12px rgba(13, 110, 253, 0.3)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.transform = "translateY(0)";
//                   e.currentTarget.style.boxShadow = "none";
//                 }}
//               >
//                 Sign Up with Google
//               </button>
//             )}
//           </p>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// }
