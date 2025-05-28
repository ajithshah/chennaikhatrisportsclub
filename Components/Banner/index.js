import React from "react";
import styles from "../../styles/banner.module.css";

const Banner = () => {
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
