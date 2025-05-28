import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <main className="flex-grow-1">
      <section className="position-relative overflow-hidden hero-section">
        {/* Background */}
        <div 
          className="position-absolute top-0 start-0 w-100 h-100 bg-wrapper"
          style={{ 
            backgroundColor: '#001630',
          }}
        >
          <div className="gradient-overlay"></div>
          <div className="grid-pattern"></div>
        </div>

        <div className="container position-relative py-5" style={{ zIndex: 1 }}>
          <div className="row min-vh-100 align-items-center">
            <div className="col-lg-6 text-center mb-5 mb-lg-0">
              <div className="hero-content">
                <div className="logo-container cyber-border">
                  <Image
                    src="/logo.png"
                    alt="Chennai Khatri Sports Club"
                    width={isMobile ? 180 : 240}
                    height={isMobile ? 180 : 240}
                    className="hero-logo"
                    priority
                  />
                </div>
                <h1 className="hero-title glow-text">Chennai Khatri Sports Club</h1>
                <p className="hero-subtitle neon-text">Unleashing Sporting Excellence</p>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-card cyber-card">
                <div className="hero-card-content">
                  <div className="membership-title">
                    <span className="star-icon">✦</span>
                    <span className="title-text">Premium Membership</span>
                  </div>
                  <h2 className="welcome-text">Welcome Champion!</h2>
                  <div className="description-container">
                    <p className="hero-description">
                      Join our elite community of athletes and sports enthusiasts
                    </p>
                    <p className="hero-description accent-text">
                      Experience world-class facilities and professional coaching
                    </p>
                  </div>
                  <div className="cta-container">
                    <Link href="/profile" passHref legacyBehavior>
                      <a className="cta-button neon-button">
                        <span className="cta-icon pulse-icon">👤</span>
                        <span className="button-text">View Profile</span>
                        <div className="button-glow"></div>
                      </a>
                    </Link>
                    <Link href="/team" passHref legacyBehavior>
                      <a className="cta-button secondary cyber-button">
                        <span className="cta-icon trophy pulse-icon">🏆</span>
                        <span className="button-text">Join Team</span>
                        <div className="button-lines"></div>
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Wave divider */}
        <div className="position-absolute bottom-0 start-0 w-100 wave-container">
          <div className="cyber-line"></div>
          <svg className="wave wave1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
            <path fill="rgba(255, 255, 255, 0.7)" fillOpacity="0.7" d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,42.7C840,32,960,32,1080,42.7C1200,53,1320,75,1380,85.3L1440,96L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
          </svg>
          <svg className="wave wave2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
            <path fill="rgba(255, 255, 255, 0.5)" fillOpacity="0.5" d="M0,32L48,37.3C96,43,192,53,288,64C384,75,480,85,576,80C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"></path>
          </svg>
          <svg className="wave wave3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100">
            <path fill="rgba(255, 255, 255, 1)" fillOpacity="1" d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,42.7C840,32,960,32,1080,42.7C1200,53,1320,75,1380,85.3L1440,96L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
          </svg>
        </div>

        <style jsx>{`
          @keyframes matrixRain {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }

          @keyframes holoGlow {
            0%, 100% { opacity: 0.7; filter: hue-rotate(0deg); }
            50% { opacity: 1; filter: hue-rotate(180deg); }
          }

          @keyframes neuralPulse {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.2); opacity: 0.9; }
          }

          @keyframes dataFlow {
            0% { transform: translateY(-50%) translateX(-50%) rotate(0deg); }
            100% { transform: translateY(-50%) translateX(-50%) rotate(360deg); }
          }

          @keyframes energyTrace {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }

          .hero-section {
            min-height: 100vh;
            background: #000;
            position: relative;
            overflow: hidden;
          }

          .bg-wrapper {
            position: absolute;
            overflow: hidden;
            z-index: 1;
          }

          .gradient-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center,
              rgba(0, 22, 48, 0.5) 0%,
              rgba(0, 22, 48, 0.8) 50%,
              rgba(0, 22, 48, 1) 100%
            );
            z-index: 2;
          }

          .grid-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 30px 30px;
            z-index: 3;
          }

          .holo-icon-wrapper {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 4;
            text-align: center;
            pointer-events: none;
            perspective: 1000px;
          }

          .holo-icon {
            opacity: 0.8;
            animation: holoGlow 6s ease-in-out infinite;
            transform: rotateY(20deg);
            text-shadow: 
              0 0 20px rgba(0, 255, 255, 0.8),
              0 0 40px rgba(0, 255, 255, 0.4),
              0 0 60px rgba(0, 255, 255, 0.2),
              2px 2px 2px rgba(255, 0, 255, 0.5);
          }

          .holo-text {
            color: #0ff;
            text-shadow:
              0 0 5px #0ff,
              0 0 10px #0ff,
              0 0 20px #f0f,
              0 0 40px #f0f;
            font-weight: 900;
            letter-spacing: 2px;
            animation: holoGlow 4s ease-in-out infinite;
          }

          .hero-content {
            color: white;
          }

          .logo-container {
            display: inline-block;
            padding: 1rem;
            border-radius: 50%;
            border: 2px solid rgba(0, 255, 255, 0.7);
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            margin-bottom: 1rem;
            transition: box-shadow 0.3s ease;
          }

          .logo-container:hover {
            box-shadow: 0 0 40px rgba(0, 255, 255, 0.9);
          }

          .hero-title {
            font-size: ${isMobile ? "2.5rem" : "4rem"};
            font-weight: 900;
            margin: 0.5rem 0;
            color: #0ff;
          }

          .hero-subtitle {
            font-size: ${isMobile ? "1.2rem" : "1.5rem"};
            color: #8ef;
            font-weight: 600;
            text-shadow: 0 0 10px #8ef;
            margin-top: 0;
          }

          .cyber-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 255, 255, 0.3);
            border-radius: 15px;
            padding: ${isMobile ? "2rem" : "3rem"};
            box-shadow:
              0 0 20px rgba(0, 255, 255, 0.2),
              inset 0 0 20px rgba(0, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
            z-index: 5;
          }

          .cyber-card::before {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              transparent 0%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 100%
            );
            animation: cardShimmer 3s linear infinite;
            pointer-events: none;
          }

          .membership-title {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(0, 255, 255, 0.2);
          }

          .star-icon {
            font-size: 1.8rem;
            color: #00f2fe;
            text-shadow: 0 0 15px rgba(0, 242, 254, 0.8);
            animation: starPulse 2s infinite ease-in-out;
          }

          .title-text {
            font-size: 1.4rem;
            font-weight: 600;
            color: white;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .welcome-text {
            font-size: ${isMobile ? "2rem" : "2.8rem"};
            margin: 1.5rem 0;
            color: #fff;
            font-weight: 700;
            letter-spacing: -0.5px;
            position: relative;
            text-shadow: 2px 2px 20px rgba(0, 242, 254, 0.3);
          }

          .description-container {
            margin: 2rem 0;
          }

          .hero-description {
            font-size: 1.2rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 1rem;
            font-weight: 400;
            letter-spacing: 0.2px;
          }

          .accent-text {
            color: #00f2fe;
            font-weight: 500;
          }

          @keyframes starPulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.8;
            }
            50% { 
              transform: scale(1.2);
              opacity: 1;
            }
          }

          .cta-container {
            display: flex;
            gap: 1.5rem;
            flex-wrap: wrap;
          }

          .cta-button {
            min-width: 180px;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.8rem;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            cursor: pointer;
            text-decoration: none;
            user-select: none;
          }

          .neon-button {
            background: linear-gradient(135deg, #00f2fe, #4facfe);
            border: none;
            color: white;
            box-shadow: 0 0 20px rgba(0,242,254,0.5);
          }

          .neon-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(0,242,254,0.7);
          }

          .cyber-button {
            background: transparent;
            border: 2px solid rgba(255,255,255,0.2);
            color: white;
          }

          .cyber-button:hover {
            border-color: #0ff;
            box-shadow: 0 0 20px rgba(0,255,255,0.4);
            transform: translateY(-2px);
          }

          .button-text {
            position: relative;
            z-index: 2;
          }

          .button-glow {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: radial-gradient(circle at center, rgba(0,255,255,0.4), transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1;
          }

          .neon-button:hover .button-glow {
            opacity: 1;
          }

          .pulse-icon {
            font-size: 1.4rem;
            animation: pulseGlow 2s ease-in-out infinite;
          }

          /* Particle styles */
          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            filter: blur(1px);
          }

          .particle-trail {
            position: absolute;
            width: 100%;
            height: 100%;
            background: inherit;
            border-radius: inherit;
            animation: trailFade 1s linear infinite;
          }

          /* Wave container */
          .wave-container {
            pointer-events: none;
            z-index: 15;
          }

          .wave {
            display: block;
            width: 100%;
            height: 100px;
          }
        `}</style>
      </section>
    </main>
  );
};

export default Hero;
