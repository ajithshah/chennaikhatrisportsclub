import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Meta from "../Meta";
import { useSettings } from "../../lib/useSettings";
import styles from "./contact.module.css";


const INSTAGRAM =
  "https://www.instagram.com/chennai_khatri_sports.club?igsh=azVtaWhnMDRmNnpz";
const YOUTUBE = "https://www.youtube.com/@KhatriSportsClub";
const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1628.361154557572!2d80.26993498366706!3d13.076157693893927!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526606bbdd9bc1%3A0x6adc3e959beba61d!2s48-78%2C%20Iyya%20Mudali%20St%2C%20Adikesavarpuram%2C%20Chintadripet%2C%20Chennai%2C%20Tamil%20Nadu%20600002!5e0!3m2!1sen!2sin!4v1772866214507!5m2!1sen!2sin";

const sports = [
  {
    icon: "fa-baseball-ball",
    name: "Khatri Premier League (Cricket)",
    detail: "3 Seasons completed successfully",
  },
  {
    icon: "fa-table-tennis",
    name: "Badminton",
    detail: "1 Season completed",
  },
  {
    icon: "fa-futbol",
    name: "Ladies & Kids Events",
    detail: "1 Session completed",
  },
];

const stats = [
  { value: "3", label: "Cricket Seasons" },
  { value: "100+", label: "Active Members" },
  { value: "8+", label: "Teams" },
  { value: "2", label: "Sports Played" },
];

const values = [
  {
    icon: "fa-hands-helping",
    name: "Unity",
    desc: "Bringing the Khatri community together through the power of sports",
  },
  {
    icon: "fa-users",
    name: "Teamwork",
    desc: "Building strong bonds on and off the field with every match",
  },
  {
    icon: "fa-heartbeat",
    name: "Fitness",
    desc: "Promoting an active lifestyle and healthy habits for all ages",
  },
  {
    icon: "fa-star",
    name: "Excellence",
    desc: "Striving for the best in every event and tournament we organize",
  },
];

// "9840880873" -> "+91 98408 80873"
const formatPhone = (phone) => `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

const Contact = () => {
  const { settings } = useSettings();
  const organizers = settings.organizers.map((o) => ({
    name: o.name,
    display: formatPhone(o.phone),
    number: `91${o.phone}`,
  }));
  const primary = organizers[0];

  return (
    <>
      <Meta title="Contact Us | Chennai Khatri Sports Club" />
      <section className={styles.page}>
        <div className={styles.hero}>
          <Container>
            <span className={styles.tag}>🏏 Chennai Khatri Sports Club</span>
            <h1 className={styles.title}>
              Contact <span>Us</span>
            </h1>
            <p className={styles.subtitle}>
              Get in touch with Chennai Khatri Sports Club. We&apos;d love to
              hear from you!
            </p>
          </Container>
        </div>

        <Container className={styles.content}>
          <Row>
            <Col lg={4} md={6} className="mb-4">
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>
                    <i className="fas fa-phone-alt"></i>
                  </span>
                  Call Us
                </h3>
                {organizers.map((o) => (
                  <div key={o.number} className={styles.person}>
                    <a href={`tel:+${o.number}`} className={styles.personInfo}>
                      <span className={styles.label}>{o.name}</span>
                      <span className={styles.value}>{o.display}</span>
                    </a>
                    <a
                      href={`https://wa.me/${o.number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsapp}
                      aria-label={`WhatsApp ${o.name}`}
                    >
                      <i className="fab fa-whatsapp"></i>
                    </a>
                  </div>
                ))}
              </div>
            </Col>

            <Col lg={4} md={6} className="mb-4">
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>
                    <i className="fas fa-share-alt"></i>
                  </span>
                  Follow Us
                </h3>
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.social}
                >
                  <i className={`fab fa-instagram ${styles.instagram}`}></i>
                  <span>
                    <span className={styles.label}>Instagram</span>
                    <span className={styles.value}>@chennai_khatri_sports.club</span>
                  </span>
                </a>
                <a
                  href={YOUTUBE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.social}
                >
                  <i className={`fab fa-youtube ${styles.youtube}`}></i>
                  <span>
                    <span className={styles.label}>YouTube</span>
                    <span className={styles.value}>Khatri Sports Club</span>
                  </span>
                </a>
              </div>
            </Col>

            <Col lg={4} md={12} className="mb-4">
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <span className={styles.cardIcon}>
                    <i className="fas fa-map-marker-alt"></i>
                  </span>
                  Location
                </h3>
                <div className={styles.social}>
                  <i className={`fas fa-city ${styles.cityIcon}`}></i>
                  <span>
                    <span className={styles.label}>Address</span>
                    <span className={styles.value}>Chintadripet, Chennai 600002</span>
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          <div className={styles.kpl}>
            <div className={styles.kplText}>
              <span className={styles.kplTag}>🏏 KPL Season 4</span>
              <h3>Team registration opens 24th October 2026</h3>
              <p>
                Tournament on <strong>23rd &amp; 24th January 2027</strong> ·
                Registration fee <strong>Rs. 6000/-</strong>
              </p>
              <p>
                Questions about KPL Season 4? Call or WhatsApp any of our
                organizers above.
              </p>
            </div>
            <a
              href={`https://wa.me/${primary.number}?text=Hi%2C%20I%20have%20a%20question%20about%20KPL%20Season%204`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waBtn}
            >
              <i className="fab fa-whatsapp"></i> Ask about KPL 4
            </a>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>
              <i className="fas fa-map"></i> Find Us on the Map
            </h3>
            <div className={styles.map}>
              <iframe
                src={MAP_SRC}
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Chennai Khatri Sports Club Location"
              ></iframe>
            </div>
          </div>

          <Row>
            <Col lg={6} className="mb-4">
              <div className={`${styles.panel} h-100`}>
                <h3 className={styles.panelTitle}>
                  <i className="fas fa-info-circle"></i> About the Club
                </h3>
                <p className={styles.text}>
                  Established in <strong>2023</strong>, the Chennai Khatri
                  Sports Club was founded to bring the Khatri community together
                  through sports. Our mission is to foster unity, teamwork, and
                  an active lifestyle by moving beyond screens and onto the
                  field.
                </p>
                <p className={styles.text}>
                  Founded by <strong>Kamal, Rajini, Vinod Kumar</strong> and{" "}
                  <strong>Sushil</strong>, the club has grown into a thriving
                  community of sports enthusiasts.
                </p>
              </div>
            </Col>
            <Col lg={6} className="mb-4">
              <div className={`${styles.panel} h-100`}>
                <h3 className={styles.panelTitle}>
                  <i className="fas fa-trophy"></i> Sports &amp; Achievements
                </h3>
                {sports.map((sp) => (
                  <div key={sp.name} className={styles.sport}>
                    <span className={styles.sportIcon}>
                      <i className={`fas ${sp.icon}`}></i>
                    </span>
                    <span>
                      <span className={styles.sportName}>{sp.name}</span>
                      <span className={styles.sportDetail}>{sp.detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          <div className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>
              <i className="fas fa-heart"></i> Our Values
            </h3>
            <Row>
              {values.map((v) => (
                <Col key={v.name} xs={12} sm={6} md={3} className="mb-3">
                  <div className={styles.value4}>
                    <span className={styles.valueIcon}>
                      <i className={`fas ${v.icon}`}></i>
                    </span>
                    <h4>{v.name}</h4>
                    <p>{v.desc}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          <div className={styles.join}>
            <h3>Want to Join the Club?</h3>
            <p>
              Whether you&apos;re a seasoned player or just starting out, we
              welcome everyone from the Khatri community. Reach out to any of
              our organizers to get started!
            </p>
            <div className={styles.joinButtons}>
              <a
                href={`https://wa.me/${primary.number}?text=Hi%2C%20I%20am%20interested%20in%20joining%20Chennai%20Khatri%20Sports%20Club`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.joinWa}
              >
                <i className="fab fa-whatsapp"></i> Message on WhatsApp
              </a>
              <a href={`tel:+${primary.number}`} className={styles.joinCall}>
                <i className="fas fa-phone-alt"></i> Call Now
              </a>
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.joinInsta}
              >
                <i className="fab fa-instagram"></i> Follow on Instagram
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Contact;
