// DOM Elements
const bakerForm = document.getElementById('baker-form');

// Form Submission
bakerForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get Form Data
  const formData = new FormData(bakerForm);
  const data = {};
  formData.forEach((value, key) => {
    if (key === 'availability') {
      if (!data[key]) data[key] = [];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  });

  // Log Form Data (Replace with API call in production)
  console.log("Application Data:", data);

  // Show Success Message
  alert("Thank you for applying! We will review your application and get back to you soon.");
  bakerForm.reset();
});
