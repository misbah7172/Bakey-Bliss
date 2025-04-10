import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles.css';
import '../index.css';

const Index = () => {
  return (
    <div>
      {/* Loader */}

      {/* Hero Section */}
      <section className="hero">
        <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="https://via.placeholder.com/1200x400?text=Cake+1"
                className="d-block w-100"
                alt="Cake 1"
              />
            </div>
            <div className="carousel-item">
              <img
                src="https://via.placeholder.com/1200x400?text=Cake+2"
                className="d-block w-100"
                alt="Cake 2"
              />
            </div>
            <div className="carousel-item">
              <img
                src="https://via.placeholder.com/1200x400?text=Cake+3"
                className="d-block w-100"
                alt="Cake 3"
              />
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
          </button>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search for cakes, bread, chocolates..." />
          <button>Search</button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-grid">
          <div className="product-card">
            <img
              src="https://via.placeholder.com/200x200?text=Cake+1"
              alt="Cake 1"
            />
            <h3>Chocolate Cake</h3>
            <p>$25.00</p>
            <button>Add to Cart</button>
          </div>
          <div className="product-card">
            <img
              src="https://via.placeholder.com/200x200?text=Bread+1"
              alt="Bread 1"
            />
            <h3>Artisan Bread</h3>
            <p>$10.00</p>
            <button>Add to Cart</button>
          </div>
          <div className="product-card">
            <img
              src="https://via.placeholder.com/200x200?text=Chocolate+1"
              alt="Chocolate 1"
            />
            <h3>Dark Chocolate</h3>
            <p>$15.00</p>
            <button>Add to Cart</button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
    </div>
  );
};

export default Index;