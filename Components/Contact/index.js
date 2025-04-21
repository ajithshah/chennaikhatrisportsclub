import React from "react";

export default function Contact() {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-5">Contact Us</h1>

      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-lg mb-4">
            <div className="card-body">
              <h3 className="mb-4">Our Location</h3>

              <div className="mb-4">
                <p className="mb-2">
                  <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                  Chintadripet, Chennai
                </p>

                <p className="mb-2">
                  <i className="fas fa-phone mr-2 text-primary"></i>
                  (+91) 123-456-7890
                </p>

                <p className="mb-2">
                  <i className="fas fa-envelope mr-2 text-primary"></i>
                  ckpc@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body p-0">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d971.5883861408315!2d80.26948476961925!3d13.076765699203035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526606a6ab8e65%3A0xd2ccf18fce7999da!2s53%2C%20Iyya%20Mudhali%20St%2C%20Chintadripet%2C%20Chennai%2C%20Tamil%20Nadu%20600002!5e0!3m2!1sen!2sin!4v1737477231264!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
