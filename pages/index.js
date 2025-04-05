import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Meta from "../Components/Meta";

export default function Home() {
  return (
    <>
      <Meta />
      <Header />
      <div className="hero-container">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="video-background"
          style={{ backgroundColor: "black" }}
        >
          <source src="/video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div
          className="absolute inset-0 z-10 bg-overlay"
          style={{
            background: "linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.65))",
          }}
        ></div>

        {/* Content */}
        <div className="hero-content">
          <h1
            className="hero-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-white animate-fade-in"
            style={{
              textShadow: "4px 4px 8px rgba(0, 38, 255, 0.3)",
              letterSpacing: "0.2em",
            }}
          >
            LAUNCHING SOON
          </h1>
          <p
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-12 tracking-wide animate-fade-in"
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Stay tuned for updates...!
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
