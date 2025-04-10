import React from 'react';
import '../styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Contact = () => (
  <main className="p-8">
    <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-semibold mb-4">Send Us a Message</h3>
        <form id="contact-form">
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input type="text" name="name" className="w-full p-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input type="email" name="email" className="w-full p-2 border rounded" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Message</label>
            <textarea name="message" rows="5" className="w-full p-2 border rounded" required></textarea>
          </div>
          <button type="submit" className="bg-custom text-white p-2 rounded w-full hover:bg-custom">Send Message</button>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-semibold mb-4">Our Location</h3>
        <div className="mb-4">
          <p className="text-gray-700"><strong>Address:</strong> 123 Cake Street, Sweet City, SC 12345</p>
          <p className="text-gray-700"><strong>Phone:</strong> +1 (123) 456-7890</p>
          <p className="text-gray-700"><strong>Email:</strong> info@cakeshop.com</p>
        </div>
        <div className="overflow-hidden rounded-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.8354345093747!2d144.95373531531615!3d-37.816279742021665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577d6a32f4f4b1e!2sCake%20Shop!5e0!3m2!1sen!2sus!4v1622549400000!5m2!1sen!2sus"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  </main>
);

export default Contact;
