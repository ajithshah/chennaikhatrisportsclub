import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import PrivacyModel from "../Model/PrivacyModel";
import TermsModal from "../Model/TermsModal";
import Banner from "../Banner";
import ImageSlider from "../ImageSlide";
import { signInWithGoogle as authSignInWithGoogle } from "../../utils/auth";
import { useSettings } from "../../lib/useSettings";
import styles from "./home.module.css";

const season4 = [
  { icon: "📅", label: "Registration opens", value: "24th October 2026" },
  { icon: "💰", label: "Registration fee", value: "Rs. 6000/-" },
  { icon: "🏏", label: "Tournament dates", value: "23rd & 24th January 2027" },
];

const stats = [
  { value: "3", label: "Cricket seasons" },
  { value: "8+", label: "Teams" },
  { value: "100+", label: "Active members" },
  { value: "2023", label: "Since" },
];

const HomePage = () => {
  const router = useRouter();
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModel, setShowPrivacyModel] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const signedIn = await authSignInWithGoogle(
        (u) => {
          setUser(u);
          router.push("/");
        },
        (error) => {
          console.error("Error signing in with Google:", error);
          setIsLoading(false);
        },
        setIsLoading
      );

      if (!signedIn) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setIsLoading(false);
    }
  };

  const firstName = user?.displayName?.split(" ")[0];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.glow} aria-hidden="true"></div>
        <div className="container position-relative">
          <div className={styles.heroBanner}>
            <Banner />
          </div>
          <div className="row align-items-center">
            <div className="col-lg-7 mb-5 mb-lg-0">
              <span className={styles.tag}>🏏 Chennai Khatri Sports Club</span>
              <h1 className={styles.title}>
                KPL <span>Season 4</span>
                <br />
                Let the Game Begin!
              </h1>
              <p className={styles.lead}>
                Bigger Battles. Stronger Teams. New Champions! Get ready to
                showcase your talent and fight for glory on 23rd &amp; 24th
                January 2027.
              </p>

              <div className={styles.cta}>
                {!authReady ? null : user ? (
                  <>
                    <Link href="/profile" className={styles.primaryBtn}>
                      <i className="fas fa-user-circle"></i> My Profile
                    </Link>
                    <Link href="/kpl-season-4" className={styles.ghostBtn}>
                      KPL Season 4 details →
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={signInWithGoogle}
                      disabled={isLoading}
                      className={styles.primaryBtn}
                    >
                      <i className="fab fa-google"></i>
                      {isLoading ? "Signing in..." : "Sign in with Google"}
                    </button>
                    <Link href="/kpl-season-4" className={styles.ghostBtn}>
                      KPL Season 4 details →
                    </Link>
                  </>
                )}
              </div>

              {authReady && !user && (
                <p className={styles.legal}>
                  By signing in, you agree to our{" "}
                  <button type="button" onClick={() => setShowTermsModal(true)}>
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button type="button" onClick={() => setShowPrivacyModel(true)}>
                    Privacy Policy
                  </button>
                </p>
              )}
            </div>

            <div className="col-lg-5 text-center">
              <div className={styles.logoRing}>
                <Image
                  src="/logo.png"
                  alt="Chennai Khatri Sports Club"
                  width={300}
                  height={300}
                  className={styles.logo}
                  priority
                />
              </div>
              {user && (
                <p className={styles.welcome}>Welcome back, {firstName} 👋</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.season}>
        <div className="container">
          <div className={styles.seasonCards}>
            {season4.map((item) => (
              <div key={item.label} className={styles.seasonCard}>
                <span className={styles.seasonIcon}>{item.icon}</span>
                <div>
                  <div className={styles.seasonLabel}>{item.label}</div>
                  <div className={styles.seasonValue}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            {settings.registrationOpen ? (
              <Link href="/team-registration" className={styles.registerBtn}>
                📢 Register Your Team
              </Link>
            ) : (
              <span className={styles.registerSoon}>
                📢 Team registration opens 24th October 2026, 5 PM
              </span>
            )}
          </div>
        </div>
      </section>

      <section className={styles.about}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <span className={styles.eyebrow}>Who we are</span>
              <h2 className={styles.heading}>Sports for the whole community</h2>
              <p className={styles.text}>
                Established in 2023, the Chennai Khatri Sports Club brings the
                Khatri community together through sports, fostering unity,
                teamwork and an active lifestyle.
              </p>
              <Link href="/about" className={styles.link}>
                Read our story →
              </Link>
            </div>
            <div className="col-lg-6">
              <div className={styles.stats}>
                {stats.map((s) => (
                  <div key={s.label} className={styles.stat}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.moments}>
        <div className="container text-center">
          <span className={styles.eyebrow}>Gallery</span>
          <h2 className={styles.heading}>Moments from the field</h2>
        </div>
        <ImageSlider />
      </section>

      <TermsModal show={showTermsModal} onHide={() => setShowTermsModal(false)} />
      <PrivacyModel
        show={showPrivacyModel}
        onHide={() => setShowPrivacyModel(false)}
      />
    </div>
  );
};

export default HomePage;
