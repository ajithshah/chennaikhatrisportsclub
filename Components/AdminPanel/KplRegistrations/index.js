import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Container, Modal } from "react-bootstrap";
import { auth } from "../../../firebase";
import { usersDb } from "../../../lib/db";
import { authFetch } from "../../../lib/authFetch";
import Header from "../../Header";
import styles from "./kplRegistrations.module.css";

const CITIES = ["Chennai", "Kanchipuram", "Vellore", "Vaniyambadi", "Bangalore"];

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
    ["city", "Area / City"],
    ["captainName", "Captain name", true],
    ["captainPhone", "Captain phone", true, true],
    ["captainEmail", "Captain email", true],
    ["viceCaptainName", "Vice captain name", true],
    ["viceCaptainPhone", "Vice captain phone", true, true],
  ];

  const editSections = [
    ["Team", "🏏", editFields.slice(0, 2)],
    ["Captain", "🛡️", editFields.slice(2, 5)],
    ["Vice captain", "🎖️", editFields.slice(5)],
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

  const printTeams = () => {
    const esc = (v) =>
      String(v ?? "-")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;") || "-";

    const rows = teams
      .map(
        (t, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${esc(t.teamName)}</strong></td>
          <td>${esc(t.city || "-")}</td>
          <td>${esc(t.captainName)}<br/><span class="muted">${esc(t.captainPhone)}</span><br/><span class="muted">${esc(t.captainEmail)}</span></td>
          <td>${esc(t.viceCaptainName)}<br/><span class="muted">${esc(t.viceCaptainPhone)}</span></td>
          <td>${esc(formatDate(t.createdAt))}</td>
        </tr>`
      )
      .join("");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setError("Please allow pop-ups to print the team list.");
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>KPL Season 4 Teams - Chennai Khatri Sports Club</title>
  <style>
    @page { size: A4 landscape; margin: 12mm; }
    body { font-family: Arial, sans-serif; color: #222; margin: 0; padding: 16px; }
    .header { text-align: center; margin-bottom: 16px; border-bottom: 3px solid #1b3a8a; padding-bottom: 10px; }
    .header h1 { margin: 0; color: #0b1f4d; font-size: 22px; }
    .header p { margin: 4px 0 0; color: #555; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1b3a8a; color: #fff; text-align: left; padding: 8px; }
    td { border-bottom: 1px solid #ddd; padding: 8px; vertical-align: top; }
    tr { page-break-inside: avoid; }
    tr:nth-child(even) td { background: #f4f6fb; }
    .muted { color: #666; font-size: 11px; }
    .footer { margin-top: 14px; text-align: right; font-size: 11px; color: #777; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
</head>
<body>
  <div class="header">
    <h1>KPL Season 4 - Registered Teams</h1>
    <p>Chennai Khatri Sports Club &middot; Total teams: ${teams.length} &middot; Printed on ${esc(
      new Date().toLocaleString("en-IN")
    )}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Team</th><th>City</th>
        <th>Captain</th><th>Vice captain</th><th>Registered</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Chennai Khatri Sports Club</div>
</body>
</html>`);
    printWindow.document.close();

    printWindow.focus();
    printWindow.print();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) =>
      [t.teamName, t.captainName, t.viceCaptainName, t.captainPhone, t.city]
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
          <button
            className={styles.back}
            onClick={() => router.push("/adminpanel")}
            aria-label="Back to admin panel"
            title="Back to admin panel"
          >
            <i className="fas fa-arrow-left"></i>
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
          <button
            className={styles.printBtn}
            onClick={printTeams}
            disabled={teams.length === 0}
            aria-label="Print all"
            title="Print all"
          >
            <i className="fas fa-print"></i>
          </button>
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
                    <span>{[team.city].filter(Boolean).join(" · ") || "—"}</span>
                  </div>
                </div>

                <div className={styles.people}>
                  <div>
                    <small>Captain</small>
                    <div>{team.captainName}</div>
                    <a href={`tel:${team.captainPhone}`}>{team.captainPhone}</a>
                    {team.captainEmail && (
                      <a href={`mailto:${team.captainEmail}`} style={{ display: "block", wordBreak: "break-all" }}>
                        {team.captainEmail}
                      </a>
                    )}
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

      <Modal
        show={!!selected}
        onHide={() => setSelected(null)}
        size="lg"
        centered
        contentClassName={styles.editModal}
      >
        {selected && (
          <>
            <div className={styles.editHead}>
              <div className={styles.avatarLg}>{initials(selected.teamName)}</div>
              <div>
                <h2>{selected.teamName}</h2>
                <span>{selected.city || "—"}</span>
              </div>
              <button className={styles.close} onClick={() => setSelected(null)} aria-label="Close">
                ×
              </button>
            </div>
            <Modal.Body className={styles.editBody}>
              <div className="row">
                <div className="col-md-6">
                  <div className={styles.personCard}>
                    <div className={styles.personRole}>🛡️ Captain</div>
                    <div className={styles.personName}>{selected.captainName}</div>
                    <div className={styles.personLinks}>
                      <a href={`tel:${selected.captainPhone}`}>📞 {selected.captainPhone}</a>
                      {selected.captainEmail && (
                        <a href={`mailto:${selected.captainEmail}`}>✉️ {selected.captainEmail}</a>
                      )}
                    </div>
                  </div>
                  <div className={styles.personCard}>
                    <div className={styles.personRole}>🎖️ Vice captain</div>
                    <div className={styles.personName}>{selected.viceCaptainName}</div>
                    <div className={styles.personLinks}>
                      <a href={`tel:${selected.viceCaptainPhone}`}>📞 {selected.viceCaptainPhone}</a>
                    </div>
                  </div>
                  <div className={styles.regChip}>🕒 Registered {formatDate(selected.createdAt)}</div>
                </div>
                <div className="col-md-6">
                  <div className={styles.personCard}>
                    <div className={styles.personRole}>💰 Payment screenshot</div>
                    {selected.paymentScreenshot ? (
                      <a href={selected.paymentScreenshot} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selected.paymentScreenshot} alt="Payment screenshot" className={styles.shot} />
                      </a>
                    ) : (
                      <p className="text-muted mt-2 mb-0">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </Modal.Body>
            <div className={styles.editFoot}>
              <button
                className={`${styles.editBtnLg} ${styles.iconLg}`}
                onClick={() => openEdit(selected)}
                aria-label="Edit team"
                title="Edit team"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className={`${styles.deleteBtnLg} ${styles.iconLg}`}
                onClick={() => setToDelete(selected)}
                aria-label="Delete team"
                title="Delete team"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        show={!!editing}
        onHide={() => !saving && setEditing(null)}
        size="lg"
        centered
        contentClassName={styles.editModal}
      >
        <form onSubmit={saveEdit}>
          <div className={styles.editHead}>
            <div className={styles.avatar}>{initials(editForm.teamName || editing?.teamName)}</div>
            <div>
              <h2>Edit team</h2>
              <span>{editing?.teamName}</span>
            </div>
            <button type="button" className={styles.close} onClick={() => setEditing(null)} disabled={saving} aria-label="Close">
              &times;
            </button>
          </div>
          <Modal.Body className={styles.editBody}>
            {editError && <div className={styles.error}>{editError}</div>}
            {editSections.map(([title, icon, fields]) => (
              <div className={styles.editSection} key={title}>
                <h3 className={styles.editSectionTitle}>
                  <span>{icon}</span> {title}
                </h3>
                <div className="row">
                  {fields.map(([key, label, required, isPhone]) => (
                    <div className={key === "captainEmail" ? "col-12 mb-3" : "col-md-6 mb-3"} key={key}>
                      <label className={styles.formLabel} htmlFor={`edit-${key}`}>
                        {label}
                        {required && <span className="text-danger"> *</span>}
                      </label>
                      {key === "city" ? (
                        <select
                          id={`edit-${key}`}
                          className={`${styles.formInput} ${styles.formSelect}`}
                          value={editForm[key] || ""}
                          onChange={(e) => handleEditChange(key, e.target.value)}
                        >
                          <option value="">Select city</option>
                          {[...new Set([...CITIES, editForm.city].filter(Boolean))].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`edit-${key}`}
                          className={styles.formInput}
                          type={key === "captainEmail" ? "email" : isPhone ? "tel" : "text"}
                          inputMode={isPhone ? "numeric" : undefined}
                          placeholder={isPhone ? "10 digit number" : undefined}
                          required={required}
                          value={editForm[key] || ""}
                          onChange={(e) => handleEditChange(key, e.target.value, isPhone)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Modal.Body>
          <div className={styles.editFoot}>
            <button
              type="button"
              className={`${styles.cancelBtn} ${styles.iconLg}`}
              onClick={() => setEditing(null)}
              disabled={saving}
              aria-label="Cancel"
              title="Cancel"
            >
              <i className="fas fa-times"></i>
            </button>
            <button
              type="submit"
              className={`${styles.saveBtn} ${styles.iconLg}`}
              disabled={saving}
              aria-label="Save changes"
              title={saving ? "Saving..." : "Save changes"}
            >
              <i className={saving ? "fas fa-spinner fa-spin" : "fas fa-check"}></i>
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        show={!!toDelete}
        onHide={() => !deleting && setToDelete(null)}
        centered
        contentClassName={styles.editModal}
      >
        <div className={styles.editHead} style={{ background: "linear-gradient(135deg, #7a0a1c, #c8102e)" }}>
          <div>
            <h2>Delete team?</h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => setToDelete(null)}
            disabled={deleting}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <Modal.Body>
          This will permanently delete the registration for{" "}
          <strong>{toDelete?.teamName}</strong>, including its payment
          screenshot. This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <button
            className={`${styles.cancelBtn} ${styles.iconLg}`}
            onClick={() => setToDelete(null)}
            disabled={deleting}
            aria-label="Cancel"
            title="Cancel"
          >
            <i className="fas fa-times"></i>
          </button>
          <button
            className={`${styles.deleteBtnLg} ${styles.iconLg}`}
            onClick={confirmDelete}
            disabled={deleting}
            aria-label="Yes, delete"
            title={deleting ? "Deleting..." : "Yes, delete"}
          >
            <i className={deleting ? "fas fa-spinner fa-spin" : "fas fa-trash-alt"}></i>
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
