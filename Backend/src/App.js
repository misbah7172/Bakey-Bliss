import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Index from './pages/Index'; // Home Page
import Inbox from './pages/Inbox'; // Inbox Page
import CustomOrders from './components/CustomOrders';
import Products from './components/Products';
import Login from './components/Login';
import Register from './components/Register';
import BecomeBaker from './components/BecomeBaker';
import Cart from './components/Cart';
import BakerDashboard from './components/BakerDashboard';
import Contact from './components/Contact';
import './styles.css';

function App() {
  return (
    <Router>
      <div>

        {/* Navigation Menu */}
        <Navbar />

        {/* Main Content */}
        <Routes>
          {/* Home Page (You can replace this with a Home component if needed) */}
          <Route path="/" element={<Index />} />
          <Route path="/inbox" element={<Inbox />} />

          {/* Custom Orders Page */}
          <Route path="/custom-orders" element={<CustomOrders />} />

          {/* Products Page */}
          <Route path="/products" element={<Products />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />

          {/* Register Page */}
          <Route path="/register" element={<Register />} />

          {/* Become a Baker Page */}
          <Route path="/become-baker" element={<BecomeBaker />} />

          {/* Cart Page */}
          <Route path="/cart" element={<Cart />} />

          {/* Baker Dashboard Page */}
          <Route path="/baker-dashboard" element={<BakerDashboard />} />

          {/* Contact Page */}
          <Route path="/contact" element={<Contact />} />
        </Routes>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
