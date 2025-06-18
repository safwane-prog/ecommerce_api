/**
 * Show loader for specific element
 */
function showLoader(element, display = 'block') {
    if (element) {
        element.style.display = display;
    }
}

/**
 * Hide loader for specific element
 */
function hideLoader(element) {
    if (element) {
        element.style.display = 'none';
    }
}

/**
 * Show authentication modal with custom message
 */
function showAuthModal(message = 'Please sign in to continue.') {
    const authModal = document.getElementById('authModal');
    const messageElement = document.getElementById('authModalMessage');
    if (authModal) {
        if (messageElement) {
            messageElement.textContent = message;
        }
        authModal.style.display = 'block';
    }
}

/**
 * Show quantity limit modal
 */
function showQuantityLimitModal(message = 'Maximum or minimum quantity reached.') {
    const limitModal = document.getElementById('quantityLimitModal');
    const messageElement = document.getElementById('quantityLimitMessage');
    if (limitModal) {
        if (messageElement) {
            messageElement.textContent = message;
        }
        limitModal.style.display = 'block';
    }
}

/**
 * Close authentication modal
 */
function closeAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
        authModal.style.display = 'none';
    }
}

/**
 * Close quantity limit modal
 */
function closeQuantityLimitModal() {
    const limitModal = document.getElementById('quantityLimitModal');
    if (limitModal) {
        limitModal.style.display = 'none';
    }
}

/**
 * Get CSRF token
 */
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

/**
 * Check login status
 */
async function checkLoginStatus() {
    try {
        const response = await fetch("/api/users/status/", {
            method: "GET",
            credentials: "include"
        });
        return response.ok;
    } catch (error) {
        console.error("Error checking login status:", error);
        return false;
    }
}

/**
 * Update cart quantity via API
 */
async function handleQuantityUpdate(productId, newQuantity, quantityElement, loaderElement) {
    const quantityControls = quantityElement.closest('.quantity-controls');
    const minusBtn = quantityControls.querySelector('.minus-btn');
    const plusBtn = quantityControls.querySelector('.plus-btn');

    quantityElement.style.opacity = '0';
    showLoader(loaderElement);
    minusBtn.disabled = true;
    plusBtn.disabled = true;

    try {
        const checkResponse = await fetch(`/api/check/${productId}/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!checkResponse.ok) {
            throw new Error('Failed to verify cart status');
        }

        const checkData = await checkResponse.json();
        if (!checkData.in_cart) {
            console.log('Product not in cart, cannot update quantity.');
            return;
        }

        const response = await fetch(`/api/cart/update/${productId}/`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update quantity');
        }

        const data = await response.json();
        quantityElement.textContent = newQuantity;
        console.log(`Quantity updated to ${newQuantity} for product ${productId}`);
    } catch (error) {
        console.error('Error updating quantity:', error.message);
        showAuthModal('Please sign in to update the quantity.');
    } finally {
        quantityElement.style.opacity = '1';
        hideLoader(loaderElement);
        minusBtn.disabled = false;
        plusBtn.disabled = false;
    }
}

/**
 * Update cart counter
 */
async function updateCartCounter(cartCount = null) {
    const cartCounter = document.getElementById('cart-counter');
    if (!cartCounter) return;

    try {
        if (cartCount == null) {
            const response = await fetch('/api/cart/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart data');
            }

            const cartData = await response.json();
            const totalItems = cartData.reduce((total, item) => total + item.quantity, 0);
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'flex' : 'none';
        } else {
            cartCounter.textContent = cartCount;
            cartCounter.style.display = cartCount > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Error updating cart counter:', error.message);
        cartCounter.style.display = 'none';
    }
}

/**
 * Update wishlist counter
 */
async function updateWishlistCounter() {
    const wishlistCounter = document.getElementById('wishlist-counter');
    if (!wishlistCounter) return;

    try {
        const response = await fetch('/api/wishlist/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch wishlist data');
        }

        const wishlistData = await response.json();
        const totalItems = wishlistData.wishlist.length;
        wishlistCounter.textContent = totalItems;
        wishlistCounter.style.display = totalItems > 0 ? 'flex' : 'none';
    } catch (error) {
        console.error('Error updating wishlist counter:', error.message);
        wishlistCounter.style.display = 'none';
    }
}

/**
 * Add product to cart via API
 */
async function addToCart(productId, quantity = 1) {
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
        showAuthModal('Please sign in to add items to your cart.');
        return;
    }

    const addButton = document.getElementById('add-to-cart-btn');
    if (!addButton) {
        console.error('Add to cart button not found');
        return;
    }

    let loader = addButton.querySelector('.button-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.className = 'button-loader';
        loader.style.display = 'none';
        addButton.appendChild(loader);
    }

    const originalButtonHTML = addButton.innerHTML;
    const originalButtonBg = addButton.style.backgroundColor;
    const originalCursor = addButton.style.cursor;

    addButton.disabled = true;
    addButton.style.cursor = 'not-allowed';
    showLoader(loader);

    try {
        const response = await fetch('/api/add-to-cart/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include',
            body: JSON.stringify({
                product_id: productId,
                quantity: parseInt(quantity)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to add to cart');
        }

        addButton.innerHTML = 'In Cart <i class="fa-solid fa-check"></i>';
        addButton.style.backgroundColor = '#ffffff';
        addButton.style.border = '1px solid #000000';
        addButton.style.color = '#000000';
        addButton.style.cursor = 'pointer';
        addButton.onclick = () => { window.location.href = "/Cart/" };

        const quantityControls = document.querySelector('.quantity-controls');
        if (quantityControls) {
            quantityControls.style.display = 'none';
        }

        const viewCartBtn = document.getElementById('view-cart-btn') || createReturnButton();
        viewCartBtn.style.display = 'none';

        updateCartCounter(data.cart_count);
    } catch (error) {
        console.error('Error adding to cart:', error);
        addButton.innerHTML = originalButtonHTML;
        addButton.style.backgroundColor = originalButtonBg;
        addButton.style.border = '';
        addButton.style.color = '';
        const errorMessage = error.message.includes('already in cart') 
            ? 'Product is already in your cart'
            : 'Failed to add product to cart. Please try again.';
        showAuthModal(errorMessage);
    } finally {
        hideLoader(loader);
        addButton.disabled = false;
        addButton.style.cursor = originalCursor;
    }
}

/**
 * Add or remove product from wishlist via API
 */
async function addToWishlist(productId) {
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
        showAuthModal('Please sign in to manage your wishlist.');
        return;
    }

    const wishlistButton = document.querySelector(`.wishlist-btn[data-wishlist-id="${productId}"]`);
    if (!wishlistButton) {
        console.error(`Wishlist button for product ${productId} not found`);
        showAuthModal('Please sign in to manage your wishlist.');
        return;
    }

    const icon = wishlistButton.querySelector('i');
    if (!icon) {
        console.error('Wishlist icon not found');
        showAuthModal('Please sign in to manage your wishlist.');
        return;
    }

    const isActive = wishlistButton.classList.contains('active');
    const action = isActive ? 'remove' : 'add';

    icon.classList.remove('bi-heart', 'bi-heart-fill');
    icon.classList.add(isActive ? 'bi-heart' : 'bi-heart-fill');
    icon.style.color = isActive ? 'rgb(110, 110, 110)' : '#e74c3c';
    wishlistButton.classList.toggle('active', !isActive);
    wishlistButton.offsetHeight;

    const loader = document.createElement('div');
    loader.className = 'button-loader';
    loader.style.display = 'none';
    wishlistButton.appendChild(loader);
    showLoader(loader);

    wishlistButton.disabled = true;

    try {
        const response = await fetch(`/api/${action}-to-wishlist/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            credentials: 'include',
            body: JSON.stringify({ product_id: productId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to ${action} from wishlist`);
        }

        const data = await response.json();

        if (data.success || data.message.includes('successfully')) {
            wishlistButton.style.transition = 'all 0.3s ease';
            wishlistButton.style.opacity = '0.7';
            setTimeout(() => {
                wishlistButton.style.opacity = '1';
            }, 300);
            await updateWishlistCounter();
        }
    } catch (error) {
        console.error(`Error ${action}ing from wishlist:`, error.message);
        icon.classList.remove('bi-heart', 'bi-heart-fill');
        icon.classList.add(isActive ? 'bi-heart-fill' : 'bi-heart');
        icon.style.color = isActive ? '#e74c3c' : 'rgb(110, 110, 110)';
        wishlistButton.classList.toggle('active', isActive);
        showAuthModal('Please sign in to manage your wishlist.');
    } finally {
        hideLoader(loader);
        wishlistButton.disabled = false;
    }
}

/**
 * Update product display with fetched data
 */
function updateProductDisplay(data) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage && data.image_1) {
        mainImage.src = data.image_1;
        mainImage.alt = data.title;
        mainImage.style.display = 'block';
    } else if (mainImage) {
       mainImage.style.display = 'none';
    }

    const thumbnailImages = ['mainImage2', 'mainImage3', 'mainImage4', 'mainImage1_2'];
    const images = [data.image_2, data.image_3, data.image_4, data.image_1];
    images.forEach((imageSrc, index) => {
        const imgElement = document.getElementById(thumbnailImages[index]);
        if (imgElement && imageSrc) {
            imgElement.src = imageSrc;
            imgElement.alt = data.title;
            imgElement.style.display = 'block';
        } else if (imgElement) {
            imgElement.style.display = 'none';
        }
    });

    const titleElement = document.getElementById('product-title');
    if (titleElement) titleElement.textContent = data.title;

    const currentPriceElement = document.querySelector('#product-price .current-price');
    if (currentPriceElement) currentPriceElement.textContent = `${data.price} MAD`;

    const originalPriceElement = document.querySelector('#product-price .original-price');
    const discountElement = document.querySelector('#product-price .discount');
    if (data.old_price && originalPriceElement && discountElement) {
        originalPriceElement.textContent = `${data.old_price} MAD`;
        const discount = Math.round(((data.old_price - data.price) / data.old_price) * 100);
        discountElement.textContent = `-${discount}%`;
        originalPriceElement.style.display = 'inline';
        discountElement.style.display = 'inline';
    } else {
        if (originalPriceElement) originalPriceElement.style.display = 'none';
        if (discountElement) discountElement.style.display = 'none';
    }

    const descriptionElement = document.getElementById('product-description');
    if (descriptionElement) descriptionElement.textContent = data.description;

    const colorOptions = document.getElementById('color-options');
    if (colorOptions && data.color) {
        colorOptions.innerHTML = `<div class="color-option active" style="background-color: ${data.color.color};"></div>`;
    }

    const sizeOptions = document.getElementById('size-options');
    if (sizeOptions && data.size) {
        sizeOptions.innerHTML = `<div class="size-option">${data.size.size}</div>`;
    }
}

/**
 * Fetch and display product reviews with pagination and rating summary
 */
async function fetchProductReviews(productId, productTitle) {
    const reviewsContainer = document.getElementById('reviews-container');
    const reviewCount = document.getElementById('review-count');
    const paginationContainer = document.getElementById('reviews-pagination');
    const ratingElement = document.getElementById('product-rating');
    const ratingSummary = document.getElementById('rating-summary');
    const loader = document.createElement('div');
    loader.className = 'reviews-loader';
    loader.style.display = 'none';
    reviewsContainer?.parentElement.appendChild(loader);

    showLoader(loader);

    try {
        const response = await fetch('/api/get_all_reviews/', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }

        const reviews = await response.json();
        const filteredReviews = reviews.filter(review => 
            review.product.toLowerCase() === productTitle.toLowerCase()
        );

        if (reviewCount) {
            reviewCount.textContent = filteredReviews.length || 0;
        }

        // Calculate rating summary
        if (ratingElement && ratingSummary) {
            if (filteredReviews.length > 0) {
                const ratings = filteredReviews.map(r => r.rating || 5);
                const averageRating = Math.round(
                    ratings.reduce((sum, r) => sum + r, 0) / ratings.length * 10
                ) / 10;
                const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                
                ratings.forEach(rating => {
                    ratingCounts[Math.min(Math.round(rating), 5)]++;
                });

                const totalReviews = filteredReviews.length;
                ratingElement.innerHTML = `
                    <div class="stars">${'★'.repeat(Math.round(averageRating))}${'☆'.repeat(5 - Math.round(averageRating))}</div>
                    <span>${averageRating}/5 (${totalReviews} reviews)</span>
                `;
                
                ratingSummary.innerHTML = `
                    <div class="rating-summary">
                        ${Object.entries(ratingCounts).reverse().map(([stars, count]) => `
                            <div class="rating-bar">
                                <span>${stars}★</span>
                                <div class="bar-container">
                                    <div class="bar" style="width: ${(count / totalReviews * 100) || 0}%"></div>
                                </div>
                                <span>${count}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                ratingElement.innerHTML = `
                    <div class="stars">${'☆'.repeat(5)}</div>
                    <span>No ratings yet</span>
                `;
                ratingSummary.innerHTML = '<p>No ratings available</p>';
            }
       (delete this)
        }

        const reviewsPerPage = 3;
        let currentPage = 1;
        const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

        function renderReviews(page) {
            const start = (page - 1) * reviewsPerPage;
            const end = start + reviewsPerPage;
            const pageReviews = filteredReviews.slice(start, end);

            if (reviewsContainer) {
                reviewsContainer.classList.add('slide-out');
                setTimeout(() => {
                    reviewsContainer.innerHTML = pageReviews.length > 0 ? pageReviews.map(review => `
                        <div class="review slide-in">
                            <div class="review-header">
                                <div class="reviewer-name">${review.user || 'Anonymous'} <span class="verified">✓</span></div>
                                <div class="review-date">${new Date(review.created_at).toLocaleDateString() || 'Date not available'}</div>
                            </div>
                            <div class="stars">${'★'.repeat(Math.min(review.rating || 5, 5))}${'☆'.repeat(5 - Math.min(review.rating || 5, 5))}</div>
                            <p class="review-text">${review.comment || 'No comment'}</p>
                        </div>
                    `).join('') : '<p>No reviews available for this product.</p>';
                    reviewsContainer.classList.remove('slide-out');
                    reviewsContainer.classList.add('slide-in');
                    setTimeout(() => reviewsContainer.classList.remove('slide-in'), 300);
                }, 300);
            }

            if (paginationContainer) {
                paginationContainer.innerHTML = '';
                const prevButton = document.createElement('button');
                prevButton.className = 'pagination-btn';
                prevButton.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
                prevButton.disabled = currentPage === 1;
                prevButton.addEventListener('click', () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderReviews(currentPage);
                        updatePaginationButtons();
                    }
                });
                paginationContainer.appendChild(prevButton);

                for (let i = 1; i <= totalPages; i++) {
                    const pageButton = document.createElement('button');
                    pageButton.className = 'pagination-btn';
                    pageButton.textContent = i;
                    pageButton.classList.toggle('active', i === currentPage);
                    pageButton.addEventListener('click', () => {
                        currentPage = i;
                        renderReviews(currentPage);
                        updatePaginationButtons();
                    });
                    paginationContainer.appendChild(pageButton);
                }

                const nextButton = document.createElement('button');
                nextButton.className = 'pagination-btn';
                nextButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
                nextButton.disabled = currentPage === totalPages;
                nextButton.addEventListener('click', () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderReviews(currentPage);
                        updatePaginationButtons();
                    }
                });
                paginationContainer.appendChild(nextButton);
            }
        }

        function updatePaginationButtons() {
            const buttons = paginationContainer.querySelectorAll('button');
            buttons.forEach((button, index) => {
                if (button.innerHTML.includes('chevron-left')) {
                    button.disabled = currentPage === 1;
                } else if (button.innerHTML.includes('chevron-right')) {
                    button.disabled = currentPage === totalPages;
                } else {
                    button.classList.toggle('active', parseInt(button.textContent) === currentPage);
                }
            });
        }

        if (filteredReviews.length > 0) {
            renderReviews(currentPage);
        } else {
            if (reviewsContainer) {
                reviewsContainer.innerHTML = '<p>No reviews available for this product.</p>';
            }
            if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
        }
    } catch (error) {
        console.error('Error fetching reviews:', error.message);
        if (reviewsContainer) reviewsContainer.innerHTML = '<p>Unable to load reviews.</p>';
        if (paginationContainer) paginationContainer.innerHTML = '';
    } finally {
        hideLoader(loader);
    }
}

/**
 * Fetch and display related products randomly
 */
async function formRelatedProducts(currentId, productCategory) {
    const productsContainer = document.getElementById('related-products');
    if (!productsContainer) return;

    const loader = document.createElement('div');
    loader.className = 'products-loader';
    loader.style.display = 'none';
    productsContainer.appendChild(loader);

    showLoader(loader);

    try {
        const response = await fetch('/api/products/', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const productsData = await response.json();
        const relatedProducts = productsData.filter(product => 
            product.id !== currentId && 
            (!productCategory || product.category === productCategory)
        );

        for (let i = relatedProducts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [relatedProducts[i], relatedProducts[j]] = [relatedProducts[j], relatedProducts[i]];
        }

        productsContainer.innerHTML = '';
        if (relatedProducts.length === 0) {
            productsContainer.innerHTML = '<p>No related products found.</p>';
            return;
        }

        relatedProducts.slice(0, 4).forEach(product => {
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error fetching related products:', error.message);
        productsContainer.innerHTML = '<p>Unable to load related products.</p>';
    } finally {
        hideLoader(loader);
    }
}

/**
 * Create product card HTML
 */
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';

    const shortDescription = (product.description && product.description.length > 40)
        ? product.description.substring(0, 40) + '...'
        : (product.description || 'Description not available');

    productCard.innerHTML = `
        <div class="product-image-container">
            <img onclick="viewDetails(${product.id})"
                 src="${product.image_1 || ''}"
                 alt="${product.title || 'Product'}"
                 class="product-image"
                 style="cursor: pointer; ${product.image_1 ? '' : 'display: none;'}">
            ${product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
            <button class="wishlist-btn" data-wishlist-id="${product.id}" title="Add to Wishlist" aria-label="Add to wishlist">
                <i class="bi bi-heart" aria-hidden="true"></i>
            </button>
        </div>
        <div class="product-details">
            <h3 class="product-title" onclick="viewDetails(${product.id})" style="cursor: pointer;">${product.title || 'Title not available'}</h3>
            <div class="product-rating">
                ${'★'.repeat(Math.min(product.rating || 5, 5))}${'☆'.repeat(5 - Math.min(product.rating || 5, 5))}
            </div>
            <p class="product-description">${shortDescription}</p>
            <div class="price-container">
                <span class="current-price">${product.price || '0'} MAD</span>
                ${product.old_price ? `<span class="old-price">${product.old_price} MAD</span>` : ''}
            </div>
        </div>
    `;
    return productCard;
}

/**
 * Navigate to product detail page
 */
window.viewDetails = function(productId) {
    if (productId) {
        window.location.href = `/product-detail.html?id=${productId}`;
    }
};

/**
 * Setup thumbnail listeners
 */
function setupThumbnailListeners() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');

    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener('click', function() {
            thumbnails.forEach((thumb) => thumb.classList.remove('active'));
            this.classList.add('active');
            const thumbnailImg = this.querySelector('img');
            if (thumbnailImg && mainImage) {
                mainImage.src = thumbnailImg.src;
                mainImage.alt = thumbnailImg.alt;
            }
        });
    });
}

/**
 * Fetch current cart quantity for a product
 */
async function fetchCartQuantity(productId, quantityElement, addButton) {
    const loader = document.querySelector('.quantity-loader');
    const quantityControls = quantityElement?.closest('.quantity-controls');
    const returnButton = document.getElementById('view-cart-btn') || createReturnButton();

    showLoader(loader);

    try {
        const checkResponse = await fetch(`/api/check/${productId}/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!checkResponse.ok) {
            throw new Error('Failed to check cart status');
        }

        const checkData = await checkResponse.json();

        if (checkData.in_cart) {
            if (quantityElement && quantityControls) {
                const cartResponse = await fetch('/api/cart/', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (cartResponse.ok) {
                    const cartData = await cartResponse.json();
                    const cartItem = cartData.find(item => item.product_id === parseInt(productId));
                    if (cartItem) {
                        quantityElement.textContent = Math.min(cartItem.quantity, 10);
                    }
                }
                quantityControls.style.display = 'none';
            }
            if (addButton) {
                addButton.disabled = false;
                addButton.style.backgroundColor = '#ffffff';
                addButton.style.border = '1px solid #000000';
                addButton.style.color = '#000000';
                addButton.style.cursor = 'pointer';
                addButton.innerHTML = 'The product is already in the Cart ';
                addButton.onclick = () => { window.location.href = "Cart/" };
            }
            returnButton.style.display = 'none';
        } else {
            if (quantityElement && quantityControls) {
                const currentQuantity = parseInt(quantityElement.textContent) || 1;
                quantityElement.textContent = currentQuantity;
                quantityControls.style.display = 'flex';
            }
            if (addButton) {
                addButton.style.backgroundColor = '';
                addButton.style.border = '';
                addButton.style.color = '';
                addButton.innerHTML = 'Add to Cart';
                addButton.disabled = false;
                addButton.style.cursor = 'pointer';
                addButton.onclick = null;
            }
            returnButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching cart status:', error.message);
        showAuthModal('Please sign in to view cart status.');
        if (addButton) {
            addButton.style.backgroundColor = '';
            addButton.style.border = '';
            addButton.style.color = '';
            addButton.innerHTML = 'Add to Cart';
            addButton.disabled = false;
            addButton.style.cursor = 'pointer';
            addButton.onclick = null;
        }
        if (quantityElement && quantityControls) {
            quantityControls.style.display = 'flex';
        }
        returnButton.style.display = 'none';
    } finally {
        hideLoader(loader);
    }
}

/**
 * Setup quantity controls
 */
function setupQuantityControls(productId) {
    const quantityElement = document.getElementById('quantity');
    const decreaseBtn = document.querySelector('.quantity-btn.minus-btn');
    const increaseBtn = document.querySelector('.quantity-btn.plus-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const loaderElement = document.querySelector('.quantity-loader');

    fetchCartQuantity(productId, quantityElement, addToCartBtn);

    if (quantityElement) {
        let quantity = parseInt(quantityElement.textContent) || 1;

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', async () => {
                const isLoggedIn = await checkLoginStatus();
                if (!isLoggedIn) {
                    showAuthModal('Please sign in to modify the quantity.');
                    return;
                }
                if (quantity > 1) {
                    quantity--;
                    quantityElement.textContent = quantity;
                    console.log(`Quantity decreased to ${quantity} for product ${productId}`);
                    const checkResponse = await fetch(`/api/check/${productId}/`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const checkData = checkResponse.ok ? await checkResponse.json() : { in_cart: false };
                    if (checkData.in_cart) {
                        await handleQuantityUpdate(productId, quantity, quantityElement, loaderElement);
                    }
                    if (!checkData.in_cart) {
                        fetchCartQuantity(productId, quantityElement, addToCartBtn);
                    }
                } else {
                    showQuantityLimitModal('Minimum quantity of 1 reached. <i class="fa-solid fa-exclamation-circle"></i>');
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', async () => {
                const isLoggedIn = await checkLoginStatus();
                if (!isLoggedIn) {
                    showAuthModal('Please sign in to modify the quantity.');
                    return;
                }
                if (quantity < 10) {
                    quantity++;
                    quantityElement.textContent = quantity;
                    console.log(`Quantity increased to ${quantity} for product ${productId}`);
                    const checkResponse = await fetch(`/api/check/${productId}/`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const checkData = checkResponse.ok ? await checkResponse.json() : { in_cart: false };
                    if (checkData.in_cart) {
                        await handleQuantityUpdate(productId, quantity, quantityElement, loaderElement);
                    }
                    if (!checkData.in_cart) {
                        fetchCartQuantity(productId, quantityElement, addToCartBtn);
                    }
                } else {
                    showQuantityLimitModal('Maximum quantity of 10 reached. <i class="fa-solid fa-exclamation-circle"></i>');
                }
            });
        }
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            const isLoggedIn = await checkLoginStatus();
            if (!isLoggedIn) {
                showAuthModal('Please sign in to add items to your cart.');
                return;
            }
            const quantity = parseInt(document.getElementById('quantity')?.textContent || '1');
            if (quantity > 10) {
                showQuantityLimitModal('Maximum quantity of 10 reached. <i class="fa-solid fa-exclamation-circle"></i>');
                return;
            }
            await addToCart(productId, quantity);
            fetchCartQuantity(productId, quantityElement, addToCartBtn);
        });
    }
}

/**
 * Create a "View Cart" button
 */
function createReturnButton() {
    const returnButton = document.createElement('button');
    returnButton.id = 'view-cart-btn';
    returnButton.className = 'view-cart-btn';
    returnButton.textContent = 'View Cart';
    returnButton.style.display = 'none';
    returnButton.addEventListener('click', () => {
        window.location.href = 'Cart/';
    });
    document.querySelector('.quantity-controls')?.parentElement.appendChild(returnButton);
    return returnButton;
}

/**
 * Initialize product page
 */
document.addEventListener('DOMContentLoaded', async () => {
    const productId = new URLSearchParams(window.location.search).get('id');
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.style.display = 'none';
    document.body.appendChild(loader);

    if (!productId) {
        showAuthModal('No product ID provided. Please sign in to continue.');
        return;
    }

    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (minusBtn) minusBtn.setAttribute('data-product-id', productId);
    if (plusBtn) plusBtn.setAttribute('data-product-id', productId);
    if (addToCartBtn) addToCartBtn.setAttribute('data-product-id', productId);

    showLoader(loader);

    try {
        const response = await fetch(`/api/products/${productId}/`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to fetch product data');
        }
        const data = await response.json();

        updateProductDisplay(data);
        await Promise.all([
            fetchProductReviews(productId, data.title),
            formRelatedProducts(data.id, data.category),
            setupQuantityControls(productId),
            setupThumbnailListeners()
        ]);

        document.querySelectorAll('.wishlist-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.stopPropagation();
                const isLoggedIn = await checkLoginStatus();
                if (!isLoggedIn) {
                    showAuthModal('Please sign in to manage your wishlist.');
                    return;
                }
                const productId = parseInt(button.getAttribute('data-wishlist-id'));
                addToWishlist(productId);
            });
        });

        try {
            const wishlistResponse = await fetch('/api/wishlist/', { credentials: 'include' });
            if (!wishlistResponse.ok) {
                throw new Error('Failed to fetch wishlist');
            }

            const wishlistData = await wishlistResponse.json();
            wishlistData.wishlist.forEach(id => {
                const btn = document.querySelector(`.wishlist-btn[data-wishlist-id="${id}"]`);
                if (btn) {
                    btn.classList.add('active');
                    const icon = btn.querySelector('i');
                    if (icon) {
                        icon.classList.remove('bi-heart');
                        icon.classList.add('bi-heart-fill');
                        icon.style.color = '#e74c3c';
                    }
                }
            });
            updateWishlistCounter();
        } catch (error) {
            console.error('Error initializing wishlist:', error.message);
        }
    } catch (error) {
        console.error('Error initializing page:', error.message);
        showAuthModal('Failed to load product data. Please sign in to continue.');
    } finally {
        hideLoader(loader);
    }
});