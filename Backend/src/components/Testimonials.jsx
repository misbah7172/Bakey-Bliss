import React from 'react';
import '../styles.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const Testimonials = () => (
  <section className="testimonials">
    <h2>What Our Customers Say</h2>
    <div className="testimonial-slider">
      <div className="testimonial">
        <p>"The best cakes I've ever had! Highly recommended!"</p>
        <p>- Jane Doe</p>
      </div>
      <div className="testimonial">
        <p>"Fresh bread and amazing service. Will come back!"</p>
        <p>- John Smith</p>
      </div>
    </div>
  </section>
);

export default Testimonials;
