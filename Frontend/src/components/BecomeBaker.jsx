import React from 'react';
import '../styles.css';
import '../become_baker.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const BecomeBaker = () => (
  <section className="become-a-baker">
    <div className="container">
      <h2>Join Our Team of Bakers</h2>
      <p>Fill out the form below to apply to become a baker at Bakery Bliss.</p>
      <form id="baker-form">
        <div className="form-group">
          <label htmlFor="full-name">Full Name:</label>
          <input type="text" id="full-name" name="full-name" required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number:</label>
          <input type="tel" id="phone" name="phone" required />
        </div>
        <div className="form-group">
          <label htmlFor="experience">Years of Baking Experience:</label>
          <input type="number" id="experience" name="experience" min="0" required />
        </div>
        <div className="form-group">
          <label htmlFor="specialty">Baking Specialty:</label>
          <select id="specialty" name="specialty" required>
            <option value="cakes">Cakes</option>
            <option value="bread">Bread</option>
            <option value="pastries">Pastries</option>
            <option value="chocolates">Chocolates</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Availability:</label>
          <div className="availability-options">
            <label><input type="checkbox" name="availability" value="weekdays" /> Weekdays</label>
            <label><input type="checkbox" name="availability" value="weekends" /> Weekends</label>
            <label><input type="checkbox" name="availability" value="full-time" /> Full-Time</label>
            <label><input type="checkbox" name="availability" value="part-time" /> Part-Time</label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="resume">Upload Resume/Portfolio:</label>
          <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" required />
        </div>
        <button type="submit" className="submit-button">Submit Application</button>
      </form>
    </div>
  </section>
);

export default BecomeBaker;
