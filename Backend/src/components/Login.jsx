import React from 'react';
import '../styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="card p-4 shadow" style={{ width: '400px' }}>
      <h2 className="text-center mb-4">Login</h2>
      <form id="login-form">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
      <p className="text-center mt-3">
        Don't have an account? <a href="/register" className="text-decoration-none">Sign up</a>
      </p>
    </div>
  </div>
);

export default Login;