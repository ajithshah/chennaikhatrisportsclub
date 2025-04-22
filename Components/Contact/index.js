import React, { useEffect } from "react";

export default function Contact() {
  useEffect(() => {
    // Optional: add intersection observer for more advanced animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-center mb-5 title-animation">Contact Us</h1>

      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-lg mb-4 animate-on-scroll card-left">
            <div className="card-body">
              <h3 className="mb-4 fade-in">Our Location</h3>

              <div className="mb-4">
                <p className="mb-2 slide-up">
                  <i className="fas fa-map-marker-alt me-2 text-primary mr-2 icon-pulse"></i>
                  Chintadripet, Chennai
                </p>

                <div className="mb-3 slide-up" style={{ animationDelay: "0.2s" }}>
                  <p className="mb-1 fw-bold">
                    <i className="fas fa-phone me-2 text-primary mr-2 icon-pulse"></i>
                    Contact Numbers:
                  </p>
                  <ul className="list-unstyled ps-4">
                    <li className="mb-1 list-item-animation">
                      Vinoth Kumar BG - (+91) 98408-80873
                    </li>
                    <li className="mb-1 list-item-animation" style={{ animationDelay: "0.1s" }}>
                      Sushil - (+91) 98417-12284
                    </li>
                    <li className="mb-1 list-item-animation" style={{ animationDelay: "0.2s" }}>
                      Rajani - (+91) 98415-26709
                    </li>
                  </ul>
                </div>

                <p className="mb-2 slide-up" style={{ animationDelay: "0.4s" }}>
                  <i className="fas fa-envelope me-2 text-primary mr-2 icon-pulse"></i>
                  ckpc@gmail.com
                </p>
              </div>

              <h4 className="mt-4 mb-3 fade-in" style={{ animationDelay: "0.5s" }}>Connect With Us</h4>
              <div className="social-links d-flex gap-3 social-container">
                <a
                  href="https://instagram.com/chennai_khatri_sports_club"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon mr-2 bg-light social-pop"
                >
                  <i className="fab fa-instagram fs-4 text-danger"></i>
                </a>

                <a
                  href="https://www.youtube.com/@KhatriSportsClub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon mr-2 social-pop"
                  style={{ animationDelay: "0.1s" }}
                >
                  <i className="fab fa-youtube fs-4 text-danger"></i>
                </a>
                <a
                  href="https://wa.me/911234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon social-pop"
                  style={{ animationDelay: "0.2s" }}
                >
                  <i className="fab fa-whatsapp fs-4 text-success"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-lg animate-on-scroll card-right">
            <div className="card-body p-0 map-container">
              <div className="map-overlay"></div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d971.5883861408315!2d80.26948476961925!3d13.076765699203035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526606a6ab8e65%3A0xd2ccf18fce7999da!2s53%2C%20Iyya%20Mudhali%20St%2C%20Chintadripet%2C%20Chennai%2C%20Tamil%20Nadu%20600002!5e0!3m2!1sen!2sin!4v1737477231264!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                className="map-frame"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .title-animation {
          animation: fadeInDown 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card-left {
          opacity: 0;
          transform: translateX(-30px);
          transition: all 0.8s ease-out;
        }
        
        .card-right {
          opacity: 0;
          transform: translateX(30px);
          transition: all 0.8s ease-out;
        }
        
        .animate-on-scroll.show {
          opacity: 1;
          transform: translateX(0);
        }
        
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        
        .slide-up {
          opacity: 0;
          transform: translateY(20px);
          animation: slideUp 0.6s ease-out forwards;
        }
        
        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .list-item-animation {
          opacity: 0;
          transform: translateX(15px);
          animation: slideInRight 0.5s ease-out forwards;
          animation-delay: 0.3s;
        }
        
        @keyframes slideInRight {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .icon-pulse {
          display: inline-block;
          animation: iconPulse 2s infinite;
        }
        
        @keyframes iconPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .social-container {
          perspective: 1000px;
        }
        
        .social-pop {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #f8f9fa;
          transition: all 0.3s ease;
          opacity: 0;
          animation: socialPop 0.5s ease-out forwards;
          animation-delay: 0.6s;
        }
        
        @keyframes socialPop {
          0% { 
            opacity: 0;
            transform: scale(0.5) rotateY(90deg);
          }
          70% { 
            opacity: 1;
            transform: scale(1.1) rotateY(0deg);
          }
          100% { 
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }
        
        .social-icon:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .map-container {
          position: relative;
          overflow: hidden;
          border-radius: 0.25rem;
        }
        
        .map-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 123, 255, 0.3);
          z-index: 1;
          animation: fadeOut 1.5s ease-out forwards;
          animation-delay: 1s;
        }
        
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
        
        .map-frame {
          animation: zoomIn 1.5s ease-out;
        }
        
        @keyframes zoomIn {
          from { transform: scale(1.1); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}