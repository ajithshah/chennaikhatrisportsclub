import React from "react";
import styles from "../../styles/banner.module.css";

const Banner = () => {
  const announcements = [
    "📢 upcomming Events :",
    // "🏆 Summer Cricket Tournament registrations open",
    "🏏 KPL Season 3 @ July 4,5,6",
    "🎉 KPL Senior Season 1 (Men's above age 50)",
    " Register Today ",
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
