// Sample Product Data
const products = [
  { id: 1, name: "Chocolate Cake", category: "cakes", price: 25, image: "https://via.placeholder.com/200x200?text=Chocolate+Cake", isNew: false, popularity: 5 },
  { id: 2, name: "Artisan Bread", category: "bread", price: 10, image: "https://via.placeholder.com/200x200?text=Artisan+Bread", isNew: true, popularity: 4 },
  { id: 3, name: "Vanilla Cookies", category: "cookies", price: 8, image: "https://via.placeholder.com/200x200?text=Vanilla+Cookies", isNew: false, popularity: 3 },
  { id: 4, name: "Dark Chocolate", category: "chocolates", price: 15, image: "https://via.placeholder.com/200x200?text=Dark+Chocolate", isNew: true, popularity: 5 },
  { id: 5, name: "Seasonal Fruit Tart", category: "seasonal", price: 20, image: "https://via.placeholder.com/200x200?text=Fruit+Tart", isNew: false, popularity: 2 },
  { id: 6, name: "Iced Coffee", category: "beverages", price: 5, image: "https://via.placeholder.com/200x200?text=Iced+Coffee", isNew: true, popularity: 4 },
];

// DOM Elements
const productGrid = document.querySelector('.product-grid');
const categoryFilter = document.getElementById('category');
const sortFilter = document.getElementById('sort');
const searchInput = document.getElementById('search');
const searchButton = document.getElementById('search-button');

// Render Products
const renderProducts = (products) => {
  productGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>$${product.price.toFixed(2)}</p>
      ${product.isNew ? '<span class="new-badge">New!</span>' : ''}
      <button>Add to Cart</button>
    </div>
  `).join('');
};

// Initial Render
renderProducts(products);

// Filter Products by Category
categoryFilter.addEventListener('change', (e) => {
  const selectedCategory = e.target.value;
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);
  renderProducts(filteredProducts);
});

// Sort Products
sortFilter.addEventListener('change', (e) => {
  const sortBy = e.target.value;
  let sortedProducts = [...products];

  switch (sortBy) {
    case 'price-low':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'new-arrivals':
      sortedProducts = sortedProducts.filter(product => product.isNew);
      break;
    case 'popularity':
      sortedProducts.sort((a, b) => b.popularity - a.popularity);
      break;
    default:
      // Default to original order
      break;
  }

  renderProducts(sortedProducts);
});

// Search Products
searchButton.addEventListener('click', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm)
  );
  renderProducts(filteredProducts);
});
