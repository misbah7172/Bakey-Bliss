// DOM Elements
const productType = document.getElementById('product-type');
const size = document.getElementById('size');
const flavor = document.getElementById('flavor');
const customText = document.getElementById('custom-text');
const imageUpload = document.getElementById('image-upload');
const previewImage = document.getElementById('preview-image');
const previewText = document.getElementById('preview-text');
const addToCartButton = document.querySelector('.add-to-cart');

// Update Preview
const updatePreview = () => {
  // Update preview text
  previewText.textContent = customText.value || "Custom Text Here";

  // Update preview image if uploaded
  if (imageUpload.files && imageUpload.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(imageUpload.files[0]);
  }
};

// Event Listeners
customText.addEventListener('input', updatePreview);
imageUpload.addEventListener('change', updatePreview);

// Add to Cart Functionality
addToCartButton.addEventListener('click', () => {
  const orderDetails = {
    productType: productType.value,
    size: size.value,
    flavor: flavor.value,
    customText: customText.value,
    image: imageUpload.files[0] ? imageUpload.files[0].name : null,
  };
  console.log("Order Details:", orderDetails);
  alert("Your custom order has been added to the cart!");
});
