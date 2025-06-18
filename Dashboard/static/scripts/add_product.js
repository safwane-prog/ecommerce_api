// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.dataset.tab;
        
        // Remove active class from all tabs and panes
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding pane
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Data storage (in real app, this would be server-side)
let categories = [];
let colors = [];
let sizes = [];
let clothingCategories = [];
let products = [];

// Success message function
function showSuccessMessage(message) {
    const successMsg = document.getElementById('successMessage');
    successMsg.textContent = message;
    successMsg.classList.add('show');
    setTimeout(() => {
        successMsg.classList.remove('show');
    }, 3000);
}

// Update select options
function updateSelectOptions() {
    const categorySelect = document.getElementById('category');
    const colorSelect = document.getElementById('color');
    const sizeSelect = document.getElementById('size');
    const clothingCategorySelect = document.getElementById('clothing_category');

    // Update categories
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach((cat, index) => {
        categorySelect.innerHTML += `<option value="${index}">${cat.name}</option>`;
    });

    // Update colors
    colorSelect.innerHTML = '<option value="">Select Color</option>';
    colors.forEach((color, index) => {
        colorSelect.innerHTML += `<option value="${index}">${color}</option>`;
    });

    // Update sizes
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    sizes.forEach((size, index) => {
        sizeSelect.innerHTML += `<option value="${index}">${size}</option>`;
    });

    // Update clothing categories
    clothingCategorySelect.innerHTML = '<option value="">Select Clothing Category</option>';
    clothingCategories.forEach((cat, index) => {
        clothingCategorySelect.innerHTML += `<option value="${index}">${cat}</option>`;
    });
}

// Category form handling
document.getElementById('categoryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const category = {
        name: formData.get('category_name'),
        slug: formData.get('category_slug'),
        description: formData.get('category_description'),
        image: formData.get('categoryImage')
    };
    
    categories.push(category);
    updateSelectOptions();
    renderCategoryList();
    this.reset();
    showSuccessMessage('Category added successfully!');
});

// Color form handling
document.getElementById('colorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const color = formData.get('color_name');
    
    colors.push(color);
    updateSelectOptions();
    renderColorList();
    this.reset();
    showSuccessMessage('Color added successfully!');
});

// Size form handling
document.getElementById('sizeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const size = formData.get('size_name');
    
    sizes.push(size);
    updateSelectOptions();
    renderSizeList();
    this.reset();
    showSuccessMessage('Size added successfully!');
});

// Clothing category form handling
document.getElementById('clothingCategoryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const clothingCategory = formData.get('clothing_category_name');
    
    clothingCategories.push(clothingCategory);
    updateSelectOptions();
    renderClothingCategoryList();
    this.reset();
    showSuccessMessage('Clothing category added successfully!');
});

// Product form handling
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const product = {
        title: formData.get('title'),
        price: formData.get('price'),
        old_price: formData.get('old_price'),
        discount: formData.get('discount'),
        stock: formData.get('stock'),
        category: formData.get('category'),
        color: formData.get('color'),
        size: formData.get('size'),
        clothing_category: formData.get('clothing_category'),
        description: formData.get('description'),
        images: []
    };
    
    products.push(product);
    this.reset();
    clearImagePreview();
    showSuccessMessage('Product added successfully!');
});

// Image handling
document.getElementById('productImages').addEventListener('change', function(e) {
    const files = Array.from(e.target.files).slice(0, 4); // Max 4 images
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-preview-item';
            imageItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}">
                <button type="button" class="remove-image" onclick="removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(imageItem);
        };
        reader.readAsDataURL(file);
    });
});

// Category image handling
document.getElementById('categoryImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('categoryImagePreview');
    preview.innerHTML = '';
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-preview-item';
            imageItem.innerHTML = `
                <img src="${e.target.result}" alt="Category Preview">
                <button type="button" class="remove-image" onclick="clearCategoryImage()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(imageItem);
        };
        reader.readAsDataURL(file);
    }
});

// Remove image functions
function removeImage(index) {
    const preview = document.getElementById('imagePreview');
    const items = preview.querySelectorAll('.image-preview-item');
    if (items[index]) {
        items[index].remove();
    }
}

function clearCategoryImage() {
    document.getElementById('categoryImage').value = '';
    document.getElementById('categoryImagePreview').innerHTML = '';
}

function clearImagePreview() {
    document.getElementById('productImages').value = '';
    document.getElementById('imagePreview').innerHTML = '';
}

// Auto-generate slug from category name
document.getElementById('category_name').addEventListener('input', function() {
    const slug = this.value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    document.getElementById('category_slug').value = slug;
});

// Render lists
function renderCategoryList() {
    const list = document.getElementById('categoryList');
    list.innerHTML = '';
    
    categories.forEach((category, index) => {
        const item = document.createElement('div');
        item.className = 'item-card';
        item.innerHTML = `
            <div>
                <span>${category.name}</span>
                <small style="display: block; color: #666; font-size: 12px;">/${category.slug}</small>
            </div>
            <button type="button" class="delete-btn" onclick="deleteCategory(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(item);
    });
}

function renderColorList() {
    const list = document.getElementById('colorList');
    list.innerHTML = '';
    
    colors.forEach((color, index) => {
        const item = document.createElement('div');
        item.className = 'item-card';
        item.innerHTML = `
            <span>${color}</span>
            <button type="button" class="delete-btn" onclick="deleteColor(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(item);
    });
}

function renderSizeList() {
    const list = document.getElementById('sizeList');
    list.innerHTML = '';
    
    sizes.forEach((size, index) => {
        const item = document.createElement('div');
        item.className = 'item-card';
        item.innerHTML = `
            <span>${size}</span>
            <button type="button" class="delete-btn" onclick="deleteSize(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(item);
    });
}

function renderClothingCategoryList() {
    const list = document.getElementById('clothingCategoryList');
    list.innerHTML = '';
    
    clothingCategories.forEach((category, index) => {
        const item = document.createElement('div');
        item.className = 'item-card';
        item.innerHTML = `
            <span>${category}</span>
            <button type="button" class="delete-btn" onclick="deleteClothingCategory(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        list.appendChild(item);
    });
}

// Delete functions
function deleteCategory(index) {
    if (confirm('Are you sure you want to delete this category?')) {
        categories.splice(index, 1);
        updateSelectOptions();
        renderCategoryList();
        showSuccessMessage('Category deleted successfully!');
    }
}

function deleteColor(index) {
    if (confirm('Are you sure you want to delete this color?')) {
        colors.splice(index, 1);
        updateSelectOptions();
        renderColorList();
        showSuccessMessage('Color deleted successfully!');
    }
}

function deleteSize(index) {
    if (confirm('Are you sure you want to delete this size?')) {
        sizes.splice(index, 1);
        updateSelectOptions();
        renderSizeList();
        showSuccessMessage('Size deleted successfully!');
    }
}

function deleteClothingCategory(index) {
    if (confirm('Are you sure you want to delete this clothing category?')) {
        clothingCategories.splice(index, 1);
        updateSelectOptions();
        renderClothingCategoryList();
        showSuccessMessage('Clothing category deleted successfully!');
    }
}

// Calculate discount automatically
document.getElementById('old_price').addEventListener('input', calculateDiscount);
document.getElementById('price').addEventListener('input', calculateDiscount);

function calculateDiscount() {
    const oldPrice = parseFloat(document.getElementById('old_price').value) || 0;
    const currentPrice = parseFloat(document.getElementById('price').value) || 0;
    
    if (oldPrice > 0 && currentPrice > 0 && oldPrice > currentPrice) {
        const discount = Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
        document.getElementById('discount').value = discount;
    }
}

// Mobile sidebar toggle
function createMobileSidebar() {
    const sidebarToggle = document.createElement('div');
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    sidebarToggle.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 101;
        font-size: 20px;
        color: #333;
        cursor: pointer;
        display: none;
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(sidebarToggle);

    function checkScreenSize() {
        if (window.innerWidth < 768) {
            sidebarToggle.style.display = 'block';
            document.querySelector('.sidebar').style.transform = 'translateX(-100%)';
            document.querySelector('.main-content').style.marginLeft = '0';
        } else {
            sidebarToggle.style.display = 'none';
            document.querySelector('.sidebar').style.transform = 'translateX(0)';
            document.querySelector('.main-content').style.marginLeft = '250px';
        }
    }

    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();

    sidebarToggle.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar.style.transform === 'translateX(-100%)') {
            sidebar.style.transform = 'translateX(0)';
        } else {
            sidebar.style.transform = 'translateX(-100%)';
        }
    });
}

// Initialize default data
function initializeDefaultData() {
    // Add some default categories
    categories.push(
        { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
        { name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories' },
        { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and garden items' }
    );

    // Add some default colors
    colors.push('Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple');

    // Add some default sizes
    sizes.push('XS', 'S', 'M', 'L', 'XL', 'XXL');

    // Add some default clothing categories
    clothingCategories.push('T-Shirts', 'Jeans', 'Dresses', 'Shoes', 'Accessories', 'Jackets');

    // Update all select options and render lists
    updateSelectOptions();
    renderCategoryList();
    renderColorList();
    renderSizeList();
    renderClothingCategoryList();
}

// Form validation
function validateProductForm() {
    const title = document.getElementById('title').value.trim();
    const price = document.getElementById('price').value;
    
    if (!title) {
        alert('Product title is required');
        return false;
    }
    
    if (!price || price <= 0) {
        alert('Valid price is required');
        return false;
    }
    
    return true;
}

// Update product form validation
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateProductForm()) {
        return;
    }
    
    const formData = new FormData(this);
    const product = {
        title: formData.get('title'),
        price: formData.get('price'),
        old_price: formData.get('old_price'),
        discount: formData.get('discount'),
        stock: formData.get('stock'),
        category: formData.get('category'),
        color: formData.get('color'),
        size: formData.get('size'),
        clothing_category: formData.get('clothing_category'),
        description: formData.get('description'),
        images: []
    };
    
    products.push(product);
    this.reset();
    clearImagePreview();
    showSuccessMessage('Product added successfully!');
    
    // Log product data (for debugging)
    console.log('Product added:', product);
});

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    createMobileSidebar();
    initializeDefaultData();
});