// Main app functionality
class MaryCreationsApp {
  constructor() {
    this.settings = null;
    this.products = null;
    this.reviews = null;
    this.init();
  }

  async init() {
    try {
      // Load data
      await this.loadData();
      
      // Initialize components
      this.initTheme();
      this.renderHeader();
      this.renderFooter();
      this.initWhatsApp();
      this.updateSettings();
      
      // Initialize page-specific functionality
      if (document.getElementById('home-products')) {
        this.renderFeaturedProducts();
      }
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Continue with basic functionality even if data loading fails
      this.initTheme();
      this.renderBasicHeader();
      this.renderBasicFooter();
    }
  }

  async loadData() {
    try {
      const [settingsRes, productsRes, reviewsRes] = await Promise.all([
        fetch('data/settings.json'),
        fetch('data/products.json'),
        fetch('data/reviews.json')
      ]);

      this.settings = await settingsRes.json();
      this.products = await productsRes.json();
      this.reviews = await reviewsRes.json();
    } catch (error) {
      console.error('Failed to load data:', error);
      // Fallback data
      this.settings = {
        brandName: 'Mary Creations',
        tagline: 'Woven with Love',
        whatsapp: '+917860861434',
        meeshoShopUrl: 'https://www.meesho.com'
      };
      this.products = [];
      this.reviews = [];
    }
  }

  initTheme() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌙';
    themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    
    // Add to page if header exists
    const header = document.getElementById('site-header');
    if (header) {
      header.appendChild(themeToggle);
    }
  }

  toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    }
    
    localStorage.setItem('theme', newTheme);
  }

  renderHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    header.innerHTML = `
      <nav class="navbar container">
        <div class="nav-brand">
          <a href="index.html" class="brand-link">
            <h1 class="brand">${this.settings.brandName}</h1>
          </a>
        </div>
        <div class="nav-menu">
          <a href="index.html">Home</a>
          <a href="shop.html">Shop</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
          <a href="reviews.html">Reviews</a>
          <button class="theme-toggle">🌙</button>
        </div>
      </nav>
    `;

    // Re-initialize theme toggle
    const themeToggle = header.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
      // Set initial theme
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    }
  }

  renderBasicHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    header.innerHTML = `
      <nav class="navbar container">
        <div class="nav-brand">
          <a href="index.html" class="brand-link">
            <h1 class="brand">Mary Creations</h1>
          </a>
        </div>
        <div class="nav-menu">
          <a href="index.html">Home</a>
          <a href="shop.html">Shop</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
          <button class="theme-toggle">🌙</button>
        </div>
      </nav>
    `;

    // Initialize theme toggle
    const themeToggle = header.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }
  }

  renderFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;

    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-content">
          <div class="footer-section">
            <h3>${this.settings.brandName}</h3>
            <p>${this.settings.description || this.settings.tagline}</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="shop.html">Shop</a></li>
              <li><a href="about.html">About</a></li>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="faq.html">FAQ</a></li>
              <li><a href="shipping-returns.html">Shipping & Returns</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact</h4>
            <p>WhatsApp: ${this.settings.whatsapp}</p>
            ${this.settings.email ? `<p>Email: ${this.settings.email}</p>` : ''}
            ${this.settings.address ? `<p>${this.settings.address}</p>` : ''}
          </div>
          <div class="footer-section">
            <h4>Follow Us</h4>
            <div class="social-links">
              ${this.settings.instagram ? `<a href="${this.settings.instagram}" target="_blank" rel="noopener">Instagram</a>` : ''}
              ${this.settings.facebook ? `<a href="${this.settings.facebook}" target="_blank" rel="noopener">Facebook</a>` : ''}
              <a href="${this.settings.meeshoShopUrl}" target="_blank" rel="noopener">Meesho</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom container">
          <p>&copy; ${new Date().getFullYear()} ${this.settings.brandName}. All rights reserved.</p>
        </div>
      </footer>
    `;
  }

  renderBasicFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;

    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-content">
          <div class="footer-section">
            <h3>Mary Creations</h3>
            <p>Woven with Love</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="shop.html">Shop</a></li>
              <li><a href="about.html">About</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom container">
          <p>&copy; ${new Date().getFullYear()} Mary Creations. All rights reserved.</p>
        </div>
      </footer>
    `;
  }

  initWhatsApp() {
    const waFloat = document.getElementById('whatsapp-float');
    if (waFloat && this.settings.whatsapp) {
      const message = encodeURIComponent("Hi Mary Creations, I'm interested in your stoles.");
      waFloat.href = `https://wa.me/${this.settings.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
    }
  }

  updateSettings() {
    // Update brand logo
    const brandLogo = document.getElementById('brand-logo');
    if (brandLogo) {
      brandLogo.textContent = this.settings.brandName;
    }

    // Update Meesho links
    const meeshoLinks = document.querySelectorAll('#meesho-shop-link, #meesho-shop-link-2, #meesho-badge');
    meeshoLinks.forEach(link => {
      if (this.settings.meeshoShopUrl) {
        link.href = this.settings.meeshoShopUrl;
      }
    });
  }

  renderFeaturedProducts() {
    const container = document.getElementById('home-products');
    if (!container || !this.products) return;

    const featuredProducts = this.products.filter(p => p.featured && p.inStock).slice(0, 6);
    
    container.innerHTML = featuredProducts.map(product => `
      <div class="product-card">
        <a href="product.html?id=${product.id}" class="product-link">
          <div class="product-image">
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
            ${!product.inStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
          </div>
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-material">${product.material} • ${product.color}</p>
            <div class="product-price">
              <span class="price">₹${product.price}</span>
              ${product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
            </div>
          </div>
        </a>
      </div>
    `).join('');
  }

  formatPrice(price) {
    return `₹${price.toLocaleString('en-IN')}`;
  }

  // Utility methods
  getProductById(id) {
    return this.products ? this.products.find(p => p.id == id) : null;
  }

  getReviewsForProduct(productId) {
    return this.reviews ? this.reviews.filter(r => r.productId == productId) : [];
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MaryCreationsApp();
});