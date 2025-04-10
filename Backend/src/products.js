// Sample Product Data
const products = [
  { id: 1, name: "Chocolate Cake", category: "cakes", price: 25, image: "https://via.placeholder.com/200x200?text=Chocolate+Cake", isNew: false },
  { id: 2, name: "Artisan Bread", category: "bread", price: 10, image: "https://via.placeholder.com/200x200?text=Artisan+Bread", isNew: true },
  { id: 3, name: "Vanilla Cookies", category: "cookies", price: 8, image: "https://via.placeholder.com/200x200?text=Vanilla+Cookies", isNew: false },
  { id: 4, name: "Dark Chocolate", category: "chocolates", price: 15, image: "https://via.placeholder.com/200x200?text=Dark+Chocolate", isNew: true },
  { id: 5, name: "Seasonal Fruit Tart", category: "seasonal", price: 20, image: "https://via.placeholder.com/200x200?text=Fruit+Tart", isNew: false },
  { id: 6, name: "Iced Coffee", category: "beverages", price: 5, image: "https://via.placeholder.com/200x200?text=Iced+Coffee", isNew: true },
];

// Render Products
const productGrid = document.querySelector('.product-grid');

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
const categoryFilter = document.getElementById('category');
categoryFilter.addEventListener('change', (e) => {
  const selectedCategory = e.target.value;
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);
  renderProducts(filteredProducts);
});

// Sort Products
const sortFilter = document.getElementById('sort');
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
    default:
      // Default to popularity (no sorting)
      break;
  }

  renderProducts(sortedProducts);
});
