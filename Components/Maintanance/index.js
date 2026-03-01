import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";

const Maintenance = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="maintenance-container">
      <Head>
        <title>Chennai Khatri Sports Club - Under Maintenance</title>
        <meta
          name="description"
          content="Chennai Khatri Sports Club is currently under maintenance. We'll be back soon!"
        />
      </Head>

      {/* Animated background elements */}
      <div className="bg-grid"></div>
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>
      <div className="scan-line"></div>

      <div className="maintenance-content">
        <div className="glitch-border"></div>

        <div className="logo-container">
          <div className="logo-ring"></div>
          <div className="logo-ring ring-2"></div>
          <Image
            src="/logo.png"
            alt="Chennai Khatri Sports Club Logo"
            width={120}
            height={120}
            className="maintenance-logo"
          />
        </div>

        <div className="status-badge">
          <span className="pulse-dot"></span>
          SYSTEM MAINTENANCE
        </div>

        <h1 className="glitch-text" data-text="UPGRADING SYSTEMS">
          UPGRADING SYSTEMS
        </h1>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill"></div>
            <div className="progress-glow"></div>
          </div>
          <span className="progress-text">Processing{dots}</span>
        </div>

        <div className="maintenance-message">
          <div className="message-line">
            <span className="cyber-bracket">[</span>
            Enhancing your experience with Chennai Khatri Sports Club
            <span className="cyber-bracket">]</span>
          </div>
          <div className="message-line secondary">
            We'll be back online shortly. Thank you for your patience.
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="card-icon">📧</div>
            <div className="card-label">EMAIL</div>
            <a href="mailto:info@chennaikhatrisportsclub.com">
              info@chennaikhatrisportsclub.com
            </a>
          </div>
          <div className="info-card">
            <div className="card-icon">🛠️</div>
            <div className="card-label">DEV SUPPORT</div>
            <a href="mailto:ajithshah37@gmail.com">ajithshah37@gmail.com</a>
          </div>
          <div className="info-card">
            <div className="card-icon">📱</div>
            <div className="card-label">PHONE</div>
            <a href="tel:+919962748001">+91 99627 48001</a>
          </div>
        </div>

        <div className="tech-footer">
          <div className="hex-pattern"></div>
          <span>CKSC © 2024</span>
        </div>
      </div>

      <style jsx global>{`
        html,
        body {
          overflow: hidden;
          height: 100vh;
          margin: 0;
          padding: 0;
        }
      `}</style>
      <style jsx>{`
        .maintenance-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          height: 100vh;
          padding: 2rem;
          background: linear-gradient(
            135deg,
            #0a0a0a 0%,
            #1a1a2e 50%,
            #0a0a0a 100%
          );
          color: white;
          text-align: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-x: hidden;
          overflow-y: auto;
        }

        .bg-grid {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            linear-gradient(rgba(248, 191, 2, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(248, 191, 2, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
          pointer-events: none;
        }

        @keyframes gridMove {
          0% {
            transform: perspective(500px) rotateX(60deg) translateY(0);
          }
          100% {
            transform: perspective(500px) rotateX(60deg) translateY(50px);
          }
        }

        .floating-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: linear-gradient(45deg, #f8bf02, #ff6b35);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, #00d4ff, #7b2cbf);
          bottom: -50px;
          right: -50px;
          animation-delay: -4s;
        }

        .orb-3 {
          width: 150px;
          height: 150px;
          background: linear-gradient(45deg, #f8bf02, #00d4ff);
          top: 50%;
          left: 50%;
          animation-delay: -2s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -30px) scale(1.1);
          }
        }

        .scan-line {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, #f8bf02, transparent);
          animation: scan 3s linear infinite;
          opacity: 0.6;
        }

        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }

        .maintenance-content {
          position: relative;
          background: rgba(10, 10, 10, 0.85);
          padding: 3rem 2.5rem;
          border-radius: 20px;
          max-width: 600px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(248, 191, 2, 0.2);
          box-shadow:
            0 0 40px rgba(248, 191, 2, 0.1),
            inset 0 0 60px rgba(0, 0, 0, 0.5);
          z-index: 10;
        }

        .glitch-border {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 22px;
          background: linear-gradient(
            45deg,
            #f8bf02,
            transparent,
            #00d4ff,
            transparent,
            #f8bf02
          );
          background-size: 400% 400%;
          animation: borderGlow 8s ease infinite;
          z-index: -1;
          opacity: 0.5;
        }

        @keyframes borderGlow {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .logo-container {
          position: relative;
          margin-bottom: 2rem;
          display: inline-block;
        }

        .logo-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 160px;
          height: 160px;
          border: 2px solid rgba(248, 191, 2, 0.3);
          border-radius: 50%;
          animation: ringPulse 2s ease-in-out infinite;
        }

        .ring-2 {
          width: 180px;
          height: 180px;
          animation-delay: -1s;
          border-color: rgba(0, 212, 255, 0.2);
        }

        @keyframes ringPulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.6;
          }
        }

        .maintenance-logo {
          border-radius: 50%;
          border: 3px solid #f8bf02;
          padding: 5px;
          background: rgba(0, 0, 0, 0.5);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(248, 191, 2, 0.1);
          border: 1px solid rgba(248, 191, 2, 0.3);
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 3px;
          color: #f8bf02;
          margin-bottom: 1.5rem;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #f8bf02;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.5);
          }
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 1.5rem;
          color: #fff;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          position: relative;
        }

        .glitch-text {
          animation: glitch 3s infinite;
        }

        @keyframes glitch {
          0%,
          90%,
          100% {
            text-shadow: none;
          }
          92% {
            text-shadow:
              -2px 0 #00d4ff,
              2px 0 #f8bf02;
          }
          94% {
            text-shadow:
              2px 0 #00d4ff,
              -2px 0 #f8bf02;
          }
          96% {
            text-shadow:
              -1px 0 #00d4ff,
              1px 0 #f8bf02;
          }
          98% {
            text-shadow:
              1px 0 #00d4ff,
              -1px 0 #f8bf02;
          }
        }

        .progress-container {
          margin-bottom: 2rem;
        }

        .progress-bar {
          position: relative;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 60%;
          background: linear-gradient(90deg, #f8bf02, #00d4ff);
          border-radius: 2px;
          animation: loading 2s ease-in-out infinite;
        }

        .progress-glow {
          position: absolute;
          top: -2px;
          left: 0;
          height: 8px;
          width: 30%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(248, 191, 2, 0.8),
            transparent
          );
          animation: glow 1.5s ease-in-out infinite;
        }

        @keyframes loading {
          0%,
          100% {
            width: 30%;
          }
          50% {
            width: 70%;
          }
        }

        @keyframes glow {
          0% {
            left: -30%;
          }
          100% {
            left: 100%;
          }
        }

        .progress-text {
          display: block;
          margin-top: 10px;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 2px;
          font-family: monospace;
        }

        .maintenance-message {
          margin-bottom: 2rem;
        }

        .message-line {
          font-size: 1rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.9);
        }

        .message-line.secondary {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 0.5rem;
        }

        .cyber-bracket {
          color: #f8bf02;
          font-weight: bold;
          margin: 0 5px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem 0.5rem;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          background: rgba(248, 191, 2, 0.1);
          border-color: rgba(248, 191, 2, 0.3);
          transform: translateY(-3px);
        }

        .card-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .card-label {
          font-size: 0.65rem;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.5rem;
        }

        .info-card a {
          color: #f8bf02;
          text-decoration: none;
          font-size: 0.75rem;
          word-break: break-all;
          transition: all 0.3s ease;
        }

        .info-card a:hover {
          color: #00d4ff;
        }

        .tech-footer {
          position: relative;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.75rem;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 768px) {
          .maintenance-content {
            padding: 2rem 1.5rem;
            margin: 1rem;
          }

          h1 {
            font-size: 1.4rem;
            letter-spacing: 2px;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .info-card {
            padding: 1rem;
          }

          .status-badge {
            font-size: 0.65rem;
            padding: 6px 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default Maintenance;
