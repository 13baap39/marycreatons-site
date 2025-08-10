// Shop page functionality
class ShopManager {
  constructor() {
    this.filteredProducts = [];
    this.currentFilters = {
      search: '',
      priceMin: 0,
      priceMax: 5000,
      inStockOnly: false
    };
    this.init();
  }

  async init() {
    // Wait for main app to load
    await this.waitForApp();
    
    this.filteredProducts = [...window.app.products];
    this.setupFilters();
    this.renderProducts();
    this.updateMeeshoBadge();
  }

  waitForApp() {
    return new Promise((resolve) => {
      const checkApp = () => {
        if (window.app && window.app.products) {
          resolve();
        } else {
          setTimeout(checkApp, 100);
        }
      };
      checkApp();
    });
  }

  setupFilters() {
    // Search filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilters.search = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    // Price range filters
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const priceMinVal = document.getElementById('price-min-val');
    const priceMaxVal = document.getElementById('price-max-val');

    if (priceMin && priceMax) {
      priceMin.addEventListener('input', (e) => {
        this.currentFilters.priceMin = parseInt(e.target.value);
        if (priceMinVal) priceMinVal.textContent = `₹${this.currentFilters.priceMin}`;
        this.applyFilters();
      });

      priceMax.addEventListener('input', (e) => {
        this.currentFilters.priceMax = parseInt(e.target.value);
        if (priceMaxVal) priceMaxVal.textContent = `₹${this.currentFilters.priceMax}`;
        this.applyFilters();
      });
    }

    // In stock filter
    const inStockOnly = document.getElementById('in-stock-only');
    if (inStockOnly) {
      inStockOnly.addEventListener('change', (e) => {
        this.currentFilters.inStockOnly = e.target.checked;
        this.applyFilters();
      });
    }
  }

  applyFilters() {
    this.filteredProducts = window.app.products.filter(product => {
      // Search filter
      if (this.currentFilters.search) {
        const searchTerm = this.currentFilters.search;
        const searchableText = [
          product.name,
          product.material,
          product.color,
          product.description,
          product.category
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Price filter
      if (product.price < this.currentFilters.priceMin || 
          product.price > this.currentFilters.priceMax) {
        return false;
      }

      // In stock filter
      if (this.currentFilters.inStockOnly && !product.inStock) {
        return false;
      }

      return true;
    });

    this.renderProducts();
  }

  renderProducts() {
    const container = document.getElementById('shop-grid');
    if (!container) return;

    if (this.filteredProducts.length === 0) {
      container.innerHTML = `
        <div class="no-products">
          <h3>No products found</h3>
          <p>Try adjusting your filters to see more results.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.filteredProducts.map(product => `
      <div class="product-card${!product.inStock ? ' out-of-stock' : ''}">
        <a href="product.html?id=${product.id}" class="product-link">
          <div class="product-image">
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
            ${!product.inStock ? '<div class="out-of-stock-badge">Out of Stock</div>' : ''}
            ${product.originalPrice > product.price ? '<div class="sale-badge">Sale</div>' : ''}
          </div>
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-details">${product.material} • ${product.color}</p>
            <p class="product-size">${product.size}</p>
            <div class="product-price">
              <span class="price">₹${product.price}</span>
              ${product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
              ${product.originalPrice > product.price ? `<span class="discount">${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off</span>` : ''}
            </div>
          </div>
        </a>
        <div class="product-actions">
          <button class="btn outline btn-whatsapp" onclick="shopManager.contactWhatsApp('${product.name}', ${product.id})">
            WhatsApp
          </button>
          <a href="${window.app.settings.meeshoShopUrl}" target="_blank" rel="noopener" class="btn primary">
            Buy on Meesho
          </a>
        </div>
      </div>
    `).join('');
  }

  updateMeeshoBadge() {
    const meeshoBadge = document.getElementById('meesho-badge');
    if (meeshoBadge && window.app.settings.meeshoShopUrl) {
      meeshoBadge.href = window.app.settings.meeshoShopUrl;
    }
  }

  contactWhatsApp(productName, productId) {
    if (window.app.settings.whatsapp) {
      const message = encodeURIComponent(`Hi Mary Creations! I'm interested in the "${productName}" stole. Could you please share more details?`);
      const whatsappUrl = `https://wa.me/${window.app.settings.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  // Sort functionality
  sortProducts(sortBy) {
    switch (sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => b.id - a.id);
        break;
      default:
        // Default sort by featured first, then by ID
        this.filteredProducts.sort((a, b) => {
          if (a.featured !== b.featured) {
            return b.featured - a.featured;
          }
          return a.id - b.id;
        });
    }
    this.renderProducts();
  }
}

// Initialize shop manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.shopManager = new ShopManager();
});