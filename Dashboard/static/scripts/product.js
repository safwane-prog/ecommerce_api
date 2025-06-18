// Enhanced Product Management JavaScript - Fixed and Optimized Version

class ProductManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.allProducts = [];
        this.filteredProducts = [];
        this.categories = [];
        
        // Cache DOM elements
        this.domElements = {};
        
        this.init();
    }

    init() {
        this.cacheDOM();
        this.loadCategories();
        this.loadProducts();
        this.setupEventListeners();
        this.setupLiveSearch();
    }

    // Cache frequently used DOM elements
    cacheDOM() {
        this.domElements = {
            categorySelect: document.getElementById('category'),
            stockSelect: document.getElementById('stock'),
            statusSelect: document.getElementById('status'),
            searchInput: document.querySelector('.search-box input'),
            tbody: document.getElementById('tbody-product'),
            selectAllCheckbox: document.getElementById('selectAll'),
            paginationControls: document.querySelector('.pagination-controls'),
            paginationInfo: document.querySelector('.pagination span'),
            applyFiltersBtn: document.querySelector('.btn-apply'),
            bulkDeleteBtn: document.getElementById('bulk-delete'),
            bulkActivateBtn: document.getElementById('bulk-activate'),
            bulkDeactivateBtn: document.getElementById('bulk-deactivate')
        };
    }

    // Load categories from API
    async loadCategories() {
        try {
            const response = await fetch('/api/get_categories/');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            if (this.domElements.categorySelect) {
                this.domElements.categorySelect.innerHTML = '<option value="all">All Categories</option>';
                this.categories = data;
                
                data.forEach(category => {
                    this.domElements.categorySelect.innerHTML += `
                        <option value="${this.escapeHtml(category.id)}">${this.escapeHtml(category.name)}</option>
                    `;
                });
            }
        } catch (error) {
            console.error('خطأ في تحميل الفئات:', error);
            this.showNotification('فشل في تحميل الفئات', 'error');
        }
    }

    // Load products from API
    async loadProducts() {
        try {
            const response = await fetch('/api/admin-products/');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            this.allProducts = data;
            this.filteredProducts = [...data];
            this.renderProducts();
            this.renderPagination();
        } catch (error) {
            console.error('خطأ في تحميل المنتجات:', error);
            this.showNotification('فشل في تحميل المنتجات', 'error');
        }
    }

    // Utility function to safely get nested properties
    getNestedProperty(obj, path, defaultValue = '') {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : defaultValue;
        }, obj);
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Get category name with fallback
    getCategoryName(product) {
        return this.getNestedProperty(product, 'Category.name') || 
               this.getNestedProperty(product, 'category.name') || 
               'Unclassified';
    }

    // Get size text with fallback
    getSizeText(product) {
        return this.getNestedProperty(product, 'size.size') || 
               this.getNestedProperty(product, 'size') || 
               '';
    }

    // Get color text with fallback
    getColorText(product) {
        return this.getNestedProperty(product, 'color.color') || 
               this.getNestedProperty(product, 'color') || 
               '';
    }

    // Render products in table
    renderProducts() {
        if (!this.domElements.tbody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0) {
            this.domElements.tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-products">
                        <div class="empty-state">
                            <i class="fas fa-box-open"></i>
                            <p>No products available</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();

        productsToShow.forEach(product => {
            const stockStatus = this.getStockStatus(product.stock);
            const statusClass = this.getStatusClass(product.active);
            const categoryName = this.getCategoryName(product);
            const sizeText = this.getSizeText(product);
            const colorText = this.getColorText(product);
            
            const row = document.createElement('tr');
            row.className = `product${product.id}`;
            row.setAttribute('data-product-id', product.id);
            
            row.innerHTML = `
                <td><input type="checkbox" class="product-checkbox" value="${product.id}"></td>
                <td class="product-info">
                    <img src="${this.escapeHtml(product.image_1 || '/static/images/no-image.png')}" 
                         alt="${this.escapeHtml(product.title)}" 
                         onerror="this.src='/static/images/no-image.png'">
                    <div>
                        <h4>${this.escapeHtml(product.title)}</h4>
                        <span>color: ${this.escapeHtml(colorText)} | size: ${this.escapeHtml(sizeText)}</span>
                    </div>
                </td>
                <td>${this.escapeHtml(categoryName)}</td>
                <td class="price">$${parseFloat(product.price || 0).toFixed(2)}</td>
                <td>
                    <span class="stock ${stockStatus.class}">${product.stock || 0}</span>
                </td>
                <td>
                    <span class="status ${statusClass}">${this.getStatusText(product.active)}</span>
                </td>
                <td class="actions">
                    <button onclick="EditProduct(${product.id})"
                            class="btn-edit" title="تعديل المنتج">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="productManager.deleteProduct(${product.id}, this)" 
                            class="btn-delete" title="حذف المنتج">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            fragment.appendChild(row);
        });

        this.domElements.tbody.innerHTML = '';
        this.domElements.tbody.appendChild(fragment);
        this.updateSelectAllCheckbox();
    }

    // Fixed setupLiveSearch function
    setupLiveSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        // Add debouncing for better performance
        let debounceTimer;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const keyword = e.target.value.toLowerCase().trim();

                if (!keyword) {
                    this.applyFilters();
                    return;
                }

                this.filteredProducts = this.allProducts.filter(product => {
                    const title = (product.title || '').toLowerCase();
                    const category = this.getCategoryName(product).toLowerCase();
                    const color = this.getColorText(product).toLowerCase();
                    const size = this.getSizeText(product).toLowerCase();
                    
                    const matchesSearch = title.includes(keyword) ||
                                        category.includes(keyword) ||
                                        color.includes(keyword) ||
                                        size.includes(keyword);
                    
                    return matchesSearch && this.passesCurrentFilters(product);
                });

                this.currentPage = 1;
                this.renderProducts();
                this.renderPagination();
            }, 300); // 300ms debounce
        });
    }

    // Get stock status with appropriate class
    getStockStatus(stock) {
        const stockNum = parseInt(stock) || 0;
        
        if (stockNum === 0) {
            return { class: 'out-of-stock', text: 'نفد المخزون' };
        } else if (stockNum > 0 && stockNum <= 5) {
            return { class: 'low-stock', text: 'مخزون منخفض' };
        } else {
            return { class: 'in-stock', text: 'متوفر' };
        }
    }

    // Get status class
    getStatusClass(active) {
        switch(active) {
            case 'active':
            case true:
            case 1:
                return 'active';
            case 'draft':
                return 'draft';
            case 'archived':
                return 'archived';
            case false:
            case 0:
            case 'inactive':
                return 'inactive';
            default:
                return 'inactive';
        }
    }

    // Get status text
    getStatusText(active) {
        switch(active) {
            case 'active':
            case true:
            case 1:
                return 'نشط';
            case 'draft':
                return 'مسودة';
            case 'archived':
                return 'مؤرشف';
            case false:
            case 0:
            case 'inactive':
                return 'غير نشط';
            default:
                return 'غير نشط';
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        if (this.domElements.searchInput) {
            this.domElements.searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }

        // Filter functionality
        if (this.domElements.applyFiltersBtn) {
            this.domElements.applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Filter change events
        [this.domElements.categorySelect, this.domElements.stockSelect, this.domElements.statusSelect]
            .forEach(element => {
                if (element) {
                    element.addEventListener('change', () => {
                        this.applyFilters();
                    });
                }
            });

        // Select all checkbox
        if (this.domElements.selectAllCheckbox) {
            this.domElements.selectAllCheckbox.addEventListener('change', (e) => {
                this.selectAllProducts(e.target.checked);
            });
        }

        // Individual checkboxes (using event delegation)
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('product-checkbox')) {
                this.updateSelectAllCheckbox();
            }
        });

        // Bulk actions
        this.setupBulkActions();
    }

    // Search products with improved error handling
    searchProducts(query) {
        try {
            if (!query.trim()) {
                this.applyFilters();
                return;
            }

            const searchTerm = query.toLowerCase();
            this.filteredProducts = this.allProducts.filter(product => {
                const matchesSearch = (product.title || '').toLowerCase().includes(searchTerm) ||
                    this.getCategoryName(product).toLowerCase().includes(searchTerm) ||
                    (product.Clothing_Categories || '').toLowerCase().includes(searchTerm);
                
                return matchesSearch && this.passesCurrentFilters(product);
            });
            
            this.currentPage = 1;
            this.renderProducts();
            this.renderPagination();
        } catch (error) {
            console.error('خطأ في البحث:', error);
            this.showNotification('فشل في البحث', 'error');
        }
    }

    // Check if product passes current filters
    passesCurrentFilters(product) {
        try {
            const categoryFilter = this.domElements.categorySelect?.value || 'all';
            const stockFilter = this.domElements.stockSelect?.value || 'all';
            const statusFilter = this.domElements.statusSelect?.value || 'all';

            // Category filter
            let matchesCategory = categoryFilter === 'all' || 
                                product.category_id == categoryFilter ||
                                this.getNestedProperty(product, 'Category.id') == categoryFilter;
            
            // Stock filter
            let matchesStock = true;
            if (stockFilter !== 'all') {
                const stockNum = parseInt(product.stock) || 0;
                switch(stockFilter) {
                    case 'in-stock':
                        matchesStock = stockNum > 5;
                        break;
                    case 'low-stock':
                        matchesStock = stockNum > 0 && stockNum <= 5;
                        break;
                    case 'out-of-stock':
                        matchesStock = stockNum === 0;
                        break;
                }
            }

            // Status filter
            let matchesStatus = true;
            if (statusFilter !== 'all') {
                switch(statusFilter) {
                    case 'active':
                        matchesStatus = product.active === 'active' || product.active === true || product.active === 1;
                        break;
                    case 'inactive':
                        matchesStatus = product.active === 'inactive' || product.active === false || product.active === 0;
                        break;
                    case 'draft':
                        matchesStatus = product.active === 'draft';
                        break;
                    case 'archived':
                        matchesStatus = product.active === 'archived';
                        break;
                }
            }

            return matchesCategory && matchesStock && matchesStatus;
        } catch (error) {
            console.error('خطأ في تطبيق المرشحات:', error);
            return true; // Return true to avoid hiding products on filter error
        }
    }

    // Apply filters with improved error handling
    applyFilters() {
        try {
            const searchTerm = this.domElements.searchInput?.value.toLowerCase() || '';

            this.filteredProducts = this.allProducts.filter(product => {
                // Search filter
                let matchesSearch = true;
                if (searchTerm.trim()) {
                    matchesSearch = (product.title || '').toLowerCase().includes(searchTerm) ||
                        this.getCategoryName(product).toLowerCase().includes(searchTerm) ||
                        (product.Clothing_Categories || '').toLowerCase().includes(searchTerm);
                }

                return matchesSearch && this.passesCurrentFilters(product);
            });

            this.currentPage = 1;
            this.renderProducts();
            this.renderPagination();
        } catch (error) {
            console.error('خطأ في تطبيق المرشحات:', error);
            this.showNotification('فشل في تطبيق المرشحات', 'error');
        }
    }

    // Toggle product status (activate/deactivate)
    async toggleProductStatus(productId, buttonElement) {
        try {
            const product = this.allProducts.find(p => p.id === productId);
            if (!product) {
                throw new Error('المنتج غير موجود');
            }

            const newStatus = product.active === 'active' || product.active === true || product.active === 1 ? 'inactive' : 'active';

            const response = await fetch(`/Board_api/toggle-product-status/${productId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            // Update product in local data
            product.active = newStatus;
            
            // Re-render products to reflect changes
            this.renderProducts();
            
            this.showNotification(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} المنتج بنجاح`, 'success');
        } catch (error) {
            console.error('خطأ في تغيير حالة المنتج:', error);
            this.showNotification(error.message || 'فشل في تغيير حالة المنتج', 'error');
        }
    }

    // Delete product with improved error handling
    async deleteProduct(productId, buttonElement) {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            return;
        }

        try {
            const response = await fetch(`/Board_api/delete-product/${productId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            // Remove from local data
            this.allProducts = this.allProducts.filter(p => p.id !== productId);
            this.filteredProducts = this.filteredProducts.filter(p => p.id !== productId);
            
            // Re-render products
            this.renderProducts();
            this.renderPagination();
            
            this.showNotification('تم حذف المنتج بنجاح', 'success');
        } catch (error) {
            console.error('خطأ في حذف المنتج:', error);
            this.showNotification(error.message || 'فشل في حذف المنتج', 'error');
        }
    }

    // Select all products
    selectAllProducts(checked) {
        const productCheckboxes = document.querySelectorAll('.product-checkbox');
        productCheckboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    // Update select all checkbox state
    updateSelectAllCheckbox() {
        const productCheckboxes = document.querySelectorAll('.product-checkbox');
        
        if (this.domElements.selectAllCheckbox && productCheckboxes.length > 0) {
            const checkedCount = document.querySelectorAll('.product-checkbox:checked').length;
            this.domElements.selectAllCheckbox.checked = checkedCount === productCheckboxes.length;
            this.domElements.selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < productCheckboxes.length;
        }
    }

    // Setup bulk actions
    setupBulkActions() {
        if (this.domElements.bulkDeleteBtn) {
            this.domElements.bulkDeleteBtn.addEventListener('click', () => {
                this.bulkDeleteProducts();
            });
        }

        if (this.domElements.bulkActivateBtn) {
            this.domElements.bulkActivateBtn.addEventListener('click', () => {
                this.bulkToggleStatus('active');
            });
        }

        if (this.domElements.bulkDeactivateBtn) {
            this.domElements.bulkDeactivateBtn.addEventListener('click', () => {
                this.bulkToggleStatus('inactive');
            });
        }
    }

    // Bulk delete products with improved error handling
    async bulkDeleteProducts() {
        const selectedCheckboxes = document.querySelectorAll('.product-checkbox:checked');
        
        if (selectedCheckboxes.length === 0) {
            this.showNotification('لم يتم تحديد أي منتجات', 'warning');
            return;
        }

        if (!confirm(`هل أنت متأكد من حذف ${selectedCheckboxes.length} منتج؟`)) {
            return;
        }

        try {
            const productIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
            
            const response = await fetch('/Board_api/bulk-delete-products/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({ product_ids: productIds }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            // Remove deleted products from local data
            this.allProducts = this.allProducts.filter(p => !productIds.includes(p.id));
            this.filteredProducts = this.filteredProducts.filter(p => !productIds.includes(p.id));
            
            // Re-render products
            this.renderProducts();
            this.renderPagination();
            
            this.showNotification(`تم حذف ${productIds.length} منتج بنجاح`, 'success');
        } catch (error) {
            console.error('خطأ في حذف المنتجات:', error);
            this.showNotification(error.message || 'فشل في حذف المنتجات', 'error');
        }
    }

    // Bulk toggle status with improved error handling
    async bulkToggleStatus(status) {
        const selectedCheckboxes = document.querySelectorAll('.product-checkbox:checked');
        
        if (selectedCheckboxes.length === 0) {
            this.showNotification('لم يتم تحديد أي منتجات', 'warning');
            return;
        }

        try {
            const productIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
            
            const response = await fetch('/Board_api/bulk-toggle-status/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({ 
                    product_ids: productIds,
                    status: status 
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            // Update products in local data
            this.allProducts.forEach(product => {
                if (productIds.includes(product.id)) {
                    product.active = status;
                }
            });
            
            // Re-render products
            this.renderProducts();
            
            const actionText = status === 'active' ? 'تفعيل' : 'إلغاء تفعيل';
            this.showNotification(`تم ${actionText} ${productIds.length} منتج بنجاح`, 'success');
        } catch (error) {
            console.error('خطأ في تغيير حالة المنتجات:', error);
            this.showNotification(error.message || 'فشل في تغيير حالة المنتجات', 'error');
        }
    }

    // Render pagination with improved performance
    renderPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (!this.domElements.paginationControls || totalPages <= 1) {
            if (this.domElements.paginationControls) {
                this.domElements.paginationControls.innerHTML = '';
            }
            return;
        }

        const fragment = document.createDocumentFragment();

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = `btn-pagination ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.onclick = () => this.goToPage(this.currentPage - 1);
        fragment.appendChild(prevBtn);

        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-pagination ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => this.goToPage(i);
            fragment.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = `btn-pagination ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => this.goToPage(this.currentPage + 1);
        fragment.appendChild(nextBtn);

        this.domElements.paginationControls.innerHTML = '';
        this.domElements.paginationControls.appendChild(fragment);

        // Update pagination info
        if (this.domElements.paginationInfo) {
            const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endItem = Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
            this.domElements.paginationInfo.textContent = `عرض ${startItem} إلى ${endItem} من ${this.filteredProducts.length} منتج`;
        }
    }

    // Go to specific page
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.renderProducts();
            this.renderPagination();
        }
    }

    // Get CSRF token with improved fallback
    getCSRFToken() {
        // Try meta tag first
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken) return metaToken.getAttribute('content');
        
        // Try form token
        const tokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
        if (tokenElement) return tokenElement.value;
        
        // Try cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return decodeURIComponent(value);
            }
        }
        
        console.warn('CSRF token not found');
        return '';
    }

    // Show notification with improved accessibility
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <span>${this.escapeHtml(message)}</span>
            <button class="close-notification" aria-label="إغلاق الإشعار">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        const timeoutId = setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            clearTimeout(timeoutId);
            if (notification.parentNode) {
                notification.remove();
            }
        });
    }

    // Refresh products
    async refresh() {
        try {
            await this.loadProducts();
            this.showNotification('تم تحديث البيانات بنجاح', 'success');
        } catch (error) {
            console.error('خطأ في تحديث البيانات:', error);
            this.showNotification('فشل في تحديث البيانات', 'error');
        }
    }

    // Reset filters
    resetFilters() {
        try {
            if (this.domElements.categorySelect) this.domElements.categorySelect.value = 'all';
            if (this.domElements.stockSelect) this.domElements.stockSelect.value = 'all';
            if (this.domElements.statusSelect) this.domElements.statusSelect.value = 'all';
            if (this.domElements.searchInput) this.domElements.searchInput.value = '';

            this.filteredProducts = [...this.allProducts];
            this.currentPage = 1;
            this.renderProducts();
            this.renderPagination();
            
            this.showNotification('تم إعادة تعيين المرشحات', 'info');
        } catch (error) {
            console.error('خطأ في إعادة تعيين المرشحات:', error);
            this.showNotification('فشل في إعادة تعيين المرشحات', 'error');
        }
    }

    // Export products data (utility method)
    exportProducts(format = 'json') {
        try {
            const dataToExport = this.filteredProducts.map(product => ({
                id: product.id,
                title: product.title,
                category: this.getCategoryName(product),
                price: product.price,
                stock: product.stock,
                status: this.getStatusText(product.active),
                color: this.getColorText(product),
                size: this.getSizeText(product)
            }));

            if (format === 'csv') {
                const csvContent = this.convertToCSV(dataToExport);
                this.downloadFile(csvContent, 'products.csv', 'text/csv');
            } else {
                const jsonContent = JSON.stringify(dataToExport, null, 2);
                this.downloadFile(jsonContent, 'products.json', 'application/json');
            }
            
            this.showNotification('تم تصدير البيانات بنجاح', 'success');
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            this.showNotification('فشل في تصدير البيانات', 'error');
        }
    }

    // Convert data to CSV format
    convertToCSV(data) {
        if (!data.length) return '';

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ];

        return csvRows.join('\n');
    }

    // Download file utility
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Get statistics about products
    getStatistics() {
        const stats = {
            total: this.allProducts.length,
            active: this.allProducts.filter(p => this.getStatusClass(p.active) === 'active').length,
            inactive: this.allProducts.filter(p => this.getStatusClass(p.active) === 'inactive').length,
            outOfStock: this.allProducts.filter(p => parseInt(p.stock) === 0).length,
            lowStock: this.allProducts.filter(p => {
                const stock = parseInt(p.stock);
                return stock > 0 && stock <= 5;
            }).length,
            categories: [...new Set(this.allProducts.map(p => this.getCategoryName(p)))].length
        };

        return stats;
    }

    // Display statistics
    displayStatistics() {
        const stats = this.getStatistics();
        const statsHtml = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${stats.total}</h3>
                    <p>إجمالي المنتجات</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.active}</h3>
                    <p>منتجات نشطة</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.inactive}</h3>
                    <p>منتجات غير نشطة</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.outOfStock}</h3>
                    <p>نفد المخزون</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.lowStock}</h3>
                    <p>مخزون منخفض</p>
                </div>
                <div class="stat-card">
                    <h3>${stats.categories}</h3>
                    <p>الفئات</p>
                </div>
            </div>
        `;

        // Show in modal or designated area
        this.showModal('إحصائيات المنتجات', statsHtml);
    }

    // Show modal utility
    showModal(title, content) {
        // Remove existing modal
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();

        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h2>${this.escapeHtml(title)}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Close modal functionality
        const modal = document.querySelector('.modal-overlay');
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // ESC key to close
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }

    // Cleanup method
    destroy() {
        // Remove event listeners and clean up
        Object.values(this.domElements).forEach(element => {
            if (element && element.removeEventListener) {
                // Remove all event listeners (would need to track them)
                element.replaceWith(element.cloneNode(true));
            }
        });
        
        // Clear data
        this.allProducts = [];
        this.filteredProducts = [];
        this.categories = [];
        this.domElements = {};
    }
}

// Initialize product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productManager = new ProductManager();
});

// Legacy function support (for existing onclick handlers)
function DeleteProduct(productId) {
    if (window.productManager) {
        window.productManager.deleteProduct(productId);
    }
}

function EditProduct(productId) {
    window.location.href = `/dashboard/product-edit.html?id=${productId}`;
}


function ToggleProductStatus(productId) {
    if (window.productManager) {
        window.productManager.toggleProductStatus(productId);
    }
}

// Additional utility functions for external use
window.ProductManagerUtils = {
    exportProducts: (format) => {
        if (window.productManager) {
            window.productManager.exportProducts(format);
        }
    },
    showStatistics: () => {
        if (window.productManager) {
            window.productManager.displayStatistics();
        }
    },
    refreshProducts: () => {
        if (window.productManager) {
            window.productManager.refresh();
        }
    },
    resetFilters: () => {
        if (window.productManager) {
            window.productManager.resetFilters();
        }
    }
};