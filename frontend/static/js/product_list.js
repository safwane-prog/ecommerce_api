// متغيرات عامة
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 12;
let filters = {
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    color: '',
    size: '',
    categories: ''
};
let currentSort = 'featured';

// ==============تحميل البيانات الأولية ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    loadProducts();
    setupEventListeners();
});

// تحميل الفلاتر
function initializeFilters() {
    loadSizes();
    loadColors();
    loadCategories();
    loadCategoryProducts();
    loadCategory();
}

// تحميل الأحجام
function loadSizes() {
    fetch('/api/get_sizes/')
        .then(res => res.json())
        .then(data => {
            const sizeContainer = document.querySelector('#size .size-options');
            if (sizeContainer) {
                sizeContainer.innerHTML = '';
                data.forEach(item => {
                    sizeContainer.innerHTML += `
                        <label class="filter-option">
                            <input type="checkbox" name="size" value="${item.size}">
                            <span class="checkmark"></span>
                            ${item.size}
                        </label>
                    `;
                });
            }
        })
        .catch(error => console.error('خطأ في تحميل الأحجام:', error));
}

function loadCategory() {
    fetch('/api/get_category_products/')
        .then(res => res.json())
        .then(data => {
            const sizeContainer = document.querySelector('#category .category-options');
            if (sizeContainer) {
                sizeContainer.innerHTML = '';
                data.forEach(item => {
                    sizeContainer.innerHTML += `
                        <label class="filter-option">
                            <input type="checkbox" name="category" value="${item.category}">
                            <span class="checkmark"></span>
                            ${item.category}
                        </label>
                    `;
                });
            }
        })
        .catch(error => console.error('خطأ في تحميل الأحجام:', error));
}

// تحميل الألوان
function loadColors() {
    fetch('/api/get_colors/')
        .then(res => res.json())
        .then(data => {
            const colorContainer = document.querySelector('#color .color-options');
            if (colorContainer) {
                colorContainer.innerHTML = '';
                data.forEach(item => {
                    colorContainer.innerHTML += `
                        <label class="filter-option color-option">
                            <input type="checkbox" name="color" value="${item.color}">
                            <span class="color-swatch" style="background-color: ${item.color_code || item.color}"></span>
                            ${item.color}
                        </label>
                    `;
                });
            }
        })
        .catch(error => console.error('خطأ في تحميل الألوان:', error));
}

// تحميل فئات المنتجات
function loadCategoryProducts() {
    fetch('/api/get_category_products/')
        .then(res => res.json())
        .then(data => {
            const categoryContainer = document.querySelector('#category .filter-content');
            if (categoryContainer) {
                categoryContainer.innerHTML = '';
                data.forEach(item => {
                    categoryContainer.innerHTML += `
                        <label class="filter-option">
                            <input type="radio" name="category" value="${item.category}">
                            <span class="checkmark"></span>
                            ${item.category}
                        </label>
                    `;
                });
            }
        })
        .catch(error => console.error('خطأ في تحميل فئات المنتجات:', error));
}

// تحميل الفئات العامة
function loadCategories() {
    fetch('/api/get_categories/')
        .then(res => res.json())
        .then(data => {
            const categoriesContainer = document.querySelector('#categories .optionsoptions');
            if (categoriesContainer) {
                categoriesContainer.innerHTML = '';
                data.forEach(item => {
                    categoriesContainer.innerHTML += `
                        <label class="filter-option">
                            <input type="checkbox" name="categories" value="${item.name}">
                            <span class="checkmark"></span>
                            ${item.name}
                        </label>
                    `;
                });
            }
        })
        .catch(error => console.error('خطأ في تحميل الفئات:', error));
}

// تحميل المنتجات
function loadProducts() {
    Showloader();
    fetch('/api/products/')
        .then(res => res.json())
        .then(data => {
            allProducts = data;
            filteredProducts = [...allProducts];
            applyFiltersAndSort();
        })
        .catch(error => {
            console.error('خطأ في تحميل المنتجات:', error);
            alert('حدث خطأ في تحميل المنتجات');
        })
        .finally(() => {
            Hideloader();
        });
}

// تطبيق الفلاتر والترتيب
function applyFiltersAndSort() {
    // تطبيق الفلاتر
    filteredProducts = allProducts.filter(product => {
        // فلتر الفئة
        if (filters.category && product.category !== filters.category) {
            return false;
        }
        
        // فلتر السعر
        const price = parseFloat(product.price);
        if (price < filters.minPrice || price > filters.maxPrice) {
            return false;
        }
        
        // فلتر اللون
        if (filters.color && product.color !== filters.color) {
            return false;
        }
        
        // فلتر الحجم
        if (filters.size && !product.sizes?.includes(filters.size)) {
            return false;
        }
        
        // فلتر الفئات العامة
        if (filters.categories && product.categories !== filters.categories) {
            return false;
        }
        
        return true;
    });
    
    // تطبيق الترتيب
    applySorting();
    
    // إعادة تعيين الصفحة الحالية
    currentPage = 1;
    
    // عرض النتائج
    displayProducts();
    updatePagination();
    updateProductsCount();
}

// تطبيق الترتيب
function applySorting() {
    switch (currentSort) {
        case 'price-asc':
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-desc':
            filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'rating':
            filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'featured':
        default:
            filteredProducts.sort((a, b) => (b.is_featured || 0) - (a.is_featured || 0));
            break;
    }
}

// عرض المنتجات
function displayProducts() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    const container = document.getElementById('all_items');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (productsToShow.length === 0) {
        container.innerHTML = `
            <div class="no-products">
                <i class="fa-solid fa-box-open"></i>
                <h3>لا توجد منتجات</h3>
                <p>لم يتم العثور على منتجات تطابق معايير البحث</p>
            </div>
        `;
        return;
    }
    
    productsToShow.forEach(product => {
        container.innerHTML += `
            <div class="product-card_context" data-product-id="${product.id}">
                <div class="product-card">
                    <div class="product-image">
                        <img onclick="viewDetails(${product.id})" 
                             src="${product.image_1}" 
                             alt="${product.title}" 
                             onerror="this.src='https://via.placeholder.com/300x250/f8f9fa/6c757d?text=No+Image'">
                        ${product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : ''}
                        <button onclick="Add_to_wishlist(${product.id})" 
                                title="إضافة للمفضلة" 
                                class="wishlist-btn" 
                                aria-label="Add to wishlist">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                                    2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                                    C13.09 3.81 14.76 3 16.5 3
                                    19.58 3 22 5.42 22 8.5
                                    c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="product-details">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-description">${product.description || product.title}</p>
                        <div class="price-container">
                            <span class="current-price">$${product.price}</span>
                            ${product.old_price ? `<span class="old-price">$${product.old_price}</span>` : ''}
                        </div>
                        ${product.rating ? `
                            <div class="product-rating">
                                ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                                <span>(${product.rating})</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="addtocart">
                    <button title="Add To Cart" 
                            onclick="addToCart(${product.id})" 
                            class="add-to-cart-btn addToCart${product.id}" 
                            data-product-id="${product.id}">
                        Add To Cart <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                    <button title="عرض التفاصيل" 
                            class="product-info-btn" 
                            data-product-id="${product.id}" 
                            onclick="viewDetails(${product.id})">
                        <i class="fa-solid fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

// تحديث الـ pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginationContainer = document.querySelector('.page-numbers');
    const prevButton = document.querySelector('.pagination-button.prev');
    const nextButton = document.querySelector('.pagination-button.next');
    
    if (!paginationContainer) return;
    
    // تحديث أزرار التنقل
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    
    // إنشاء أرقام الصفحات
    paginationContainer.innerHTML = '';
    
    // حساب نطاق الصفحات المعروضة
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // التأكد من عرض 5 صفحات على الأقل إذا كان ممكناً
    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
        } else {
            startPage = Math.max(1, endPage - 4);
        }
    }
    
    // إضافة الصفحة الأولى إذا لم تكن ضمن النطاق
    if (startPage > 1) {
        paginationContainer.innerHTML += `
            <button class="page-number" onclick="goToPage(1)">1</button>
        `;
        if (startPage > 2) {
            paginationContainer.innerHTML += `<span class="pagination-dots">...</span>`;
        }
    }
    
    // إضافة الصفحات في النطاق
    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.innerHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">${i}</button>
        `;
    }
    
    // إضافة الصفحة الأخيرة إذا لم تكن ضمن النطاق
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationContainer.innerHTML += `<span class="pagination-dots">...</span>`;
        }
        paginationContainer.innerHTML += `
            <button class="page-number" onclick="goToPage(${totalPages})">${totalPages}</button>
        `;
    }
}

// الانتقال لصفحة محددة
function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayProducts();
        updatePagination();
        scrollToTop();
    }
}

// الصفحة السابقة
function previousPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

// الصفحة التالية
function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

// تحديث عدد المنتجات
function updateProductsCount() {
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        countElement.textContent = filteredProducts.length;
    }
}

// إعدادات أحداث العناصر
function setupEventListeners() {
    // مستمع تغيير الترتيب
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            applyFiltersAndSort();
        });
    }
    
    // مستمع شريط تمرير السعر
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            filters.maxPrice = parseInt(this.value);
            document.getElementById('maxPriceDisplay').textContent = this.value;
        });
    }
    
    // مستمع أزرار الفلاتر
    const applyButton = document.querySelector('.apply-filters');
    if (applyButton) {
        applyButton.addEventListener('click', applyCurrentFilters);
    }
    
    const resetButton = document.querySelector('.reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', resetAllFilters);
    }
    
    // مستمعي أزرار التنقل
    const prevButton = document.querySelector('.pagination-button.prev');
    const nextButton = document.querySelector('.pagination-button.next');
    
    if (prevButton) {
        prevButton.addEventListener('click', previousPage);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', nextPage);
    }
    
    // مستمع تبديل الفلاتر
    setupFilterToggles();
}

// إعدادات تبديل الفلاتر
function setupFilterToggles() {
    const filterHeaders = document.querySelectorAll('.filter-header');
    filterHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.dataset.toggle;
            const content = document.getElementById(targetId);
            const icon = this.querySelector('.toggle-icon');
            
            if (content) {
                content.classList.toggle('active');
                icon.classList.toggle('fa-chevron-up');
                icon.classList.toggle('fa-chevron-down');
            }
        });
    });
}

// تطبيق الفلاتر الحالية
function applyCurrentFilters() {
    // فلتر الفئة
    const categoryInputs = document.querySelectorAll('input[name="category"]:checked');
    filters.category = categoryInputs.length > 0 ? categoryInputs[0].value : '';
    
    // فلتر اللون
    const colorInputs = document.querySelectorAll('input[name="color"]:checked');
    filters.color = colorInputs.length > 0 ? colorInputs[0].value : '';
    
    // فلتر الحجم
    const sizeInputs = document.querySelectorAll('input[name="size"]:checked');
    filters.size = sizeInputs.length > 0 ? sizeInputs[0].value : '';
    
    // فلتر الفئات العامة
    const categoriesInputs = document.querySelectorAll('input[name="categories"]:checked');
    filters.categories = categoriesInputs.length > 0 ? categoriesInputs[0].value : '';
    
    // فلتر السعر
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        filters.maxPrice = parseInt(priceRange.value);
    }
    
    applyFiltersAndSort();
}

// إعادة تعيين جميع الفلاتر
function resetAllFilters() {
    // إعادة تعيين قيم الفلاتر
    filters = {
        category: '',
        minPrice: 0,
        maxPrice: 1000,
        color: '',
        size: '',
        categories: ''
    };
    
    // إلغاء تحديد جميع المربعات
    const checkboxes = document.querySelectorAll('.filter-content input[type="checkbox"], .filter-content input[type="radio"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    // إعادة تعيين شريط السعر
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.value = 1000;
        document.getElementById('maxPriceDisplay').textContent = '1000';
    }
    
    // إعادة تعيين الترتيب
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.value = 'featured';
        currentSort = 'featured';
    }
    
    applyFiltersAndSort();
}

// التمرير للأعلى
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ================= وظائف إضافية ======================

// إضافة للسلة
function addToCart(productId) {
    fetch('/api/add-to-cart/', {
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
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const addButton = document.querySelector(`.addToCart${productId}`);
            if (addButton) {
                addButton.style.backgroundColor = '#4CAF50';
                addButton.innerHTML = ` Added <i class="fa-solid fa-check"></i>`;
                addButton.style.cursor = "not-allowed";
                addButton.disabled = true;
            }
            
            // تحديث عداد السلة
            updateCartCounter();
        }
    })
    .finally(()=>{
        const addButton = document.querySelector(`.addToCart${productId}`);
        addButton.style.backgroundColor = '#4CAF50';
        addButton.innerHTML = `Added <i class="fa-solid fa-check"></i>`;
        addButton.style.cursor = "not-allowed";
        addButton.disabled = true;
    })
    .catch(error => {
        console.error('خطأ في إضافة المنتج للسلة:', error);
        alert('حدث خطأ في إضافة المنتج للسلة');
    });
}


document.addEventListener("DOMContentLoaded", function () {
    fetch('/api/wishlist/', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const wishlist = data.wishlist; // قائمة product_id
        wishlist.forEach(productId => {
            const btn = document.querySelector(`[onclick="Add_to_wishlist(${productId})"]`);
            if (btn) {
                btn.classList.add('active');
                btn.style.color = '#e74c3c';
            }
        });
    })
    .catch(error => {
        console.error('خطأ في تحميل المفضلة:', error);
    });
});

// إضافة للمفضلة
function Add_to_wishlist(productId) {
    fetch('/api/add-to-wishlist/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include',
        body: JSON.stringify({
            product_id: productId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "تمت الإضافة إلى المفضلة بنجاح") {
            const wishlistButton = document.querySelector(`[onclick="Add_to_wishlist(${productId})"]`);
            if (wishlistButton) {
                wishlistButton.classList.add('active');
                wishlistButton.style.color = '#e74c3c';
            }
        } else {
            console.log("رسالة غير متوقعة:", data);
        }
    })
    .catch(error => {
        console.error('خطأ في إضافة المنتج للمفضلة:', error);
    });
}

// عرض تفاصيل المنتج
function viewDetails(productId) {
    window.location.href = `/product-detail.html?id=${productId}`;
}

// تحديث عداد السلة
function updateCartCounter() {
    fetch('/api/cart-count/')
        .then(response => response.json())
        .then(data => {
            const counter = document.getElementById('cart-counter');
            if (counter) {
                counter.textContent = data.count || 0;
            }
        })
        .catch(error => console.error('خطأ في تحديث عداد السلة:', error));
}

// الحصول على CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// عرض/إخفاء شاشة التحميل
function Showloader() {
    const loader = document.getElementById('loader-container');
    if (loader) {
        loader.style.display = 'flex';
    }
}

function Hideloader() {
    const loader = document.getElementById('loader-container');
    if (loader) {
        loader.style.display = 'none';
    }
}