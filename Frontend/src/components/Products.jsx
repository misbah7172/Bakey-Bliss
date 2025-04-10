import React from 'react';
import '../styles.css';
import '../products.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Products = () => (
  <section className="products">
    <div className="container">
      <h2>Our Delicious Products</h2>
      <div className="filters">
        <label htmlFor="category">Category:</label>
        <select id="category">
          <option value="all">All</option>
          <option value="cakes">Cakes</option>
          <option value="bread">Bread</option>
          <option value="cookies">Cookies</option>
          <option value="chocolates">Chocolates</option>
          <option value="beverages">Beverages</option>
          <option value="seasonal">Seasonal Items</option>
        </select>

        <label htmlFor="sort">Sort By:</label>
        <select id="sort">
          <option value="popularity">Popularity</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="new-arrivals">New Arrivals</option>
        </select>
      </div>

      <div className="product-grid">
        {/* Product Cards will be dynamically inserted here */}
      </div>
    </div>
  </section>
);

export default Products;
