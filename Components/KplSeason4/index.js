import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";
import { useSettings } from "../../lib/useSettings";
import styles from "./kpl.module.css";

const details = [
  {
    icon: "📅",
    label: "Registration Opens",
    value: "Saturday, 24th October 2026",
  },
  {
    icon: "💰",
    label: "Registration Fee",
    value: "Rs. 6000/-",
  },
  {
    icon: "🏏",
    label: "Tournament Dates",
    value: "23rd & 24th January 2027",
  },
];

const hashtags = [
  "#KPLSeason4",
  "#ChennaiKhatriSportsClub",
  "#CricketTournament",
  "#PlayerRegistration",
  "#RoadToGlory",
];

const KplSeason4 = () => {
  const REGISTRATION_OPEN = useSettings().settings.registrationOpen;
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <p className={styles.presents}>
            🏏 Chennai Khatri Sports Club Presents 🏏
          </p>
          <h1 className={styles.title}>
            KPL <span>Season 4</span>
          </h1>
          <p className={styles.tagline}>
            🏆 The wait is over! Get ready for another thrilling season of
            cricket, competition, and champions!
          </p>
          {REGISTRATION_OPEN ? (
            <Link href="/team-registration" className={styles.badge}>
              📢 Register Your Team
            </Link>
          ) : (
            <>
              <span
                className={`${styles.badge} ${styles.badgeDisabled}`}
                aria-disabled="true"
              >
                📢 Register Your Team
              </span>
              <p className={styles.opensOn}>Opens 24th October 2026</p>
            </>
          )}
        </Container>
      </section>

      <section className={styles.detailsSection}>
        <Container>
          <Row className="g-4 justify-content-center">
            {details.map((item) => (
              <Col key={item.label} lg={4} md={6} xs={12} className="mb-4">
                <div className={styles.card}>
                  <div className={styles.cardIcon}>{item.icon}</div>
                  <div className={styles.cardLabel}>{item.label}</div>
                  <div className={styles.cardValue}>{item.value}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className={styles.messageSection}>
        <Container>
          <h2 className={styles.message}>
            💥 Bigger Battles. Stronger Teams. New Champions!
          </h2>
          <p className={styles.sub}>
            🔥 Get ready to showcase your talent, fight for glory, and be part
            of the KPL Season 4 action!
          </p>
          <h3 className={styles.road}>👑 The Road to Glory Starts Here!</h3>
          <p className={styles.cta}>🏏 KPL Season 4 — Let the Game Begin!</p>
          <div className={styles.tags}>
            {hashtags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default KplSeason4;
