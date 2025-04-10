import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const Register = () => (
  <div className="container d-flex justify-content-center align-items-center vh-100">
    <div className="card p-4 shadow" style={{ width: '400px' }}>
      <h2 className="text-center mb-4">Register</h2>
      <form id="register-form">
        {/* Full Name Input */}
        <div className="mb-3">
          <label htmlFor="full-name" className="form-label">Full Name</label>
          <input
            type="text"
            id="full-name"
            className="form-control"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email Input */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password Input */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
            required
          />
        </div>

        {/* Confirm Password Input */}
        <div className="mb-4">
          <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            className="form-control"
            placeholder="Confirm your password"
            required
          />
        </div>

        {/* Register Button */}
        <button type="submit" className="btn btn-primary w-100">
          Register
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center mt-3">
        Already have an account? <a href="/login" className="text-decoration-none">Login here</a>
      </p>
    </div>
  </div>
);

export default Register;