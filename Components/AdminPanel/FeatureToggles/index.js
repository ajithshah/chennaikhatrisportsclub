import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { auth } from "../../../firebase";
import { authFetch } from "../../../lib/authFetch";
import Header from "../../Header";
import styles from "./featureToggles.module.css";

const TOGGLES = [
  {
    key: "registrationOpen",
    icon: "📢",
    title: "KPL Season 4 team registration",
    description:
      'Shows or hides the "Register Your Team" button on the KPL page and allows or blocks new registrations.',
  },
  {
    key: "showTeamInfo",
    icon: "👥",
    title: "Team info on profiles",
    description:
      'Shows the team name and the "View Team" button on every user\'s profile.',
  },
];

export default function FeatureToggles() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      try {
        const res = await authFetch("/api/settings");
        const data = await res.json();
        if (!res.ok || !data.canManage) {
          router.push("/adminpanel");
          return;
        }
        setSettings(data.settings);
      } catch (err) {
        setError("Failed to load settings");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const toggle = async (key) => {
    if (saving) return;
    const next = !settings[key];
    setSaving(key);
    setError("");
    try {
      const res = await authFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSettings(data.settings);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <section className={styles.hero}>
        <Container>
          <button className={styles.back} onClick={() => router.push("/adminpanel")}>
            ← Admin Panel
          </button>
          <h1 className={styles.title}>🎛️ Feature Toggles</h1>
          <p className={styles.subtitle}>Only the super admin can change these. Changes apply to all users immediately.</p>
        </Container>
      </section>

      <Container className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}
        {!settings ? (
          <div className={styles.card}>Loading...</div>
        ) : (
          TOGGLES.map((t) => (
            <div key={t.key} className={styles.card}>
              <span className={styles.icon}>{t.icon}</span>
              <div className={styles.text}>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
              </div>
              <div className={styles.control}>
                <span className={settings[t.key] ? styles.on : styles.off}>
                  {settings[t.key] ? "ON" : "OFF"}
                </span>
                <button
                  role="switch"
                  aria-checked={settings[t.key]}
                  aria-label={t.title}
                  className={`${styles.switch} ${settings[t.key] ? styles.switchOn : ""}`}
                  onClick={() => toggle(t.key)}
                  disabled={!!saving}
                >
                  <span className={styles.knob}></span>
                </button>
              </div>
            </div>
          ))
        )}
      </Container>
    </div>
  );
}
