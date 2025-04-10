import React from 'react';
import '../styles.css';
import '../custom_orders.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomOrders = () => (
  <section className="custom-orders">
    <div className="container">
      <h2>Customize Your Order</h2>
      <div className="customization-form">
        {/* Product Type Selection */}
        <div className="form-group">
          <label htmlFor="product-type">Product Type:</label>
          <select id="product-type">
            <option value="cake">Cake</option>
            <option value="chocolate">Chocolate</option>
          </select>
        </div>

        {/* Size Selection */}
        <div className="form-group">
          <label htmlFor="size">Size:</label>
          <select id="size">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        {/* Flavor Selection */}
        <div className="form-group">
          <label htmlFor="flavor">Flavor:</label>
          <select id="flavor">
            <option value="chocolate">Chocolate</option>
            <option value="vanilla">Vanilla</option>
            <option value="strawberry">Strawberry</option>
            <option value="red-velvet">Red Velvet</option>
          </select>
        </div>

        {/* Custom Text */}
        <div className="form-group">
          <label htmlFor="custom-text">Custom Text:</label>
          <input
            type="text"
            id="custom-text"
            placeholder="Enter custom text (e.g., Happy Birthday!)"
          />
        </div>

        {/* Upload Image */}
        <div className="form-group">
          <label htmlFor="image-upload">Upload Image:</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
          />
        </div>

        {/* Preview Section */}
        <div className="preview">
          <h3>Preview Your Customization</h3>
          <div className="preview-box">
            <img
              id="preview-image"
              src="https://via.placeholder.com/300x200?text=Preview+Image"
              alt="Preview"
            />
            <p id="preview-text">Custom Text Here</p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button className="add-to-cart">Add to Cart</button>
      </div>
    </div>
  </section>
);

export default CustomOrders;
