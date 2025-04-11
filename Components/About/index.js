import React from "react";
import Image from "next/image";

export default function About() {
  return (
    <div className="aboutContainer">
      <section className="hero">
        <div className="hero-overlay">
          <h1>About Chennai Khatri Sports Club</h1>
          {/* <p className="hero-tagline">Fostering Sports Excellence Since 1995</p> */}
        </div>
      </section>

      <div className="content">
        <section className="section">
          <h2>Our Legacy</h2>
          <p>
            Founded in 1995, Chennai Khatri Sports Club has been at the
            forefront of sports development in Chennai. Our journey began with a
            simple vision: to create a space where sports enthusiasm meets
            excellence.
          </p>
        </section>

        <section className="section">
          <h2>Our Facilities</h2>
          <ul>
            <li>Modern cricket ground with practice nets</li>
            <li>Multi-purpose indoor sports complex</li>
            <li>Professional fitness center</li>
            <li>Swimming pool with trained instructors</li>
            <li>Badminton and tennis courts</li>
          </ul>
        </section>

        <section className="section">
          <h2>Programs & Activities</h2>
          <ul>
            <li>Youth sports development programs</li>
            <li>Professional coaching sessions</li>
            <li>Annual sports tournaments</li>
            <li>Summer sports camps</li>
            <li>Fitness workshops</li>
          </ul>
        </section>
      </div>
      <hr></hr>
      <section className="founders-section">
        <h2 className="section-title">Our Founders</h2>
        <div className="founders-grid">
          <div className="founder-card">
            <div className="founder-image">
              <Image
                src="/founder1.jpg"
                alt="Founder 1"
                fill
                sizes="(max-width: 768px) 150px, 200px"
                className="founder-img"
                priority
              />
            </div>
            <h3>Mr. Rajesh Khatri</h3>
            <span className="founder-role">Founding President</span>
            <p>
              A visionary leader who established the club in 1995, bringing
              together sports enthusiasts to create a legacy of excellence.
            </p>
          </div>

          <div className="founder-card">
            <div className="founder-image">
              <Image
                src="/founder2.jpg"
                alt="Founder 1"
                fill
                sizes="(max-width: 768px) 150px, 200px"
                className="founder-img"
                priority
              />
            </div>
            <h3>Mr. Suresh Khatri</h3>
            <span className="founder-role">Founding Secretary</span>
            <p>
              Instrumental in developing the club's infrastructure and
              establishing its core sporting programs.
            </p>
          </div>
          <div className="founder-card">
            <div className="founder-image">
              <Image
                src="/founder3.jpg"
                alt="Founder 1"
                fill
                sizes="(max-width: 768px) 150px, 200px"
                className="founder-img"
                priority
              />
            </div>
            <h3>Mr. Suresh Khatri</h3>
            <span className="founder-role">Founding Secretary</span>
            <p>
              Instrumental in developing the club's infrastructure and
              establishing its core sporting programs.
            </p>
          </div>
          <div className="founder-card">
            <div className="founder-image">
              <Image
                src="/founder3.jpg"
                alt="Founder 1"
                fill
                sizes="(max-width: 768px) 150px, 200px"
                className="founder-img"
                priority
              />
            </div>
            <h3>Mr. Suresh Khatri</h3>
            <span className="founder-role">Founding Secretary</span>
            <p>
              Instrumental in developing the club's infrastructure and
              establishing its core sporting programs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
