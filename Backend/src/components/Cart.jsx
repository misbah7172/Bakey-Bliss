import React from 'react';
import '../styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Cart = () => (
  <main className="container py-5">
    <h2 className="text-center mb-4">Your Cart</h2>
    <div className="row justify-content-center">
      <div className="col-md-8">
        {/* Cart Items */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center mb-3">
              <div className="col-3">
                <img
                  src="https://via.placeholder.com/200x200?text=Cake+1"
                  alt="Chocolate Cake"
                  className="img-fluid rounded"
                />
              </div>
              <div className="col-5">
                <h3 className="h5">Chocolate Cake</h3>
                <p className="text-muted">$20</p>
              </div>
              <div className="col-2">
                <div className="input-group">
                  <button className="btn btn-outline-secondary">-</button>
                  <input
                    type="number"
                    value="1"
                    className="form-control text-center"
                  />
                  <button className="btn btn-outline-secondary">+</button>
                </div>
              </div>
              <div className="col-2 text-end">
                <button className="btn btn-link text-danger">Remove</button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card">
          <div className="card-body">
            <h3 className="h4 mb-4">Order Summary</h3>
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <p className="text-muted">Subtotal</p>
                <p className="text-muted">$56</p>
              </div>
              <div className="d-flex justify-content-between">
                <p className="text-muted">Shipping</p>
                <p className="text-muted">$5</p>
              </div>
              <div className="d-flex justify-content-between">
                <p className="text-muted">Tax</p>
                <p className="text-muted">$4.20</p>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <p className="h5">Total</p>
                <p className="h5">$65.20</p>
              </div>
            </div>
            <button className="btn btn-primary w-100">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default Cart;