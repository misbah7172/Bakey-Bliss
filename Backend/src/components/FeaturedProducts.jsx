import React from 'react';
import '../styles.css'; 
import '../product_listing.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const FeaturedProducts = () => (
  <section className="featured-products">
    <h2>Featured Products</h2>
    <div className="product-grid">
      <div className="product-card">
        <img src="https://via.placeholder.com/200x200?text=Cake+1" alt="Cake 1" />
        <h3>Chocolate Cake</h3>
        <p>$25.00</p>
        <button>Add to Cart</button>
      </div>
      <div className="product-card">
        <img src="https://via.placeholder.com/200x200?text=Bread+1" alt="Bread 1" />
        <h3>Artisan Bread</h3>
        <p>$10.00</p>
        <button>Add to Cart</button>
      </div>
      <div className="product-card">
        <img src="https://via.placeholder.com/200x200?text=Chocolate+1" alt="Chocolate 1" />
        <h3>Dark Chocolate</h3>
        <p>$15.00</p>
        <button>Add to Cart</button>
      </div>
    </div>
  </section>
);

export default FeaturedProducts;
