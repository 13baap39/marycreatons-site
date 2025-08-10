// Admin page functionality
class AdminManager {
  constructor() {
    this.settings = {};
    this.products = [];
    this.reviews = [];
    this.init();
  }

  async init() {
    // Wait for main app to load
    await this.waitForApp();
    
    this.settings = {...window.app.settings};
    this.products = [...window.app.products];
    this.reviews = [...window.app.reviews];
    
    this.setupForms();
    this.populateSettings();
    this.renderProducts();
    this.renderReviews();
  }

  waitForApp() {
    return new Promise((resolve) => {
      const checkApp = () => {
        if (window.app && window.app.settings) {
          resolve();
        } else {
          setTimeout(checkApp, 100);
        }
      };
      checkApp();
    });
  }

  setupForms() {
    // Settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    // Hook up existing buttons
    const addProductBtn = document.getElementById('add-product');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => this.showAddProductForm());
    }

    const exportProductsBtn = document.getElementById('export-products');
    if (exportProductsBtn) {
      exportProductsBtn.addEventListener('click', () => this.downloadProducts());
    }

    const exportProducts2Btn = document.getElementById('export-products-2');
    if (exportProducts2Btn) {
      exportProducts2Btn.addEventListener('click', () => this.downloadProducts());
    }

    const exportReviewsBtn = document.getElementById('export-reviews');
    if (exportReviewsBtn) {
      exportReviewsBtn.addEventListener('click', () => this.downloadReviews());
    }

    const exportReviews2Btn = document.getElementById('export-reviews-2');
    if (exportReviews2Btn) {
      exportReviews2Btn.addEventListener('click', () => this.downloadReviews());
    }

    const exportSettingsBtn = document.getElementById('export-settings');
    if (exportSettingsBtn) {
      exportSettingsBtn.addEventListener('click', () => this.downloadJSON('settings.json', this.settings));
    }

    const addReviewBtn = document.getElementById('add-review');
    if (addReviewBtn) {
      addReviewBtn.addEventListener('click', () => this.showAddReviewForm());
    }
  }

  populateSettings() {
    const form = document.getElementById('settings-form');
    if (!form) return;

    // Populate form fields with current settings
    Object.entries(this.settings).forEach(([key, value]) => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = value || '';
      }
    });
  }

  saveSettings() {
    const form = document.getElementById('settings-form');
    if (!form) return;

    const formData = new FormData(form);
    const updatedSettings = {};
    
    for (let [key, value] of formData.entries()) {
      updatedSettings[key] = value;
    }

    this.settings = {...this.settings, ...updatedSettings};
    
    this.downloadJSON('settings.json', this.settings);
    this.showNotification('Settings saved! Download the file and replace data/settings.json');
  }

  renderProducts() {
    const container = document.getElementById('products-admin');
    if (!container) return;

    container.innerHTML = this.products.map(product => `
      <div class="admin-item">
        <div class="admin-product-card">
          <div class="product-image">
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-details">
            <h4>${product.name}</h4>
            <p>${product.material} • ${product.color}</p>
            <div class="price">₹${product.price}</div>
            <div class="status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
              ${product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
          <div class="product-actions">
            <button class="btn small" onclick="adminManager.editProduct(${product.id})">Edit</button>
            <button class="btn small outline" onclick="adminManager.toggleStock(${product.id})">${product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}</button>
            <button class="btn small danger" onclick="adminManager.deleteProduct(${product.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderReviews() {
    const container = document.getElementById('reviews-admin');
    if (!container) return;

    container.innerHTML = this.reviews.map(review => `
      <div class="admin-item">
        <div class="admin-review-card">
          <div class="review-header">
            <div class="reviewer-name">${review.name}</div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
            <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
          </div>
          <div class="review-comment">${review.comment}</div>
          <div class="review-meta">
            Product ID: ${review.productId} • ${review.verified ? 'Verified' : 'Unverified'}
          </div>
          <div class="review-actions">
            <button class="btn small" onclick="adminManager.toggleVerified(${review.id})">${review.verified ? 'Mark Unverified' : 'Mark Verified'}</button>
            <button class="btn small danger" onclick="adminManager.deleteReview(${review.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  showAddProductForm() {
    const modal = this.createModal('Add New Product', `
      <form id="add-product-modal-form">
        <div class="grid-2">
          <label>Name <input name="name" required></label>
          <label>Price (₹) <input name="price" type="number" required></label>
        </div>
        <div class="grid-2">
          <label>Original Price (₹) <input name="originalPrice" type="number"></label>
          <label>Material <input name="material" required></label>
        </div>
        <div class="grid-2">
          <label>Color <input name="color" required></label>
          <label>Size <input name="size" required></label>
        </div>
        <label>Description <textarea name="description" rows="3"></textarea></label>
        <label>Image URL 1 <input name="image1" type="url" required></label>
        <label>Image URL 2 <input name="image2" type="url"></label>
        <div class="grid-3">
          <label>Category <input name="category"></label>
          <label class="checkbox"><input name="inStock" type="checkbox" checked> In Stock</label>
          <label class="checkbox"><input name="featured" type="checkbox"> Featured</label>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn outline" onclick="adminManager.closeModal()">Cancel</button>
          <button type="submit" class="btn primary">Add Product</button>
        </div>
      </form>
    `);

    document.getElementById('add-product-modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addProductFromModal(e.target);
    });
  }

  addProductFromModal(form) {
    const formData = new FormData(form);
    const newProduct = {
      id: Math.max(...this.products.map(p => p.id), 0) + 1,
      name: formData.get('name'),
      price: parseInt(formData.get('price')),
      originalPrice: parseInt(formData.get('originalPrice')) || parseInt(formData.get('price')),
      material: formData.get('material'),
      color: formData.get('color'),
      size: formData.get('size'),
      description: formData.get('description'),
      images: [formData.get('image1'), formData.get('image2')].filter(img => img),
      inStock: formData.has('inStock'),
      featured: formData.has('featured'),
      category: formData.get('category') || 'general'
    };

    this.products.push(newProduct);
    this.renderProducts();
    this.closeModal();
    this.showNotification('Product added successfully!');
  }

  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;

    const modal = this.createModal('Edit Product', `
      <form id="edit-product-modal-form">
        <input type="hidden" name="id" value="${product.id}">
        <div class="grid-2">
          <label>Name <input name="name" value="${product.name}" required></label>
          <label>Price (₹) <input name="price" type="number" value="${product.price}" required></label>
        </div>
        <div class="grid-2">
          <label>Original Price (₹) <input name="originalPrice" type="number" value="${product.originalPrice}"></label>
          <label>Material <input name="material" value="${product.material}" required></label>
        </div>
        <div class="grid-2">
          <label>Color <input name="color" value="${product.color}" required></label>
          <label>Size <input name="size" value="${product.size}" required></label>
        </div>
        <label>Description <textarea name="description" rows="3">${product.description}</textarea></label>
        <label>Image URL 1 <input name="image1" type="url" value="${product.images[0]}" required></label>
        <label>Image URL 2 <input name="image2" type="url" value="${product.images[1] || ''}"></label>
        <div class="grid-3">
          <label>Category <input name="category" value="${product.category}"></label>
          <label class="checkbox"><input name="inStock" type="checkbox" ${product.inStock ? 'checked' : ''}> In Stock</label>
          <label class="checkbox"><input name="featured" type="checkbox" ${product.featured ? 'checked' : ''}> Featured</label>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn outline" onclick="adminManager.closeModal()">Cancel</button>
          <button type="submit" class="btn primary">Save Changes</button>
        </div>
      </form>
    `);

    document.getElementById('edit-product-modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateProductFromModal(e.target);
    });
  }

  updateProductFromModal(form) {
    const formData = new FormData(form);
    const productId = parseInt(formData.get('id'));
    const productIndex = this.products.findIndex(p => p.id === productId);

    if (productIndex !== -1) {
      this.products[productIndex] = {
        ...this.products[productIndex],
        name: formData.get('name'),
        price: parseInt(formData.get('price')),
        originalPrice: parseInt(formData.get('originalPrice')) || parseInt(formData.get('price')),
        material: formData.get('material'),
        color: formData.get('color'),
        size: formData.get('size'),
        description: formData.get('description'),
        images: [formData.get('image1'), formData.get('image2')].filter(img => img),
        inStock: formData.has('inStock'),
        featured: formData.has('featured'),
        category: formData.get('category') || 'general'
      };

      this.renderProducts();
      this.closeModal();
      this.showNotification('Product updated successfully!');
    }
  }

  toggleStock(id) {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      this.products[productIndex].inStock = !this.products[productIndex].inStock;
      this.renderProducts();
      this.showNotification(`Product ${this.products[productIndex].inStock ? 'marked as in stock' : 'marked as out of stock'}`);
    }
  }

  deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== id);
      this.renderProducts();
      this.showNotification('Product deleted successfully!');
    }
  }

  toggleVerified(id) {
    const reviewIndex = this.reviews.findIndex(r => r.id === id);
    if (reviewIndex !== -1) {
      this.reviews[reviewIndex].verified = !this.reviews[reviewIndex].verified;
      this.renderReviews();
      this.showNotification(`Review ${this.reviews[reviewIndex].verified ? 'marked as verified' : 'marked as unverified'}`);
    }
  }

  showAddReviewForm() {
    const modal = this.createModal('Add New Review', `
      <form id="add-review-modal-form">
        <div class="grid-2">
          <label>Name <input name="name" required></label>
          <label>Product ID <input name="productId" type="number" required></label>
        </div>
        <div class="grid-2">
          <label>Rating <select name="rating" required>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select></label>
          <label class="checkbox"><input name="verified" type="checkbox" checked> Verified Purchase</label>
        </div>
        <label>Comment <textarea name="comment" rows="3" required></textarea></label>
        <div class="modal-actions">
          <button type="button" class="btn outline" onclick="adminManager.closeModal()">Cancel</button>
          <button type="submit" class="btn primary">Add Review</button>
        </div>
      </form>
    `);

    document.getElementById('add-review-modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addReviewFromModal(e.target);
    });
  }

  addReviewFromModal(form) {
    const formData = new FormData(form);
    const newReview = {
      id: Math.max(...this.reviews.map(r => r.id), 0) + 1,
      name: formData.get('name'),
      rating: parseInt(formData.get('rating')),
      comment: formData.get('comment'),
      date: new Date().toISOString().split('T')[0],
      verified: formData.has('verified'),
      productId: parseInt(formData.get('productId'))
    };

    this.reviews.push(newReview);
    this.renderReviews();
    this.closeModal();
    this.showNotification('Review added successfully!');
  }

  deleteReview(id) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviews = this.reviews.filter(r => r.id !== id);
      this.renderReviews();
      this.showNotification('Review deleted successfully!');
    }
  }

  downloadReviews() {
    this.downloadJSON('reviews.json', this.reviews);
  }

  downloadJSON(filename, data) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = filename;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button type="button" class="modal-close" onclick="adminManager.closeModal()">×</button>
        </div>
        <div class="modal-content">
          ${content}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
  }

  closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      modal.remove();
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminManager = new AdminManager();
});