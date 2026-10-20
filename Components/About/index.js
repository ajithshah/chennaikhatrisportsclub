import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import Meta from "../Meta";
import styles from "./about.module.css";

const founders = [
  { id: 1, name: "Rajini", image: "/founder2.jpeg" },
  { id: 2, name: "Vinod Kumar", image: "/founder3.jpeg" },
  { id: 3, name: "Sushil", image: "/founder1.jpeg" },
  { id: 4, name: "Kamal", image: "/founder4.jpeg" },
];

const stats = [
  { value: "2023", label: "Established" },
  { value: "3", label: "Cricket seasons" },
  { value: "8+", label: "Teams" },
  { value: "100+", label: "Active members" },
];

const AboutUs = () => {
  return (
    <>
      <Meta title="About Us | Chennai Khatri Sports Club" />
      <div className={styles.page}>
        <section className={styles.hero}>
          <Container>
            <span className={styles.tag}>🏏 Chennai Khatri Sports Club</span>
            <h1 className={styles.title}>
              About <span>Us</span>
            </h1>
            <p className={styles.subtitle}>
              Bringing the Khatri community together through sports.
            </p>
          </Container>
        </section>

        <Container className={styles.statsWrap}>
          <div className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </Container>

        <section className={styles.section}>
          <Container>
            <Row className="align-items-center">
              <Col lg={6} md={12} className="mb-4">
                <span className={styles.eyebrow}>Our story</span>
                <h2 className={styles.heading}>How it all Began!!</h2>
                <p className={styles.text}>
                  Established in 2023, the Chennai Khatri Sports Club began with
                  a simple yet powerful idea: to break the monotony of mobile
                  phone usage and reignite a passion for outdoor games. This
                  vision, initially shared by Mr. V. Kamal and Mr. G. Rajini,
                  soon gained momentum as Mr. B.G. Vinod and Mr. B.S. Sushil
                  joined hands to bring it to life.
                </p>
                <p className={styles.text}>
                  Our mission is to bring the Khatri community together through
                  sports, fostering unity, teamwork, and an active lifestyle.
                  Since our inception, we have proudly completed three
                  successful seasons of the Khatri Premier League and one season
                  of badminton, with many more milestones to come.
                </p>
              </Col>
              <Col lg={6} md={12} className="mb-4">
                <div className={styles.photoFrame}>
                  <Image
                    src="/cricket.jpeg"
                    alt="Chennai Khatri Sports Club"
                    width={560}
                    height={380}
                    className={styles.photo}
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className={`${styles.section} ${styles.alt}`}>
          <Container>
            <Row className="align-items-center">
              <Col lg={6} md={12} className="mb-4 order-lg-2">
                <span className={styles.eyebrow}>What drives us</span>
                <h2 className={styles.heading}>Our Mission</h2>
                <p className={styles.text}>
                  Moving forward, we are thrilled to expand our focus by
                  organizing special sports events for the ladies and kids of
                  our community, creating opportunities for everyone to connect,
                  participate, and grow.
                </p>
                <p className={styles.text}>
                  At Chennai Khatri Sports Club, sports are more than just
                  games—they are a way to build bonds, promote health, and
                  strengthen our community spirit.
                </p>
                <p className={styles.callout}>
                  Join us as we continue to grow, play, and inspire together!
                </p>
              </Col>
              <Col lg={6} md={12} className="mb-4 order-lg-1">
                <div className={styles.photoFrame}>
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.photo}
                  >
                    <source src="/video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <section className={styles.section}>
          <Container>
            <div className="text-center mb-5">
              <span className={styles.eyebrow}>The team behind the club</span>
              <h2 className={styles.heading}>Organizers</h2>
              <p className={styles.lead}>
                Meet the visionaries who came together to create the Chennai
                Khatri Sports Club
              </p>
            </div>

            <Row className="justify-content-center">
              {founders.map((founder) => (
                <Col key={founder.id} xs={6} md={3} className="mb-4">
                  <div className={styles.founder}>
                    <div className={styles.founderPhoto}>
                      <Image
                        src={founder.image}
                        alt={founder.name}
                        width={200}
                        height={200}
                        className={styles.founderImg}
                      />
                    </div>
                    <h3>{founder.name}</h3>
                    <span>Organizer</span>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section className={styles.ctaSection}>
          <Container>
            <div className={styles.cta}>
              <div>
                <h2>KPL Season 4 is coming</h2>
                <p>23rd &amp; 24th January 2027 · Bigger Battles. Stronger Teams. New Champions!</p>
              </div>
              <Link href="/kpl-season-4" className={styles.ctaBtn}>
                See details →
              </Link>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
};

export default AboutUs;
