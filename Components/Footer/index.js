import React from "react";

const Footer = () => {
  return (
    <footer className="footer py-3 bg-dark text-white">
      <div className="container text-center">
        <p className="mb-1">
          © {new Date().getFullYear()} Chennai Khatri Sports Club. All rights
          reserved.
        </p>
        <small className="text-muted">Hosted with ❤️ by CKPC Team</small>
      </div>
    </footer>
  );
};

export default Footer;
