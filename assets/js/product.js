// Product page functionality
class ProductManager {
  constructor() {
    this.product = null;
    this.reviews = [];
    this.currentImageIndex = 0;
    this.init();
  }

  async init() {
    // Wait for main app to load
    await this.waitForApp();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
      this.showError('Product not found');
      return;
    }

    this.product = window.app.getProductById(productId);
    if (!this.product) {
      this.showError('Product not found');
      return;
    }

    this.reviews = window.app.getReviewsForProduct(productId);
    
    this.renderProduct();
    this.renderReviews();
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

  renderProduct() {
    const container = document.getElementById('product');
    if (!container) return;

    const discount = this.product.originalPrice > this.product.price ? 
      Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100) : 0;

    container.innerHTML = `
      <div class="product-detail">
        <div class="product-gallery">
          <div class="main-image">
            <img id="main-product-image" src="${this.product.images[0]}" alt="${this.product.name}">
            ${!this.product.inStock ? '<div class="out-of-stock-overlay">Out of Stock</div>' : ''}
          </div>
          ${this.product.images.length > 1 ? `
            <div class="thumbnail-images">
              ${this.product.images.map((image, index) => `
                <img class="thumbnail${index === 0 ? ' active' : ''}" 
                     src="${image}" 
                     alt="${this.product.name} ${index + 1}"
                     onclick="productManager.changeImage(${index})">
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="product-info">
          <div class="breadcrumb">
            <a href="index.html">Home</a> > 
            <a href="shop.html">Shop</a> > 
            <span>${this.product.name}</span>
          </div>
          
          <h1>${this.product.name}</h1>
          
          <div class="product-price">
            <span class="current-price">₹${this.product.price}</span>
            ${this.product.originalPrice > this.product.price ? `
              <span class="original-price">₹${this.product.originalPrice}</span>
              <span class="discount-badge">${discount}% OFF</span>
            ` : ''}
          </div>

          <div class="product-details">
            <div class="detail-item">
              <strong>Material:</strong> ${this.product.material}
            </div>
            <div class="detail-item">
              <strong>Color:</strong> ${this.product.color}
            </div>
            <div class="detail-item">
              <strong>Size:</strong> ${this.product.size}
            </div>
            <div class="detail-item">
              <strong>Availability:</strong> 
              <span class="${this.product.inStock ? 'in-stock' : 'out-of-stock'}">
                ${this.product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>

          <div class="product-description">
            <p>${this.product.description}</p>
          </div>

          <div class="product-actions">
            ${this.product.inStock ? `
              <button class="btn primary large" onclick="productManager.contactWhatsApp()">
                Order on WhatsApp
              </button>
              <a href="${window.app.settings.meeshoShopUrl}" target="_blank" rel="noopener" class="btn secondary large">
                Buy on Meesho
              </a>
            ` : `
              <button class="btn disabled large" disabled>
                Currently Out of Stock
              </button>
              <button class="btn outline large" onclick="productManager.notifyWhenAvailable()">
                Notify When Available
              </button>
            `}
          </div>

          <div class="product-features">
            <div class="feature">
              <span class="icon">🚚</span>
              <div>
                <strong>Fast Delivery</strong>
                <p>Quick dispatch across India</p>
              </div>
            </div>
            <div class="feature">
              <span class="icon">🔄</span>
              <div>
                <strong>Easy Returns</strong>
                <p>7-day return policy</p>
              </div>
            </div>
            <div class="feature">
              <span class="icon">💯</span>
              <div>
                <strong>Quality Assured</strong>
                <p>Premium fabric guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="product-reviews-section">
        <h2>Customer Reviews</h2>
        <div id="product-reviews"></div>
      </div>

      <div class="related-products">
        <h2>You might also like</h2>
        <div id="related-products-grid" class="product-grid"></div>
      </div>
    `;

    // Update page title
    document.title = `${this.product.name} — Mary Creations`;
    
    // Render related products
    this.renderRelatedProducts();
  }

  renderReviews() {
    const container = document.getElementById('product-reviews');
    if (!container) return;

    if (this.reviews.length === 0) {
      container.innerHTML = `
        <div class="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      `;
      return;
    }

    // Calculate average rating
    const avgRating = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;

    container.innerHTML = `
      <div class="reviews-summary">
        <div class="rating-overview">
          <div class="avg-rating">${avgRating.toFixed(1)}</div>
          <div class="stars">${this.generateStars(avgRating)}</div>
          <div class="review-count">${this.reviews.length} review${this.reviews.length !== 1 ? 's' : ''}</div>
        </div>
      </div>
      
      <div class="reviews-list">
        ${this.reviews.map(review => `
          <div class="review">
            <div class="review-header">
              <div class="reviewer-name">${review.name}</div>
              <div class="review-rating">${this.generateStars(review.rating)}</div>
              <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
            </div>
            <div class="review-content">
              <p>${review.comment}</p>
            </div>
            ${review.verified ? '<div class="verified-purchase">✓ Verified Purchase</div>' : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderRelatedProducts() {
    const container = document.getElementById('related-products-grid');
    if (!container) return;

    // Get related products (same category or similar material, excluding current product)
    const relatedProducts = window.app.products
      .filter(p => p.id !== this.product.id && 
               (p.category === this.product.category || p.material === this.product.material))
      .slice(0, 4);

    if (relatedProducts.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = relatedProducts.map(product => `
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

  changeImage(index) {
    if (index < 0 || index >= this.product.images.length) return;

    this.currentImageIndex = index;
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
      mainImage.src = this.product.images[index];
    }

    // Update thumbnail active state
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  contactWhatsApp() {
    if (window.app.settings.whatsapp) {
      const message = encodeURIComponent(
        `Hi Mary Creations! I'm interested in ordering the "${this.product.name}" stole (₹${this.product.price}). Please share more details and availability.`
      );
      const whatsappUrl = `https://wa.me/${window.app.settings.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  notifyWhenAvailable() {
    if (window.app.settings.whatsapp) {
      const message = encodeURIComponent(
        `Hi Mary Creations! I'd like to be notified when "${this.product.name}" stole is back in stock. Please let me know when it's available.`
      );
      const whatsappUrl = `https://wa.me/${window.app.settings.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }

  showError(message) {
    const container = document.getElementById('product');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <h2>${message}</h2>
          <p>The product you're looking for could not be found.</p>
          <a href="shop.html" class="btn primary">Browse All Products</a>
        </div>
      `;
    }
  }
}

// Initialize product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.productManager = new ProductManager();
});