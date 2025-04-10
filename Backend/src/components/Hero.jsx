import React from 'react';
import '../styles.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const Hero = () => (
  <section className="hero">
    <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img src="https://via.placeholder.com/1200x400?text=Cake+1" className="d-block w-100" alt="Cake 1" />
        </div>
        <div className="carousel-item">
          <img src="https://via.placeholder.com/1200x400?text=Cake+2" className="d-block w-100" alt="Cake 2" />
        </div>
        <div className="carousel-item">
          <img src="https://via.placeholder.com/1200x400?text=Cake+3" className="d-block w-100" alt="Cake 3" />
        </div>
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
      </button>
    </div>
    <div className="search-bar">
      <input type="text" placeholder="Search for cakes, bread, chocolates..." />
      <button>Search</button>
    </div>
  </section>
);

export default Hero;
