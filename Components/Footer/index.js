import React from "react";

const Footer = () => {
  return (
    <footer className="footer py-3 bg-dark text-white">
      <div className="container text-center">
        <p className="mb-1">
          © {new Date().getFullYear()} Chennai Khatri Sports Club. All rights
          reserved.
        </p>
        <small className="text-muted">Hosted with ❤️ by KPSC Team</small>
        <p className="mt-2">
          Developed by{" "}
          <a
            href="https://www.instagram.com/ajith._.shah?igsh=MXRpYXh5ZW83Mmhnbg%3D%3D&utm_source=qr"
            className="text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ajith Shah
          </a>{" "}
          and{" "}
          <a
            href="https://www.instagram.com/sandy___sha?igsh=M205bTBsM2h5dWQ="
            className="text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Shanthosh
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
