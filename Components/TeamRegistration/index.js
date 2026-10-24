import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert, Modal } from "react-bootstrap";
import { auth } from "../../firebase";
import { authFetch } from "../../lib/authFetch";
import { useSettings } from "../../lib/useSettings";
import styles from "./teamRegistration.module.css";

const CITIES = ["Chennai", "Kanchipuram", "Vellore", "Vaniyambadi", "Bangalore"];

const RULES = [
  {
    title: "No Team Transfers",
    text: "Team transfers will not be permitted once a team is registered.",
  },
  {
    title: "No Refund Policy",
    text: "Registration fees are non-refundable once the team registration is confirmed.",
  },
  {
    title: "Registration Deadline",
    text: "Team registrations will close on Sunday, 25th October 2026, at 10:00 PM sharp. No registrations will be accepted after the deadline.",
  },
  {
    title: "Changes and Modifications",
    text: "Any changes to team registration, or other tournament-related matters will be considered only after discussion with Chennai Khatri Sports Club.",
  },
  {
    title: "Final Authority",
    text: "Chennai Khatri Sports Club reserves the right to review and decide on registration-related matters in consultation with the concerned parties.",
  },
  {
    title: "Confirmation of Registration",
    text: "Teams must complete all required registration formalities within the stipulated deadline to secure their participation.",
  },
  {
    title: "Acceptance of Rules",
    text: "By registering, all team owners and representatives agree to abide by the registration rules and decisions made by Chennai Khatri Sports Club.",
  },
];

const initialForm = {
  teamName: "",
  city: "",
  captainName: "",
  captainPhone: "",
  captainEmail: "",
  viceCaptainName: "",
  viceCaptainPhone: "",
  paymentScreenshot: "",
};

const TeamRegistration = () => {
  const { settings, loaded } = useSettings();
  // QR uploaded by the super admin, else the old static file if one exists
  const qrSrc = settings.paymentQrUrl || "/payment-qr.png";
  useEffect(() => setQrMissing(false), [qrSrc]);
  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(settings.upiId);
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2000);
    } catch (e) {
      console.error("Could not copy UPI ID:", e);
    }
  };
  const [form, setForm] = useState(initialForm);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const [qrMissing, setQrMissing] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthReady(true);
      if (u?.email) {
        setForm((f) => ({ ...f, captainEmail: f.captainEmail || u.email }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handlePhone = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value.replace(/\D/g, "").slice(0, 10) }));
  };

  const handleScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG or PNG images are allowed");
      setFileKey((k) => k + 1);
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Screenshot must be under 4 MB");
      setFileKey((k) => k + 1);
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await authFetch("/api/kpl4/payment_upload", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, paymentScreenshot: data.fileUrl }));
    } catch (err) {
      setError(err.message);
      setFileKey((k) => k + 1);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await authFetch("/api/kpl4/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");
      setSuccess(true);
      setForm(initialForm);
      setFileKey((k) => k + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, { phone, ...props } = {}) => (
    <Form.Group className="mb-3" controlId={name}>
      <Form.Label>
        {label}
        {props.required && <span className="text-danger"> *</span>}
      </Form.Label>
      <Form.Control
        name={name}
        value={form[name]}
        onChange={phone ? handlePhone : handleChange}
        {...props}
      />
    </Form.Group>
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <h1>Team Registration</h1>
          <p>KPL Season 4 · 23rd & 24th January 2027 · Fee Rs. 6000/-</p>
        </Container>
      </section>

      <Container className={styles.formWrap}>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Modal show={success} onHide={() => setSuccess(false)} centered>
              <Modal.Body className="text-center p-4">
                <div style={{ fontSize: "3rem" }}>🎉</div>
                <h4 className="mt-2">Registration received!</h4>
                <p className="mb-4">
                  Thank you for registering your team. The KPL team will get
                  back to you soon.
                </p>
                <Button variant="primary" onClick={() => setSuccess(false)}>
                  OK
                </Button>
              </Modal.Body>
            </Modal>
            {error && <Alert variant="danger">{error}</Alert>}

            <Alert variant="warning">
              <strong>Please Note:</strong> Entries will be processed on a
              first-come, first-served basis, and participation will be
              confirmed upon receipt of payment. Spots are limited and will
              be secured once payment confirmation is received.
              <br />
              <strong>Once the team is registered, no refunds are allowed.</strong>
              <br />
              <strong>Secure your spot before it&apos;s too late!</strong>
            </Alert>

            <section className={styles.rules} aria-labelledby="registration-rules">
              <h2 id="registration-rules" className={styles.rulesTitle}>
                Registration rules
              </h2>
              <p className={styles.rulesIntro}>
                All team Captains are requested to read and follow the
                registration rules carefully.
              </p>
              <ol className={styles.rulesList}>
                {RULES.map((rule) => (
                  <li key={rule.title}>
                    <strong>{rule.title}:</strong> {rule.text}
                  </li>
                ))}
              </ol>
              <p className={styles.rulesNotice}>
                <strong>📢 Important Notice:</strong> Please ensure that all
                team details are finalised before registration. Avoid
                last-minute requests for changes.
              </p>
            </section>
            {loaded && !settings.registrationOpen ? (
              <Alert variant="info">
                Team registration is currently closed. It opens on Saturday,
                24th October 2026 at 5 PM.
              </Alert>
            ) : authReady && !user ? (
              <Alert variant="warning">
                Please sign in (top right) to register your team.
              </Alert>
            ) : (
              <Form onSubmit={handleSubmit} className={styles.card}>
                <h2 className={styles.section}>Team details</h2>
                <Row>
                  <Col md={6}>{field("teamName", "Team name", { required: true, maxLength: 60 })}</Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="city">
                      <Form.Label>City</Form.Label>
                      <Form.Select className={styles.select} name="city" value={form.city} onChange={handleChange}>
                        <option value="">Select city</option>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <h2 className={styles.section}>Captain</h2>
                <Row>
                  <Col md={6}>{field("captainName", "Name", { required: true })}</Col>
                  <Col md={6}>{field("captainPhone", "Phone", { required: true, phone: true, inputMode: "numeric", placeholder: "10 digit number" })}</Col>
                  <Col md={12}>{field("captainEmail", "Email", { required: true, type: "email", placeholder: "name@example.com" })}</Col>
                </Row>

                <h2 className={styles.section}>Vice captain</h2>
                <Row>
                  <Col md={6}>{field("viceCaptainName", "Name", { required: true })}</Col>
                  <Col md={6}>{field("viceCaptainPhone", "Phone", { required: true, phone: true, inputMode: "numeric", placeholder: "10 digit number" })}</Col>
                </Row>

                <h2 className={styles.section}>Payment</h2>
                <div className={styles.qrBox}>
                  <div className={styles.qrFrame}>
                    {!qrSrc || qrMissing ? (
                      <span className={styles.qrMissing}>
                        QR code coming soon
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrSrc}
                        alt="Scan this QR code to pay the registration fee"
                        className={styles.qrImage}
                        onError={() => setQrMissing(true)}
                      />
                    )}
                  </div>
                  <div className={styles.qrText}>
                    <h3>📱 Scan to pay</h3>
                    <p className={styles.qrAmount}>Rs. 6000/-</p>
                    <p>
                      Pay the registration fee using any UPI app (GPay,
                      PhonePe, Paytm), then upload the payment screenshot
                      below.
                    </p>
                    {settings.upiId && (
                      <div className={styles.upiRow}>
                        <span className={styles.upiLabel}>UPI ID</span>
                        <strong>{settings.upiId}</strong>
                        <button
                          type="button"
                          className={styles.copyBtn}
                          onClick={copyUpi}
                        >
                          <i className={`fas ${upiCopied ? "fa-check" : "fa-copy"}`}></i>{" "}
                          {upiCopied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="paymentScreenshotInput">
                    Payment screenshot (Rs. 6000/-)
                    <span className="text-danger"> *</span>
                  </Form.Label>
                  <input
                    id="paymentScreenshotInput"
                    key={fileKey}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleScreenshot}
                    disabled={uploading}
                    className={styles.hiddenInput}
                  />
                  <label
                    htmlFor="paymentScreenshotInput"
                    className={`${styles.dropzone} ${
                      uploading ? styles.dropzoneDisabled : ""
                    }`}
                  >
                    <i
                      className={`fas ${
                        uploading
                          ? "fa-spinner fa-spin"
                          : form.paymentScreenshot
                          ? "fa-check-circle"
                          : "fa-cloud-upload-alt"
                      } ${styles.dropIcon}`}
                    ></i>
                    <span className={styles.dropTitle}>
                      {uploading
                        ? "Uploading..."
                        : form.paymentScreenshot
                        ? "Screenshot uploaded - click to change"
                        : "Click to choose your payment screenshot"}
                    </span>
                    <span className={styles.dropHint}>JPG or PNG, up to 4 MB</span>
                  </label>
                  {form.paymentScreenshot && !uploading && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.paymentScreenshot}
                        alt="Payment screenshot preview"
                        className={styles.preview}
                      />
                    </div>
                  )}
                </Form.Group>

                <p className="text-muted small text-center">
                  Once the team is registered, no refunds are allowed.
                </p>

                <Button type="submit" size="lg" className="w-100" disabled={submitting || uploading || !form.paymentScreenshot}>
                  {submitting ? "Submitting..." : "Register Team"}
                </Button>
              </Form>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TeamRegistration;
