import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Container, Modal } from "react-bootstrap";
import { auth } from "../../../firebase";
import { usersDb } from "../../../lib/db";
import { authFetch } from "../../../lib/authFetch";
import Header from "../../Header";
import styles from "./kplRegistrations.module.css";

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "-";

const Detail = ({ icon, label, value }) => (
  <div className={styles.detail}>
    <span className={styles.detailIcon}>{icon}</span>
    <div>
      <div className={styles.detailLabel}>{label}</div>
      <div className={styles.detailValue}>{value || "-"}</div>
    </div>
  </div>
);

export default function KplRegistrations() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    const load = async (currentUser) => {
      try {
        const userData = await usersDb.get(currentUser.uid);
        if (!userData || !userData.isAdmin) {
          router.push("/");
          return;
        }
        const res = await authFetch("/api/kpl4/registrations");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load registrations");
        setTeams(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) load(user);
      else router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  const editFields = [
    ["teamName", "Team name", true],
    ["shortName", "Short name"],
    ["city", "Area / City"],
    ["ownerName", "Owner"],
    ["captainName", "Captain name", true],
    ["captainPhone", "Captain phone", true, true],
    ["captainEmail", "Captain email", true],
    ["viceCaptainName", "Vice captain name", true],
    ["viceCaptainPhone", "Vice captain phone", true, true],
  ];

  const openEdit = (team) => {
    setEditError("");
    setEditForm(Object.fromEntries(editFields.map(([k]) => [k, team[k] || ""])));
    setEditing(team);
  };

  const handleEditChange = (key, value, isPhone) => {
    setEditForm((f) => ({
      ...f,
      [key]: isPhone ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError("");
    try {
      const res = await authFetch(`/api/kpl4/registrations/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save changes");
      const updated = { ...editing, ...editForm };
      setTeams((prev) => prev.map((t) => (t.id === editing.id ? updated : t)));
      setSelected((cur) => (cur && cur.id === editing.id ? updated : cur));
      setEditing(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      const res = await authFetch(`/api/kpl4/registrations/${toDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete team");
      setTeams((prev) => prev.filter((t) => t.id !== toDelete.id));
      setSelected(null);
      setToDelete(null);
    } catch (err) {
      setError(err.message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) =>
      [t.teamName, t.shortName, t.captainName, t.viceCaptainName, t.captainPhone, t.city]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [teams, query]);

  const today = new Date().toDateString();
  const todayCount = teams.filter((t) => new Date(t.createdAt).toDateString() === today).length;

  return (
    <div className={styles.page}>
      <Header />

      <section className={styles.hero}>
        <Container>
          <button className={styles.back} onClick={() => router.push("/adminpanel")}>
            ← Admin Panel
          </button>
          <h1 className={styles.title}>
            🏆 KPL <span>Season 4</span> Teams
          </h1>
          <p className={styles.subtitle}>23rd & 24th January 2027 · Registration fee Rs. 6000/-</p>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>{teams.length}</strong>
              <span>Registered teams</span>
            </div>
            <div className={styles.stat}>
              <strong>{todayCount}</strong>
              <span>Registered today</span>
            </div>
            <div className={styles.stat}>
              <strong>Rs. {(teams.length * 6000).toLocaleString("en-IN")}</strong>
              <span>Registration fees</span>
            </div>
          </div>
        </Container>
      </section>

      <Container className={styles.content}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.toolbar}>
          <input
            type="search"
            className={styles.search}
            placeholder="Search by team, captain, phone or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.count}>
            {filtered.length} of {teams.length} teams
          </span>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading teams...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            {teams.length === 0 ? "No teams have registered yet." : "No teams match your search."}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((team) => (
              <div key={team.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{initials(team.teamName)}</div>
                  <div className={styles.cardTitle}>
                    <h3>{team.teamName}</h3>
                    <span>{[team.shortName, team.city].filter(Boolean).join(" · ") || "—"}</span>
                  </div>
                </div>

                <div className={styles.people}>
                  <div>
                    <small>Captain</small>
                    <div>{team.captainName}</div>
                    <a href={`tel:${team.captainPhone}`}>{team.captainPhone}</a>
                  </div>
                  <div>
                    <small>Vice captain</small>
                    <div>{team.viceCaptainName}</div>
                    <a href={`tel:${team.viceCaptainPhone}`}>{team.viceCaptainPhone}</a>
                  </div>
                </div>

                <div className={styles.cardBottom}>
                  <span className={styles.date}>{formatDate(team.createdAt)}</span>
                  <button
                    className={styles.viewIconBtn}
                    onClick={() => setSelected(team)}
                    aria-label={`View ${team.teamName}`}
                    title="View details"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => openEdit(team)}
                    aria-label={`Edit ${team.teamName}`}
                    title="Edit team"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setToDelete(team)}
                    aria-label={`Delete ${team.teamName}`}
                    title="Delete team"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      <Modal show={!!selected} onHide={() => setSelected(null)} size="lg" centered>
        {selected && (
          <>
            <div className={styles.modalHead}>
              <div className={styles.avatarLg}>{initials(selected.teamName)}</div>
              <div>
                <h2>{selected.teamName}</h2>
                <span>{[selected.shortName, selected.city].filter(Boolean).join(" · ")}</span>
              </div>
              <button className={styles.close} onClick={() => setSelected(null)} aria-label="Close">
                ×
              </button>
            </div>
            <Modal.Body>
              <div className="row">
                <div className="col-md-6">
                  <Detail icon="👑" label="Owner" value={selected.ownerName} />
                  <Detail icon="🏏" label="Captain" value={`${selected.captainName} · ${selected.captainPhone}`} />
                  <Detail icon="✉️" label="Captain email" value={selected.captainEmail} />
                  <Detail icon="🛡️" label="Vice captain" value={`${selected.viceCaptainName} · ${selected.viceCaptainPhone}`} />
                  <Detail icon="🕒" label="Registered" value={formatDate(selected.createdAt)} />
                </div>
                <div className="col-md-6">
                  <div className={styles.detailLabel}>💰 Payment screenshot</div>
                  {selected.paymentScreenshot ? (
                    <a href={selected.paymentScreenshot} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selected.paymentScreenshot} alt="Payment screenshot" className={styles.shot} />
                    </a>
                  ) : (
                    <p className="text-muted mt-2">Not uploaded</p>
                  )}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button className={styles.editBtnLg} onClick={() => openEdit(selected)}>
                ✏️ Edit team
              </button>
              <button className={styles.deleteBtnLg} onClick={() => setToDelete(selected)}>
                🗑 Delete team
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <Modal show={!!editing} onHide={() => !saving && setEditing(null)} size="lg" centered>
        <form onSubmit={saveEdit}>
          <Modal.Header closeButton={!saving}>
            <Modal.Title>Edit team</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editError && <div className={styles.error}>{editError}</div>}
            <div className="row">
              {editFields.map(([key, label, required, isPhone]) => (
                <div className="col-md-6 mb-3" key={key}>
                  <label className={styles.formLabel} htmlFor={`edit-${key}`}>
                    {label}
                    {required && <span className="text-danger"> *</span>}
                  </label>
                  <input
                    id={`edit-${key}`}
                    className={styles.formInput}
                    type={key === "captainEmail" ? "email" : "text"}
                    inputMode={isPhone ? "numeric" : undefined}
                    required={required}
                    value={editForm[key] || ""}
                    onChange={(e) => handleEditChange(key, e.target.value, isPhone)}
                  />
                </div>
              ))}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button type="button" className={styles.cancelBtn} onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      <Modal show={!!toDelete} onHide={() => !deleting && setToDelete(null)} centered>
        <Modal.Header closeButton={!deleting}>
          <Modal.Title>Delete team?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will permanently delete the registration for{" "}
          <strong>{toDelete?.teamName}</strong>, including its payment
          screenshot. This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <button className={styles.cancelBtn} onClick={() => setToDelete(null)} disabled={deleting}>
            Cancel
          </button>
          <button className={styles.deleteBtnLg} onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Yes, delete"}
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
