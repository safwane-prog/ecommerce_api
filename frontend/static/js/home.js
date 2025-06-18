document.addEventListener('DOMContentLoaded', () => {
  // Store wishlist and cart in memory
  let wishlist = [];
  let reviewsData = [];
  let currentReviewIndex = 0;
  let isAnimating = false;
  let isLoading = false;
  let isLoggedIn = false;

  // Create and configure loader element
  const loader = createLoader();
  document.body.appendChild(loader);

  // Create modals
  createAuthModal();

  // Add necessary styles
  addStyles();

  // Check login status on page load
  checkLoginStatus();

  // Utility Functions
  function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      border: 4px solid #f3f3f3; border-top: 4px solid #ef4444; 
      border-radius: 50%; width: 40px; height: 40px; 
      animation: spin 1s linear infinite; display: none; z-index: 9999;
      background: rgba(255, 255, 255, 0.9);
    `;
    return loader;
  }

  function createAuthModal() {
    const modalHTML = `
      <div class="modal" id="authModal" style="display: none;">
        <div class="modal-content">
          <button class="modal-close" onclick="closeAuthModal()" aria-label="Close modal"><i class="fa-solid fa-times"></i></button>
          <h3>Login Required</h3>
          <p>You must be logged in to add products to the cart or wishlist.</p>
          <div class="modal-actions">
            <a href="/login" class="login-btn">Log In</a>
            <a href="/register" class="register-btn">Create Account</a>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes cartPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      body {
        font-family: 'Tajawal', Arial, sans-serif;
      }
      .review-container {
        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .review {
        opacity: 0;
        transform: translateX(20px); /* Adjusted for LTR */
        transition: opacity 0.4s ease, transform 0.4s ease;
      }
      .review.show {
        opacity: 1;
        transform: translateX(0);
      }
      .notification {
        position: fixed; 
        top: 20px; 
        right: 20px; /* Adjusted for LTR */
        padding: 15px 20px;
        border-radius: 8px; 
        z-index: 10000;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
      }
      .notification.success {
        background: linear-gradient(135deg, #28a745, #20c997);
        color: white;
      }
      .notification.error {
        background: linear-gradient(135deg, #dc3545, #e74c3c);
        color: white;
      }
      .error {
        color: #dc3545;
        text-align: center;
        padding: 20px;
        font-style: italic;
      }
      .category-item {
        transition: transform 0.3s ease;
      }
      .category-item:hover {
        transform: scale(1.05);
      }
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      .modal.show {
        opacity: 1;
        visibility: visible;
      }
      .modal-content {
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 400px;
        width: 90%;
        position: relative;
        transform: scale(0.8);
        transition: transform 0.3s ease;
      }
      .modal.show .modal-content {
        transform: scale(1);
      }
      .modal-close {
        position: absolute;
        top: 15px;
        right: 15px; /* Adjusted for LTR */
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
        transition: color 0.3s ease;
      }
      .modal-close:hover {
        color: #333;
      }
      .modal h3 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 24px;
      }
      .modal p {
        color: #666;
        margin: 0 0 25px 0;
        line-height: 1.5;
      }
      .modal-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
      }
      .login-btn, .register-btn {
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
        display: inline-block;
      }
      .login-btn {
        background: #007bff;
        color: white;
      }
      .login-btn:hover {
        background: #0056b3;
        transform: translateY(-2px);
      }
      .register-btn {
        background: #28a745;
        color: white;
      }
      .register-btn:hover {
        background: #1e7e34;
        transform: translateY(-2px);
      }
      @media (max-width: 768px) {
        .product-card {
          max-width: 100%;
          margin: 10px;
        }
        .product-image {
          height: 180px;
        }
        .product-title {
          font-size: 16px;
        }
        .product-description {
          font-size: 13px;
        }
        .add-to-cart-btn,
        .product-info-btn {
          padding: 8px 12px;
          font-size: 13px;
        }
      }
      @media (max-width: 480px) {
        .product-card {
          margin: 8px;
        }
        .product-image {
          height: 150px;
        }
        .product-title {
          font-size: 14px;
        }
        .product-description {
          font-size: 12px;
        }
        .current-price,
        .old-price {
          font-size: 14px;
        }
        .current-container {
          font-size: 12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  async function checkLoginStatus() {
    try {
      const response = await fetch("/api/users/status/", {
        method: "GET",
        credentials: "include"
      });
      isLoggedIn = response.ok;
      return isLoggedIn;
    } catch (error) {
      console.error("Error checking login status:", error);
      isLoggedIn = false;
      return false;
    }
  }

  function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('show'), 10);
    }
  }

  window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.style.display = 'none', 300);
    }
  };

  document.addEventListener('click', (e) => {
    const authModal = document.getElementById('authModal');
    if (e.target === authModal) closeAuthModal();
  });

  function showLoader() {
    if (!isLoading) {
      isLoading = true;
      loader.style.display = 'block';
    }
  }

  function hideLoader() {
    isLoading = false;
    loader.style.display = 'none';
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  window.viewDetails = function(productId) {
    if (productId) {
      window.location.href = `/product-detail.html?id=${productId}`;
    }
  };

  window.toggleWishlist = debounce(async function(product_id) {
    const loggedIn = await checkLoginStatus();
    
    if (!loggedIn) {
      showAuthModal();
      return;
    }

    const button = document.querySelector(`.wishlist-btn[data-product-id="${product_id}"]`);
    if (!button) return;

    const svg = button.querySelector('svg path');
    const index = wishlist.indexOf(product_id);
    const isAdding = index === -1;

    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 150);

    svg.setAttribute('fill', isAdding ? '#ff0000' : 'none');
    svg.setAttribute('stroke', isAdding ? '#ff0000' : '#000000');
    
    if (isAdding) {
      wishlist.push(product_id);
      showNotification('Added to wishlist!', 'success');
    } else {
      wishlist.splice(index, 1);
      showNotification('Removed from wishlist!', 'success');
    }
    
    syncWishlistWithServer(product_id, isAdding);
  }, 300);

  function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn').forEach(button => {
      const productId = parseInt(button.getAttribute('data-product-id'));
      const isWishlisted = wishlist.includes(productId);
      const svg = button.querySelector('svg path');
      
      if (svg) {
        svg.setAttribute('fill', isWishlisted ? '#ff0000' : 'none');
        svg.setAttribute('stroke', isWishlisted ? '#ff0000' : '#000000');
      }
    });
  }

  async function syncWishlistWithServer(product_id, add) {
    const url = add ? '/api/add-to-wishlist/' : `/api/wishlist/delete/${product_id}/`;
    const method = add ? 'POST' : 'DELETE';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include',
        body: add ? JSON.stringify({ product_id }) : null
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Wishlist sync successful:', data);
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      showNotification('Failed to update wishlist. Please try again.', 'error');
      const index = wishlist.indexOf(product_id);
      if (add && index !== -1) {
        wishlist.splice(index, 1);
      } else if (!add && index === -1) {
        wishlist.push(product_id);
      }
      updateWishlistButtons();
    }
  }

  function showNotification(message, type) {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'; /* Adjusted for LTR */
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function getCookie(name) {
    if (!document.cookie) return null;
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  function createProductCard(element, isNewArrival = false) {
    const discountBadge = element.discount ? 
      `<div class="discount-badge">-${element.discount}%</div>` : '';
    const oldPrice = element.old_price ? 
      `<span class="old-price">$${element.old_price}</span>` : '';
    const description = (element.description || element.title || '--------')
      .substring(0, isNewArrival ? 40 : 20) + '...';
    const size = element.size?.size || '--';
    const category = element.Category?.name || '--';
    const imageUrl = element.image_1 || '/media/default-product-image.jpg';

    return `
      <div class="product-card">
        <div class="product-image">
          <img onclick="viewDetails(${element.id})" 
               src="${imageUrl}" 
               alt="${element.title || 'Product'}"
               style="cursor: pointer;"
               loading="lazy"
               onerror="this.src='/media/default-product-image.jpg'; this.alt='Image not available'">
          ${discountBadge}
          <button class="wishlist-btn" 
                  data-product-id="${element.id}" 
                  onclick="toggleWishlist(${element.id}); event.stopPropagation()"
                  aria-label="Add to wishlist">
            <svg viewBox="0 0 24 24" id="wishlist-svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                    >
            </svg>
          </button>
        </div>
        <div class="product-details">
          <h3 class="product-title">${element.title || 'Untitled Product'}</h3>
          <p class="product-description">${description}</p>
          <div class="price-container">
            <span class="current-price">$${element.price || '0.00'}</span>
            ${oldPrice}
          </div>
          <div class="current-container">
            <span class="current-size">Size: <span>${size}</span></span> | 
            <span class="current-category">Category: <span>${category}</span></span>
          </div>
          <div class="addtocart">
            <button title="Add to Cart" 
                    onclick="addToCart(${element.id})" 
                    class="add-to-cart-btn addToCart${element.id}" 
                    data-product-id="${element.id}"
                    aria-label="Add product to cart">
              Add to Cart <i class="fa-solid fa-cart-shopping"></i>
            </button>
            <button title="View Details" 
                    class="product-info-btn" 
                    data-product-id="${element.id}" 
                    onclick="viewDetails(${element.id})"
                    aria-label="View product details">
              <i class="fa-solid fa-info-circle"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  window.addToCart = async function(productId) {
    console.log('addToCart called with productId:', productId);
    if (!isLoggedIn) {
      console.log('User not logged in, showing login modal');
      showAuthModal();
      return;
    }

    const addButton = document.querySelector(`.addToCart${productId}`);
    console.log('Add button:', addButton);
    if (!addButton) {
      console.error('Button not found for productId:', productId);
      return;
    }
    if (addButton.disabled) {
      console.log('Button is disabled, exiting');
      return;
    }

    try {
      addButton.disabled = true;
      addButton.setAttribute('aria-disabled', 'true');
      console.log('Sending request to /api/add-to-cart/');
      const response = await fetch('/api/add-to-cart/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      });

      const data = await response.json();
      console.log('API response:', data);
      if (response.ok) {
        addButton.style.background = '#10b981';
        addButton.innerHTML = `Added <i class="fa-solid fa-check"></i>`;
        addButton.style.cursor = 'not-allowed';
        addButton.setAttribute('title', 'Product added');
        addButton.setAttribute('aria-label', 'Product added to cart');
        showNotification('Product added to cart successfully!', 'success');
        updateCartCounter();
      } else {
        throw new Error(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      showNotification('Failed to add product to cart', 'error');
      addButton.disabled = false;
      addButton.setAttribute('aria-disabled', 'false');
    }
  };

  function updateCartCounter() {
    // Implement cart counter update logic if needed
  }

  async function fetchBestSellers() {
    try {
      showLoader();
      const response = await fetch('/api/best-sellers/');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      const productSelling = document.querySelector('.product_selling');
      
      if (!productSelling) {
        console.warn('Best sellers container not found');
        return;
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        productSelling.innerHTML = '<p class="error">No best-selling products available</p>';
        return;
      }
      
      const randomProducts = shuffleArray(data).slice(0, 4);
      productSelling.innerHTML = randomProducts.map(product => 
        createProductCard(product, false)
      ).join('');
      
      updateWishlistButtons();
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      showNotification('Failed to load best sellers', 'error');
      const container = document.querySelector('.product_selling');
      if (container) {
        container.innerHTML = '<p class="error">Failed to load best sellers</p>';
      }
    } finally {
      hideLoader();
    }
  }

  async function fetchNewArrivals() {
    try {
      showLoader();
      const response = await fetch('/api/products/');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      const productArrivals = document.querySelector('.product_ARRIVALs');
      
      if (!productArrivals) {
        console.warn('New arrivals container not found');
        return;
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        productArrivals.innerHTML = '<p class="error">No new products available</p>';
        return;
      }
      
      const randomProducts = shuffleArray(data).slice(0, 4);
      productArrivals.innerHTML = randomProducts.map(product => 
        createProductCard(product, true)
      ).join('');
      
      updateWishlistButtons();
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      showNotification('Failed to load new arrivals', 'error');
      const container = document.querySelector('.product_ARRIVALs');
      if (container) {
        container.innerHTML = '<p class="error">Failed to load new arrivals</p>';
      }
    } finally {
      hideLoader();
    }
  }

  function showReviews(startIndex, direction = 'next') {
    if (isAnimating || !reviewsData.length) return;

    const allReview = document.querySelector('.all_Review');
    if (!allReview) return;

    isAnimating = true;
    startIndex = Math.max(0, Math.min(startIndex, reviewsData.length - 1));
    currentReviewIndex = startIndex;

    const reviewsToShow = reviewsData.slice(startIndex, startIndex + 3);
    const newContainer = document.createElement('div');
    newContainer.className = 'review-container';
    newContainer.style.transform = direction === 'next' ? 'translateX(100%)' : 'translateX(-100%)'; /* Adjusted for LTR */

    const reviewsHTML = reviewsToShow.map(review => `
      <div class="review" style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px; background: #fafafa; text-align: left;">
        <div class="user_Review" style="font-weight: bold; margin-bottom: 8px; color: #333;">
          ${review.user || 'Anonymous User'}
          <span class="span✔" style="color: #28a745; margin-left: 5px;">✔</span> 
        </div>
        <div class="start_Review" style="margin-bottom: 8px; color: #ffc107;">
          ${'★'.repeat(Math.min(review.rating || 5, 5))}${'☆'.repeat(Math.max(0, 5 - (review.rating || 5)))}
        </div>
        <p class="desctiption_Review" style="margin-bottom: 10px; color: #666; line-height: 1.6;">
          ${review.comment || 'No comments available'}
        </p>
        <div class="time_Review" style="font-size: 12px; color: #999;">
          ${review.created_at || 'Date not specified'}
        </div>
      </div>
    `).join('');

    newContainer.innerHTML = reviewsHTML;
    allReview.innerHTML = '';
    allReview.appendChild(newContainer);

    requestAnimationFrame(() => {
      newContainer.style.transform = 'translateX(0)';
      newContainer.querySelectorAll('.review').forEach((review, index) => {
        setTimeout(() => review.classList.add('show'), index * 100);
      });
      
      setTimeout(() => {
        isAnimating = false;
        updateNavigationButtons();
      }, 500);
    });
  }

  function updateNavigationButtons() {
    const prevBtn = document.querySelector('.buttons_Review div:first-child');
    const nextBtn = document.querySelector('.buttons_Review div:last-child');
    
    if (prevBtn) {
      const canGoPrev = currentReviewIndex > 0;
      prevBtn.style.opacity = canGoPrev ? '1' : '0.5';
      prevBtn.style.cursor = canGoPrev ? 'pointer' : 'not-allowed';
      prevBtn.style.pointerEvents = canGoPrev ? 'auto' : 'none';
    }
    
    if (nextBtn) {
      const canGoNext = currentReviewIndex + 3 < reviewsData.length;
      nextBtn.style.opacity = canGoNext ? '1' : '0.5';
      nextBtn.style.cursor = canGoNext ? 'pointer' : 'not-allowed';
      nextBtn.style.pointerEvents = canGoNext ? 'auto' : 'none';
    }
  }

  const nextReview = debounce(() => {
    if (currentReviewIndex + 3 < reviewsData.length && !isAnimating) {
      showReviews(currentReviewIndex + 1, 'next');
    }
  }, 300);

  const prevReview = debounce(() => {
    if (currentReviewIndex > 0 && !isAnimating) {
      showReviews(currentReviewIndex - 1, 'prev');
    }
  }, 300);

  async function fetchReviews() {
    try {
      showLoader();
      const response = await fetch('/api/get_site-reviews/');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      reviewsData = await response.json();
      
      const allReviewContainer = document.querySelector('.all_Review');
      if (!allReviewContainer) {
        console.warn('Reviews container not found');
        return;
      }
      
      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        showReviews(0);
        
        const prevBtn = document.querySelector('.buttons_Review div:first-child');
        const nextBtn = document.querySelector('.buttons_Review div:last-child');
        
        if (prevBtn) {
          prevBtn.addEventListener('click', prevReview);
          prevBtn.style.transition = 'all 0.3s ease';
          prevBtn.setAttribute('aria-label', 'Previous review');
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', nextReview);
          nextBtn.style.transition = 'all 0.3s ease';
          nextBtn.setAttribute('aria-label', 'Next review');
        }
      } else {
        allReviewContainer.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #666;">
            <div style="font-size: 48px; margin-bottom: 15px;">💬</div>
            <p>No reviews available at the moment</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showNotification('Failed to load reviews', 'error');
      const allReviewContainer = document.querySelector('.all_Review');
      if (allReviewContainer) {
        allReviewContainer.innerHTML = `
          <div class="error" style="text-align: center; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
            <p>Failed to load reviews. Please try again later.</p>
          </div>
        `;
      }
    } finally {
      hideLoader();
    }
  }

  async function fetchCategories() {
    try {
      showLoader();
      const response = await fetch('/api/get_categories/');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid categories data format');
      }
      
      const selectors = ['.img_1', '.img_2', '.img_3', '.img_4'];
      selectors.forEach((selector, index) => {
        updateCategoryDisplay(selector, data[index]);
      });
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      showNotification('Failed to load categories', 'error');
      showCategoryErrors();
    } finally {
      hideLoader();
    }
  }

  function updateCategoryDisplay(selector, category) {
    const container = document.querySelector(selector);
    if (!container) return;
    
    if (!category) {
      container.innerHTML = '<p class="error">Category not available</p>';
      return;
    }

    const imageUrl = category.image || '/media/default-category-image.jpg';
    const categoryName = category.name || 'Unnamed Category';
    
    container.innerHTML = `
      <div class="category-item">
        <a href="/products/?category=${category.id}" style="text-decoration: none;">
          <img class="img__omgae" 
               src="${imageUrl}" 
               alt="${categoryName}" 
               loading="lazy"
               style="width: 100%; height: auto; border-radius: 8px;"
               onerror="this.src='/media/default-category-image.jpg'; this.alt='Image not available'">
          <h1 class="img__title" style="margin-top: 10px;">${categoryName}</h1>
        </a>
      </div>
    `;
  }

  function showCategoryErrors() {
    const containers = ['.img_1', '.img_2', '.img_3', '.img_4'];
    containers.forEach(selector => {
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = '<p class="error">Failed to load category</p>';
      }
    });
  }

  async function initializeApp() {
    try {
      await Promise.allSettled([
        fetchBestSellers(),
        fetchNewArrivals(),
        fetchReviews(),
        fetchCategories()
      ]);
    } catch (error) {
      console.error('Error during app initialization:', error);
      showNotification('Failed to load some content', 'error');
    }
  }

  initializeApp();
});
