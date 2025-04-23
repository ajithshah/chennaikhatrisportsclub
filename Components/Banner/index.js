import React from "react";
import styles from "../../styles/banner.module.css";

const Banner = () => {
  const announcements = [
    // "🏏 Chennai Khatri Premier League starting July 2025",
    // "🏆 Summer Cricket Tournament registrations open",
    // "📢 Youth Cricket Camp coming soon",
    // "🎉 Join us for Community Day on May 5, 2025"
  ];

  // Skip rendering if no announcements
  if (announcements.length === 0) {
    return null;
  }

  return (
    <>
      {/* Simple Scrolling Text Banner */}
      <div className={styles.scrollContainer}>
        <div className={styles.scrollText}>{announcements.join(" • ")}</div>
      </div>
    </>
  );
};

export default Banner;
