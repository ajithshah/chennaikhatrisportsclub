import React from "react";

const Footer = () => {
  return (
    <footer className="footer py-3 bg-dark text-white">
      <div className="container text-center">
        <p className="mb-1">
          © {new Date().getFullYear()} Khatri Premier League. All rights
          reserved.
        </p>
        <small className="text-muted">Hosted with ❤️ by KPL Team</small>
      </div>
    </footer>
  );
};

export default Footer;
