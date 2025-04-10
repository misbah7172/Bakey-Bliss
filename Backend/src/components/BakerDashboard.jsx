import React from 'react';
import '../styles.css';
import '../baker_dash.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const BakerDashboard = () => (
  <section className="baker-dashboard">
    <div className="container">
      <h2>Baker Dashboard</h2>
      <div className="dashboard-content">
        <div className="incoming-orders">
          <h3>Incoming Orders</h3>
          <div className="orders-list">
            {/* Orders will be dynamically inserted here */}
          </div>
        </div>
        <div className="assign-tasks">
          <h3>Assign Tasks to Junior Bakers</h3>
          <form id="task-form">
            <div className="form-group">
              <label htmlFor="task-description">Task Description:</label>
              <textarea id="task-description" name="task-description" required></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="assign-to">Assign To:</label>
              <select id="assign-to" name="assign-to" required>
                <option value="baker1">Junior Baker 1</option>
                <option value="baker2">Junior Baker 2</option>
                <option value="baker3">Junior Baker 3</option>
              </select>
            </div>
            <button type="submit" className="submit-button">Assign Task</button>
          </form>
        </div>
        <div className="earnings-report">
          <h3>Earnings Report</h3>
          <div className="earnings-chart">
            {/* Chart will be dynamically inserted here */}
          </div>
          <p>Total Earnings: <span id="total-earnings">$0.00</span></p>
        </div>
        <div className="chat-feature">
          <h3>Chat with Customers</h3>
          <div className="chat-window">
            <div className="chat-messages">
              {/* Chat messages will be dynamically inserted here */}
            </div>
            <div className="chat-input">
              <input type="text" id="chat-message" placeholder="Type your message..." />
              <button id="send-message">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BakerDashboard;
