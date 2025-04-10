// Sample Data
const orders = [
  { id: 1, customer: "John Doe", items: "Chocolate Cake, Vanilla Cookies", status: "Pending" },
  { id: 2, customer: "Jane Smith", items: "Artisan Bread, Iced Coffee", status: "In Progress" },
  { id: 3, customer: "Alice Johnson", items: "Seasonal Fruit Tart", status: "Completed" },
];

const earnings = [
  { month: "January", amount: 1200 },
  { month: "February", amount: 1500 },
  { month: "March", amount: 1800 },
];

const chatMessages = [
  { sender: "Customer", message: "Hi, can I get an update on my order?" },
  { sender: "Baker", message: "Sure! Your order is in progress and will be ready soon." },
];

// DOM Elements
const ordersList = document.querySelector('.orders-list');
const taskForm = document.getElementById('task-form');
const earningsChart = document.querySelector('.earnings-chart');
const totalEarnings = document.getElementById('total-earnings');
const chatMessagesContainer = document.querySelector('.chat-messages');
const chatInput = document.getElementById('chat-message');
const sendMessageButton = document.getElementById('send-message');

// Render Orders
const renderOrders = () => {
  ordersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.customer}</p>
      <p><strong>Items:</strong> ${order.items}</p>
      <p><strong>Status:</strong> <span class="status ${order.status.toLowerCase()}">${order.status}</span></p>
      <button class="update-status" data-id="${order.id}">Update Status</button>
    </div>
  `).join('');
};

// Render Earnings Chart
const renderEarningsChart = () => {
  const total = earnings.reduce((sum, entry) => sum + entry.amount, 0);
  totalEarnings.textContent = `$${total.toFixed(2)}`;

  // Simple chart representation (can be replaced with a chart library like Chart.js)
  earningsChart.innerHTML = earnings.map(entry => `
    <div class="chart-bar" style="height: ${entry.amount / 20}px;">
      <span>${entry.month}</span>
    </div>
  `).join('');
};

// Render Chat Messages
const renderChatMessages = () => {
  chatMessagesContainer.innerHTML = chatMessages.map(msg => `
    <div class="message ${msg.sender.toLowerCase()}">
      <strong>${msg.sender}:</strong> ${msg.message}
    </div>
  `).join('');
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Auto-scroll to latest message
};

// Assign Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskDescription = document.getElementById('task-description').value;
  const assignTo = document.getElementById('assign-to').value;
  alert(`Task assigned to ${assignTo}: ${taskDescription}`);
  taskForm.reset();
});

// Send Chat Message
sendMessageButton.addEventListener('click', () => {
  const message = chatInput.value.trim();
  if (message) {
    chatMessages.push({ sender: "Baker", message });
    renderChatMessages();
    chatInput.value = "";
  }
});

// Initial Render
renderOrders();
renderEarningsChart();
renderChatMessages();
