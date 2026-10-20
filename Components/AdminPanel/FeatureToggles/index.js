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
      'Shows the "Register Your Team" button and allows new team registrations.',
  },
  {
    key: "season3Visible",
    icon: "🗂️",
    title: "Season 3 pages",
    description:
      "Shows the team, schedule and auction pages (and their data) to everyone. When off, only admins can open them.",
  },
  {
    key: "showTeamInfo",
    icon: "👥",
    title: "Team info on profiles",
    description:
      'Shows the team name and the "View Team" button on every user\'s profile.',
  },
  {
    key: "signupsOpen",
    icon: "🆕",
    title: "New member sign-ups",
    description:
      "When off, brand-new people can't join. Existing members can still sign in.",
  },
  {
    key: "oneTapEnabled",
    icon: "⚡",
    title: "Google One Tap auto sign-in",
    description:
      'Shows the "Continue as…" Google prompt to signed-out visitors on page load.',
  },
  {
    key: "bannerEnabled",
    icon: "📣",
    title: "Announcement banner",
    description: "Shows the scrolling announcement banner on the home page.",
  },
];

export default function FeatureToggles() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState("switches");
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [bannerText, setBannerText] = useState("");
  const [organizers, setOrganizers] = useState([]);
  const [upiId, setUpiId] = useState("");
  const [qrUploading, setQrUploading] = useState(false);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [myEmail, setMyEmail] = useState("");

  const applySettings = (s) => {
    setSettings(s);
    setBannerText((s.bannerLines || []).join("\n"));
    setOrganizers((s.organizers || []).map((o) => ({ ...o })));
    setUpiId(s.upiId || "");
  };

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
        applySettings(data.settings);
        setMyEmail((user.email || "").toLowerCase());
        const adminsRes = await authFetch("/api/super-admins");
        if (adminsRes.ok) setSuperAdmins((await adminsRes.json()).emails);
      } catch (err) {
        setError("Failed to load settings");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Saves a partial update; `key` marks which control is busy
  const save = async (partial, key, successMessage) => {
    if (saving) return false;
    setSaving(key);
    setError("");
    setNotice("");
    try {
      const res = await authFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      applySettings(data.settings);
      if (successMessage) setNotice(successMessage);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving("");
    }
  };

  const toggle = (key) => save({ [key]: !settings[key] }, key);

  const saveBanner = () =>
    save({ bannerLines: bannerText.split("\n") }, "bannerLines", "Announcement lines saved");

  const saveOrganizers = () => save({ organizers }, "organizers", "Organizer numbers saved");

  const updateOrganizer = (index, field, value) =>
    setOrganizers((list) =>
      list.map((o, i) =>
        i === index
          ? { ...o, [field]: field === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value }
          : o
      )
    );

  const saveSuperAdmins = async (emails, successMessage) => {
    if (saving) return;
    setSaving("superAdmins");
    setError("");
    setNotice("");
    try {
      const res = await authFetch("/api/super-admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSuperAdmins(data.emails);
      setNewAdminEmail("");
      setNotice(successMessage);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  };

  const addSuperAdmin = () => {
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;
    if (superAdmins.includes(email)) {
      setError("That email is already a super admin");
      return;
    }
    saveSuperAdmins([...superAdmins, email], "Super admin added");
  };

  const saveUpi = () => save({ upiId }, "upiId", "UPI ID saved");

  const uploadQr = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setNotice("");
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG or PNG images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("QR image must be under 2 MB");
      return;
    }
    setQrUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await authFetch("/api/settings_qr_upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      await save({ paymentQrUrl: data.fileUrl }, "qr", "Payment QR updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setQrUploading(false);
    }
  };

  const TABS = [
    { id: "switches", label: "Switches", icon: "fa-toggle-on" },
    { id: "content", label: "Content", icon: "fa-bullhorn" },
    { id: "payment", label: "Payment", icon: "fa-qrcode" },
    { id: "access", label: "Access", icon: "fa-user-shield" },
  ];
  const enabledCount = settings ? TOGGLES.filter((t) => settings[t.key]).length : 0;

  return (
    <div className={styles.page}>
      <Header />
      <section className={styles.hero}>
        <Container>
          <button className={styles.back} onClick={() => router.push("/adminpanel")}>
            ← Admin Panel
          </button>
          <h1 className={styles.title}>
            🎛️ Site <span>Settings</span>
          </h1>
          <p className={styles.subtitle}>
            Super admin only. Changes apply to all users immediately.
          </p>
          {settings && (
            <div className={styles.stats}>
              <div className={styles.stat}>
                <strong>
                  {enabledCount}/{TOGGLES.length}
                </strong>
                <span>Switches on</span>
              </div>
              <div className={styles.stat}>
                <strong>{settings.organizers.length}</strong>
                <span>Organizers</span>
              </div>
              <div className={styles.stat}>
                <strong>{superAdmins.length}</strong>
                <span>Super admins</span>
              </div>
            </div>
          )}
        </Container>
      </section>

      <Container className={styles.content}>
        <div className={styles.tabs} role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              <i className={`fas ${t.icon}`}></i> {t.label}
            </button>
          ))}
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {notice && <div className={styles.notice}>{notice}</div>}

        {!settings ? (
          <div className={styles.panel}>Loading...</div>
        ) : (
          <>
            {tab === "switches" && (
              <div className={styles.switchGrid}>
                {TOGGLES.map((t) => (
                  <div
                    key={t.key}
                    className={`${styles.switchCard} ${settings[t.key] ? styles.switchCardOn : ""}`}
                  >
                    <div className={styles.switchTop}>
                      <span className={styles.icon}>{t.icon}</span>
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
                    <h3>{t.title}</h3>
                    <p>{t.description}</p>
                    <span className={settings[t.key] ? styles.on : styles.off}>
                      {settings[t.key] ? "● ON" : "○ OFF"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "content" && (
              <>
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>
                    <i className="fas fa-bullhorn"></i> Announcement banner
                  </h2>
                  <label className={styles.label} htmlFor="banner-lines">
                    Lines (one per row, up to 10). They scroll across the home page.
                  </label>
                  <textarea
                    id="banner-lines"
                    className={styles.textarea}
                    rows={5}
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="🔥 KPL Season 4 is here!"
                  />
                  <div className={styles.panelActions}>
                    <button className={styles.saveBtn} onClick={saveBanner} disabled={!!saving}>
                      {saving === "bannerLines" ? "Saving..." : "Save announcements"}
                    </button>
                  </div>
                </div>

                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>
                    <i className="fas fa-phone-alt"></i> Organizer phone numbers
                  </h2>
                  <p className={styles.help}>
                    Shown on the Contact page. The first organizer is used for the WhatsApp and
                    Call buttons.
                  </p>
                  {organizers.map((o, i) => (
                    <div key={i} className={styles.orgRow}>
                      <input
                        className={styles.input}
                        placeholder="Name"
                        value={o.name}
                        onChange={(e) => updateOrganizer(i, "name", e.target.value)}
                        aria-label={`Organizer ${i + 1} name`}
                      />
                      <input
                        className={styles.input}
                        placeholder="10 digit phone"
                        inputMode="numeric"
                        value={o.phone}
                        onChange={(e) => updateOrganizer(i, "phone", e.target.value)}
                        aria-label={`Organizer ${i + 1} phone`}
                      />
                      <button
                        className={styles.removeBtn}
                        onClick={() => setOrganizers((list) => list.filter((_, idx) => idx !== i))}
                        disabled={organizers.length <= 1}
                        aria-label={`Remove organizer ${i + 1}`}
                        title="Remove"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  ))}
                  <div className={styles.panelActions}>
                    <button
                      className={styles.ghostBtn}
                      onClick={() => setOrganizers((list) => [...list, { name: "", phone: "" }])}
                      disabled={organizers.length >= 8}
                    >
                      <i className="fas fa-plus"></i> Add organizer
                    </button>
                    <button className={styles.saveBtn} onClick={saveOrganizers} disabled={!!saving}>
                      {saving === "organizers" ? "Saving..." : "Save numbers"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {tab === "payment" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>
                  <i className="fas fa-qrcode"></i> Payment
                </h2>
                <p className={styles.help}>
                  Shown on the team registration form under &quot;Scan to pay&quot;.
                </p>
                <div className={styles.payRow}>
                  <div className={styles.qrBox}>
                    {settings.paymentQrUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={settings.paymentQrUrl} alt="Payment QR" />
                    ) : (
                      <span>
                        <i className="fas fa-qrcode"></i>
                        <br />
                        No QR uploaded
                      </span>
                    )}
                  </div>
                  <div className={styles.payActions}>
                    <div className={styles.qrButtons}>
                      <input
                        id="qr-upload"
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={uploadQr}
                        className={styles.hiddenInput}
                        disabled={qrUploading || !!saving}
                      />
                      <label htmlFor="qr-upload" className={styles.uploadBtn}>
                        <i className="fas fa-cloud-upload-alt"></i>{" "}
                        {qrUploading
                          ? "Uploading..."
                          : settings.paymentQrUrl
                          ? "Replace QR"
                          : "Upload QR"}
                      </label>
                      {settings.paymentQrUrl && (
                        <button
                          className={styles.ghostBtn}
                          onClick={() => save({ paymentQrUrl: "" }, "qr", "Payment QR removed")}
                          disabled={!!saving}
                        >
                          Remove QR
                        </button>
                      )}
                    </div>
                    <p className={styles.help}>JPG or PNG, up to 2 MB.</p>

                    <label className={styles.label} htmlFor="upi-id">
                      UPI ID
                    </label>
                    <div className={styles.upiInputRow}>
                      <input
                        id="upi-id"
                        className={styles.input}
                        placeholder="name@bank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <button className={styles.saveBtn} onClick={saveUpi} disabled={!!saving}>
                        {saving === "upiId" ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "access" && (
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>
                  <i className="fas fa-user-shield"></i> Super admins
                </h2>
                <p className={styles.help}>
                  These Google accounts can open this page and change every setting. Use the same
                  email they sign in with.
                </p>
                {superAdmins.map((email) => (
                  <div key={email} className={styles.adminRow}>
                    <span className={styles.adminEmail}>
                      <span className={styles.adminAvatar}>{email.charAt(0).toUpperCase()}</span>
                      {email}
                      {email === myEmail && <em> (you)</em>}
                    </span>
                    <button
                      className={styles.removeBtn}
                      onClick={() =>
                        saveSuperAdmins(
                          superAdmins.filter((e) => e !== email),
                          "Super admin removed"
                        )
                      }
                      disabled={!!saving || email === myEmail || superAdmins.length <= 1}
                      aria-label={`Remove ${email}`}
                      title={email === myEmail ? "You can't remove yourself" : "Remove"}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
                <div className={styles.upiInputRow} style={{ marginTop: "0.9rem" }}>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="name@gmail.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSuperAdmin()}
                    aria-label="New super admin email"
                  />
                  <button className={styles.saveBtn} onClick={addSuperAdmin} disabled={!!saving}>
                    {saving === "superAdmins" ? "Saving..." : "Add"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
