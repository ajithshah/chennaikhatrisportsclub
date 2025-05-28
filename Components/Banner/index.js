import React, { useEffect, useRef, useState } from "react";
import styles from "./banner.module.css";

const Banner = () => {
  const scrollTextRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const announcements = [
    "📢 Attention team captains and vice captains:",
    "📢 Ensure to register your team members on or before 31 May",
    "Ballot for KPL Season 3 will be held on June 1st",
    "🏏 KPL Season 3 on July 5-6 at Pachaiyappas College Ground, Chennai",
  ];

  // Skip rendering if no announcements
  if (announcements.length === 0) {
    return null;
  }

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Add a pause on hover effect
  useEffect(() => {
    const scrollElement = scrollTextRef.current;

    if (!scrollElement) return;

    const handleMouseEnter = () => {
      scrollElement.style.animationPlayState = "paused";
    };

    const handleMouseLeave = () => {
      scrollElement.style.animationPlayState = "running";
    };

    // Handle touch for mobile
    const handleTouchStart = () => {
      scrollElement.style.animationPlayState = "paused";
    };

    const handleTouchEnd = () => {
      scrollElement.style.animationPlayState = "running";

      // After a brief pause, resume the animation
      setTimeout(() => {
        if (scrollElement) {
          scrollElement.style.animationPlayState = "running";
        }
      }, 2000);
    };

    scrollElement.addEventListener("mouseenter", handleMouseEnter);
    scrollElement.addEventListener("mouseleave", handleMouseLeave);
    scrollElement.addEventListener("touchstart", handleTouchStart);
    scrollElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      scrollElement.removeEventListener("mouseenter", handleMouseEnter);
      scrollElement.removeEventListener("mouseleave", handleMouseLeave);
      scrollElement.removeEventListener("touchstart", handleTouchStart);
      scrollElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const announcementText = announcements.join(" • ");

  // For mobile devices, we'll use the CSS ::after pseudo-element for repeating content
  // No need to duplicate the text in JS as we're handling it in CSS
  const displayText = announcementText;

  return (
    <>
      <div className={styles.scrollContainer}>
        <div
          ref={scrollTextRef}
          className={styles.scrollText}
          aria-label="Announcements"
          data-content={announcementText}
        >
          {displayText}
        </div>
      </div>
    </>
  );
};

export default Banner;
