import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { auth, db } from "../../../firebase";
import Link from "next/link";
import PrivacyModel from "@/Components/Model/PrivacyModel";
import TermsModal from "@/Components/Model/TermsModal";
import Team from "@/Components/HomePage/Team";
import AboutUs from "@/Components/About";
import Banner from "@/Components/Banner";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { signInWithGoogle as authSignInWithGoogle } from "../../../utils/auth";

const HomePage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [dbUserData, setDbUserData] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModel, setShowPrivacyModel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if viewport is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);

        // Fetch user data from Firestore
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setDbUserData(userSnap.data());
        }
      } else {
        setUser(null);
        setDbUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const user = await authSignInWithGoogle(
        // Success callback
        (user) => {
          setShowSuccess(true);
          setUser(user);
          router.push("/");
        },
        // Error callback
        (error) => {
          console.error("Error signing in with Google:", error);
          setIsLoading(false);
        },
        setIsLoading
      );

      if (!user) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setIsLoading(false);
    }
  };

  // Get display name from the database if available
  const displayName = dbUserData?.displayName || user?.displayName || "Member";

  if (user) {
    return (
      <div className="d-flex flex-column">
        <main className="flex-grow-1">
          {/* Hero Section */}
          <section className="position-relative overflow-hidden">
            {/* Background with animated gradient */}
            <div className="position-absolute top-0 start-0 w-100 h-100 animated-bg"></div>

            {/* Gradient overlay */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,48,130,0.8) 0%, rgba(0,92,185,0.7) 100%)",
              }}
            ></div>

            {/* Floating Sports Equipment Animation */}
            <div className="floating-objects">
              <div className="floating-item item1">🏏</div>
              <div className="floating-item item2">🏆</div>
              <div className="floating-item item3">⚾</div>
              <div className="floating-item item4">🏐</div>
              <div className="floating-item item5">🏓</div>
              <div className="floating-item item6">🏉</div>
              <div className="floating-item item7">🏸</div>
              <div className="floating-item item8">🏊</div>
            </div>

            {/* Add this CSS for gradient and floating animations */}
            <style jsx>{`
              .animated-bg {
                background: linear-gradient(
                  -45deg,
                  #0030e0,
                  #0052b9,
                  #0087e5,
                  #00b0ff
                );
                background-size: 400% 400%;
                animation: gradient 15s ease infinite;
              }

              @keyframes gradient {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }

              .floating-objects {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 0;
                pointer-events: none;
              }

              .floating-item {
                position: absolute;
                font-size: ${isMobile ? "1.5rem" : "2rem"};
                opacity: 0.3;
                filter: blur(0.5px);
                animation-timing-function: ease-in-out;
                animation-iteration-count: infinite;
                animation-direction: alternate;
              }

              .item1 {
                top: 10%;
                left: 10%;
                animation: float 8s infinite;
              }

              .item2 {
                top: 20%;
                right: 10%;
                animation: float 12s infinite 1s;
              }

              .item3 {
                bottom: 30%;
                left: 15%;
                animation: float 9s infinite 2s;
              }

              .item4 {
                bottom: 10%;
                right: 20%;
                animation: float 11s infinite 3s;
              }

              .item5 {
                top: 40%;
                left: 30%;
                animation: float 10s infinite 2s;
              }

              .item6 {
                top: 60%;
                right: 30%;
                animation: float 9s infinite 1s;
              }

              .item7 {
                top: 75%;
                left: 50%;
                animation: float 12s infinite 3s;
              }

              .item8 {
                top: 30%;
                right: 50%;
                animation: float 10s infinite 2.5s;
              }

              @keyframes float {
                0% {
                  transform: translateY(0) translateX(0) rotate(0deg) scale(1);
                }
                50% {
                  transform: translateY(-15px) translateX(15px) rotate(5deg)
                    scale(1.1);
                }
                100% {
                  transform: translateY(15px) translateX(-15px) rotate(-5deg)
                    scale(0.95);
                }
              }
            `}</style>

            {/* Content */}
            <div
              className="container position-relative py-5"
              style={{ zIndex: 1 }}
            >
              <div className="row min-vh-100 align-items-center">
                <div
                  className={`col-lg-6 text-center ${
                    isMobile ? "mb-4" : "mb-5 mb-lg-0"
                  }`}
                >
                  <div
                    className="bg-white bg-opacity-10 p-4 rounded-circle d-inline-block mb-4 logo-container"
                    style={{ backdropFilter: "blur(5px)" }}
                  >
                    <Image
                      src="/logo.png"
                      alt="Chennai Khatri Sports Club"
                      width={isMobile ? 200 : 280}
                      height={isMobile ? 200 : 280}
                      className="img-fluid pulsing-logo "
                      priority
                    />
                  </div>
                  <h2
                    className="text-white fw-bold mb-3 slide-in-text"
                    style={{ fontSize: isMobile ? "1.5rem" : "2rem" }}
                  >
                    Chennai Khatri Sports Club
                  </h2>
                </div>

                <div className="col-lg-6">
                  <div
                    className={`card border-0 shadow-lg rounded-4 ${
                      isMobile ? "p-3" : "p-4 p-md-5"
                    } fade-in-card`}
                  >
                    <div className="card-body">
                      <div className="badge bg-primary text-white px-3 py-2 mb-3 badge-pop">
                        MEMBER PROFILE
                      </div>
                      <h1
                        className={`${
                          isMobile ? "h3" : "display-5"
                        } fw-bold text-primary mb-3`}
                      >
                        Welcome, {displayName}
                      </h1>
                      <p
                        className={`${
                          isMobile ? "" : "lead"
                        } text-secondary mb-4`}
                      >
                        Join our community of sports enthusiasts and stay
                        updated with latest events and tournaments
                      </p>

                      <div className="d-flex flex-wrap gap-3 mt-4">
                        <Link href="/profile" passHref legacyBehavior>
                          <a
                            className={`btn btn-primary rounded-pill ${
                              isMobile ? "px-3 py-2 w-100" : "px-4 py-2"
                            } pulse-btn`}
                          >
                            <i className="fas fa-user-circle me-2 mr-2"></i>
                            My Profile
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Add this CSS for content animations */}
            <style jsx>{`
              .logo-container {
                animation: appear 1s ease-out forwards;
                width: ${isMobile ? "240px" : "320px"};
                height: ${isMobile ? "240px" : "320px"};
              }

              .pulsing-logo {
                animation: pulse 3s ease-in-out infinite;
              }

              .slide-in-text {
                opacity: 0;
                transform: translateY(20px);
                animation: slideUp 0.8s ease-out 0.5s forwards;
              }

              .fade-in-card {
                opacity: 0;
                transform: translateX(30px);
                animation: fadeIn 1s ease-out 0.8s forwards;
              }

              .badge-pop {
                animation: pop 0.5s ease-out 1.5s forwards;
                transform: scale(0);
                opacity: 0;
              }

              .pulse-btn {
                transition: all 0.3s ease;
                animation: subtle-pulse 2s infinite;
              }

              .pulse-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 15px rgba(0, 123, 255, 0.4);
                animation: none;
              }

              @keyframes appear {
                from {
                  opacity: 0;
                  transform: scale(0.8);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              @keyframes pulse {
                0% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.05);
                }
                100% {
                  transform: scale(1);
                }
              }

              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateX(30px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }

              @keyframes pop {
                0% {
                  transform: scale(0);
                  opacity: 0;
                }
                70% {
                  transform: scale(1.1);
                  opacity: 1;
                }
                100% {
                  transform: scale(1);
                  opacity: 1;
                }
              }

              @keyframes subtle-pulse {
                0% {
                  box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.6);
                }
                70% {
                  box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
                }
                100% {
                  box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
                }
              }
            `}</style>

            {/* Animated Wave divider */}
            <div className="position-absolute bottom-0 start-0 w-100 wave-container">
              <svg
                className="wave wave1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 100"
                style={{ display: "block" }}
              >
                <path
                  fill="#ffffff"
                  fillOpacity="0.7"
                  d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,42.7C840,32,960,32,1080,42.7C1200,53,1320,75,1380,85.3L1440,96L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
                ></path>
              </svg>
              <svg
                className="wave wave2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 100"
                style={{ display: "block" }}
              >
                <path
                  fill="#ffffff"
                  fillOpacity="0.5"
                  d="M0,32L48,37.3C96,43,192,53,288,64C384,75,480,85,576,80C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
                ></path>
              </svg>
              <svg
                className="wave wave3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 100"
                style={{ display: "block" }}
              >
                <path
                  fill="#ffffff"
                  fillOpacity="1"
                  d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,42.7C840,32,960,32,1080,42.7C1200,53,1320,75,1380,85.3L1440,96L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
                ></path>
              </svg>
            </div>

            {/* Keep existing CSS for wave animation */}
            <style jsx>{`
              .wave-container {
                height: ${isMobile ? "100px" : "150px"};
                overflow: hidden;
              }

              .wave {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: ${isMobile ? "80px" : "100px"};
              }

              .wave1 {
                animation: wave 8s linear infinite;
                z-index: 1;
              }

              .wave2 {
                animation: wave 10s linear infinite;
                animation-delay: -5s;
                z-index: 2;
              }

              .wave3 {
                animation: wave 12s ease-in-out infinite;
                z-index: 3;
              }

              @keyframes wave {
                0% {
                  transform: translateX(0) translateZ(0) scaleY(1);
                }
                50% {
                  transform: translateX(-25%) translateZ(0) scaleY(1.1);
                }
                100% {
                  transform: translateX(-50%) translateZ(0) scaleY(1);
                }
              }
            `}</style>
          </section>
        </main>
        <Banner />
        <AboutUs />
        <Team />
      </div>
    );
  }

  return (
    <main className="flex-grow-1 overflow-hidden">
      <div className="min-h-screen relative flex items-center justify-center px-4">
        {/* Animated particle background */}
        <div className="absolute inset-0 particles-bg"></div>

        {/* Animated circular elements */}
        <div className="circles">
          <div className="circle circle1"></div>
          <div className="circle circle2"></div>
          <div className="circle circle3"></div>
          <div className="circle circle4"></div>
          <div className="circle circle5"></div>
        </div>

        {/* Sports equipment silhouettes */}
        <div className="sports-silhouettes">
          <div className="silhouette bat">🏏</div>
          <div className="silhouette ball">⚾</div>
          <div className="silhouette trophy">🏆</div>
          <div className="silhouette shuttle">🏸</div>
        </div>

        <div
          className={`w-full ${isMobile ? "px-3" : "max-w-md"} relative z-10`}
        >
          <div
            className={`glass-card transform transition-all duration-500 zoom-in ${
              showSuccess ? "scale-105 success-glow" : "hover:scale-102"
            }`}
          >
            {!showSuccess && (
              <>
                <div className="text-center mb-8">
                  <div className="logo-container">
                    <Image
                      src="/logo.png"
                      alt="Chennai Khatri Sports Club"
                      width={isMobile ? 180 : 280}
                      height={isMobile ? 180 : 280}
                      className="object-contain rotating-glow"
                      priority
                    />
                  </div>
                  <h1
                    className={`${
                      isMobile ? "text-2xl" : "text-4xl"
                    } font-bold mb-3 text-gradient slide-up ml-2`}
                  >
                    Welcome to Chennai Khatri Sports Club
                  </h1>
                  <p
                    className={`text-gray-700 ${
                      isMobile ? "text-base" : "text-lg"
                    } mb-8 fade-in-delayed`}
                  >
                    Join our community of sports enthusiasts and stay updated
                    with latest events
                  </p>
                  <div className="mt-8 text-center fade-in-delayed-more">
                    <p
                      className={`${
                        isMobile ? "text-xs" : "text-sm"
                      } text-gray-600`}
                    >
                      By signing in, you agree to our{" "}
                      <a
                        onClick={() => setShowTermsModal(true)}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        onClick={() => setShowPrivacyModel(true)}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>
                <div className="text-center button-bounce">
                  <button
                    onClick={signInWithGoogle}
                    disabled={isLoading}
                    className="login-btn"
                    style={{ width: isMobile ? "100%" : "90%" }}
                  >
                    <div className="btn-content">
                      <span className="btn-text">Sign In with Google</span>
                      <span className="btn-icon">→</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
          <TermsModal
            show={showTermsModal}
            onHide={() => setShowTermsModal(false)}
          />
          <PrivacyModel
            show={showPrivacyModel}
            onHide={() => setShowPrivacyModel(false)}
          />
        </div>
      </div>

      <style jsx>{`
        .particles-bg {
          background: linear-gradient(135deg, #0045b5, #001d4c);
          overflow: hidden;
        }

        .particles-bg::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.2) 1px,
            transparent 1px
          );
          background-size: ${isMobile ? "25px 25px" : "40px 40px"};
          animation: particles 15s linear infinite;
        }

        @keyframes particles {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: ${isMobile ? "25px 25px" : "40px 40px"};
          }
        }

        .circles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }

        .circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(
            145deg,
            rgba(0, 123, 255, 0.3),
            rgba(0, 83, 175, 0.1)
          );
          backdrop-filter: blur(5px);
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .circle1 {
          width: ${isMobile ? "250px" : "400px"};
          height: ${isMobile ? "250px" : "400px"};
          left: -150px;
          top: -150px;
          animation: float-circle1 25s ease-in-out infinite alternate;
        }

        .circle2 {
          width: ${isMobile ? "200px" : "300px"};
          height: ${isMobile ? "200px" : "300px"};
          right: -100px;
          top: 60%;
          animation: float-circle2 18s ease-in-out infinite alternate;
        }

        .circle3 {
          width: ${isMobile ? "150px" : "200px"};
          height: ${isMobile ? "150px" : "200px"};
          right: 30%;
          top: 10%;
          animation: float-circle3 22s ease-in-out infinite alternate;
        }

        .circle4 {
          width: ${isMobile ? "100px" : "150px"};
          height: ${isMobile ? "100px" : "150px"};
          left: 30%;
          bottom: 10%;
          animation: float-circle4 15s ease-in-out infinite alternate;
        }

        .circle5 {
          width: ${isMobile ? "250px" : "350px"};
          height: ${isMobile ? "250px" : "350px"};
          left: -100px;
          bottom: -100px;
          animation: float-circle5 20s ease-in-out infinite alternate;
        }

        @keyframes float-circle1 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-30px) translateX(40px) rotate(5deg)
              scale(1.1);
            opacity: 0.8;
            background: linear-gradient(
              145deg,
              rgba(0, 123, 255, 0.4),
              rgba(0, 83, 175, 0.2)
            );
          }
          100% {
            transform: translateY(20px) translateX(60px) rotate(10deg)
              scale(0.95);
            opacity: 0.5;
          }
        }

        @keyframes float-circle2 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0.4;
          }
          60% {
            transform: translateY(40px) translateX(-30px) rotate(-8deg)
              scale(1.15);
            opacity: 0.7;
            background: linear-gradient(
              145deg,
              rgba(13, 110, 253, 0.3),
              rgba(0, 83, 175, 0.1)
            );
          }
          100% {
            transform: translateY(-20px) translateX(-50px) rotate(-15deg)
              scale(0.9);
            opacity: 0.3;
          }
        }

        @keyframes float-circle3 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-50px) translateX(-20px) rotate(-10deg)
              scale(1.2);
            opacity: 0.8;
            background: linear-gradient(
              145deg,
              rgba(0, 100, 220, 0.4),
              rgba(0, 83, 175, 0.2)
            );
          }
          100% {
            transform: translateY(-20px) translateX(30px) rotate(5deg)
              scale(0.95);
            opacity: 0.4;
          }
        }

        @keyframes float-circle4 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0.6;
          }
          70% {
            transform: translateY(30px) translateX(40px) rotate(15deg)
              scale(1.1);
            opacity: 0.9;
            background: linear-gradient(
              145deg,
              rgba(0, 123, 255, 0.5),
              rgba(0, 83, 175, 0.3)
            );
          }
          100% {
            transform: translateY(50px) translateX(10px) rotate(25deg)
              scale(0.9);
            opacity: 0.5;
          }
        }

        @keyframes float-circle5 {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-40px) translateX(30px) rotate(-5deg)
              scale(1.15);
            opacity: 0.7;
            background: linear-gradient(
              145deg,
              rgba(0, 140, 255, 0.3),
              rgba(0, 83, 175, 0.1)
            );
          }
          100% {
            transform: translateY(-10px) translateX(60px) rotate(-15deg)
              scale(0.9);
            opacity: 0.3;
          }
        }

        .sports-silhouettes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }

        .silhouette {
          position: absolute;
          font-size: ${isMobile ? "4rem" : "6rem"};
          opacity: 0.08;
          filter: blur(1px);
          color: white;
          transition: all 0.5s ease;
          animation-duration: 15s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        .bat {
          top: 20%;
          left: 5%;
          transform: rotate(-15deg);
          animation-name: float-bat;
        }

        .ball {
          bottom: 25%;
          right: 10%;
          animation-name: float-ball;
        }

        .trophy {
          top: 15%;
          right: 12%;
          animation-name: float-trophy;
        }

        .shuttle {
          bottom: 15%;
          left: 10%;
          transform: rotate(20deg);
          animation-name: float-shuttle;
        }

        @keyframes float-bat {
          0% {
            transform: rotate(-15deg) translateY(0) scale(1);
            opacity: 0.08;
          }
          25% {
            transform: rotate(-10deg) translateY(-20px) scale(1.05);
            opacity: 0.1;
          }
          50% {
            transform: rotate(-5deg) translateY(-30px) translateX(10px)
              scale(1.1);
            opacity: 0.12;
          }
          75% {
            transform: rotate(-10deg) translateY(-15px) translateX(5px)
              scale(1.05);
            opacity: 0.1;
          }
          100% {
            transform: rotate(-15deg) translateY(0) scale(1);
            opacity: 0.08;
          }
        }

        @keyframes float-ball {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.08;
          }
          33% {
            transform: translateY(-25px) translateX(-15px) rotate(120deg);
            opacity: 0.11;
          }
          66% {
            transform: translateY(15px) translateX(-25px) rotate(240deg);
            opacity: 0.09;
          }
          100% {
            transform: translateY(0) rotate(360deg);
            opacity: 0.08;
          }
        }

        @keyframes float-trophy {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.08;
          }
          40% {
            transform: translateY(-30px) translateX(10px) scale(1.1);
            opacity: 0.12;
            filter: blur(0.5px);
          }
          80% {
            transform: translateY(10px) translateX(20px) scale(0.95);
            opacity: 0.07;
            filter: blur(1.5px);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.08;
            filter: blur(1px);
          }
        }

        @keyframes float-shuttle {
          0% {
            transform: rotate(20deg) translateY(0);
            opacity: 0.08;
          }
          30% {
            transform: rotate(15deg) translateY(-20px) translateX(15px);
            opacity: 0.1;
          }
          60% {
            transform: rotate(25deg) translateY(15px) translateX(25px);
            opacity: 0.12;
          }
          100% {
            transform: rotate(20deg) translateY(0);
            opacity: 0.08;
          }
        }

        .sports-silhouettes:hover .silhouette {
          animation-play-state: paused;
        }

        .silhouette:hover {
          opacity: 0.2 !important;
          filter: blur(0) !important;
          transform: scale(1.2) !important;
          cursor: default;
          transition: all 0.3s ease;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: ${isMobile ? "1.5rem" : "2.5rem"};
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .success-glow {
          box-shadow: 0 0 30px rgba(46, 213, 115, 0.6);
          background: rgba(240, 255, 245, 0.9);
        }

        .logo-container {
          display: inline-block;
          padding: ${isMobile ? "0.5rem" : "1rem"};
          margin-bottom: ${isMobile ? "1rem" : "1.5rem"};
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px rgba(0, 83, 175, 0.2);
          animation: logo-float 3s ease-in-out infinite;
        }

        @keyframes logo-float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.02);
          }
        }

        .rotating-glow {
          animation: rotating-shadow 10s linear infinite;
        }

        @keyframes rotating-shadow {
          0% {
            filter: drop-shadow(0 0 8px rgba(13, 110, 253, 0.4));
          }
          25% {
            filter: drop-shadow(0 0 8px rgba(13, 110, 253, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(0, 53, 125, 0.4));
          }
          75% {
            filter: drop-shadow(0 0 8px rgba(13, 110, 253, 0.7));
          }
          100% {
            filter: drop-shadow(0 0 8px rgba(13, 110, 253, 0.4));
          }
        }

        .text-gradient {
          background: linear-gradient(120deg, #0045b5, #007bff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        .slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-delayed {
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.4s forwards;
        }

        .fade-in-delayed-more {
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.8s forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .zoom-in {
          animation: zoomIn 0.7s ease-out forwards;
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .button-bounce {
          opacity: 0;
          animation: bounceIn 0.6s ease-out 1s forwards;
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .login-btn {
          background: linear-gradient(to right, #0053af, #007bff);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 0;
          font-weight: 600;
          overflow: hidden;
          position: relative;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 83, 175, 0.3);
          max-width: 300px;
          height: ${isMobile ? "48px" : "54px"};
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 20px rgba(0, 83, 175, 0.4);
        }

        .login-btn:active {
          transform: translateY(1px);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 0 1.5rem;
        }

        .btn-text {
          margin-right: 0.5rem;
          transition: transform 0.3s ease;
          font-size: ${isMobile ? "0.9rem" : "1rem"};
        }

        .btn-icon {
          font-size: ${isMobile ? "1.1rem" : "1.25rem"};
          transition: transform 0.3s ease;
        }

        .login-btn:hover .btn-text {
          transform: translateX(-5px);
        }

        .login-btn:hover .btn-icon {
          transform: translateX(5px);
        }
      `}</style>
    </main>
  );
};

export default HomePage;
