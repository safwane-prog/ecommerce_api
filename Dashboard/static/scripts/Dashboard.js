document.addEventListener('DOMContentLoaded', function() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Sales',
                data: [12000, 19000, 15000, 18000, 22000, 20000, 24000],
                backgroundColor: 'rgba(108, 92, 231, 0.2)',
                borderColor: 'rgba(108, 92, 231, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    const revenueChart = new Chart(revenueCtx, {
        type: 'doughnut',
        data: {
            labels: ['Electronics', 'Fashion', 'Home & Garden', 'Beauty', 'Sports'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#6c5ce7',
                    '#a29bfe',
                    '#74b9ff',
                    '#55efc4',
                    '#ffeaa7'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Period selector change
    document.getElementById('sales-period').addEventListener('change', function() {
        alert('Period changed to: ' + this.value + '\nIn a real app, this would update the chart data.');
    });

    // Toggle sidebar on small screens
    const sidebarToggle = document.createElement('div');
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    sidebarToggle.style.position = 'fixed';
    sidebarToggle.style.top = '20px';
    sidebarToggle.style.left = '20px';
    sidebarToggle.style.zIndex = '101';
    sidebarToggle.style.fontSize = '20px';
    sidebarToggle.style.color = '#333';
    sidebarToggle.style.cursor = 'pointer';
    sidebarToggle.style.display = 'none';
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

    // دالة لتحديث الإحصائيات من API واحد
    function fetchDashboardStats() {
        fetch('/Board_api/dashboard/stats/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dashboard stats loaded:', data);
                updateStatistics(data);
            })
            .catch(error => {
                console.error('Error fetching dashboard statistics:', error);
                // عرض رسالة خطأ للمستخدم
                showErrorMessage('فشل في تحميل الإحصائيات');
            });
    }

    // دالة تحديث جميع الإحصائيات
    function updateStatistics(stats) {
        try {
            // تحديث عدد المنتجات
            updateElement('product-count', stats.total_products);
            updateElementWithGrowth('product-growth', stats.product_growth_percentage);
            
            // تحديث عدد العملاء
            updateElement('customers-count', stats.total_users);
            updateElementWithGrowth('customer-growth', stats.user_growth_percentage);
            
            // تحديث عدد الطلبات
            updateElement('orders-count', stats.total_orders);
            updateElementWithGrowth('orders-growth', stats.order_growth_percentage);
            
            // تحديث الإيرادات
            updateElement('revenue-amount', `$${stats.total_revenue.toFixed(2)}`);
            
            // تحديث الطلبات المدفوعة
            updateElement('paid-orders-count', `$${stats.paid_orders_count}`);
            
            // تحديث الإحصائيات الشهرية
            updateElement('new-products-month', stats.new_products_last_month);
            updateElement('new-orders-month', stats.new_orders_last_month);
            updateElement('new-users-month', stats.new_users_last_month);

            // تحديث الرسوم البيانية بناءً على البيانات الجديدة
            updateChartsWithStats(stats);
            
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }

    // دالة مساعدة لتحديث العناصر
    function updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with ID '${elementId}' not found`);
        }
    }

    // دالة لتحديث العناصر مع نسبة النمو
    function updateElementWithGrowth(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (element) {
            const growthText = percentage > 0 ? `+${percentage.toFixed(1)}%` : `${percentage.toFixed(1)}%`;
            element.textContent = growthText;
            
            // إضافة كلاس حسب نوع النمو
            element.className = percentage > 0 ? 'growth-positive' : 
                              percentage < 0 ? 'growth-negative' : 'growth-neutral';
        }
    }

    // دالة لتحديث الرسوم البيانية بناءً على الإحصائيات
    function updateChartsWithStats(stats) {
        // يمكنك تحديث بيانات الرسوم البيانية هنا
        // مثال: تحديث مخطط المبيعات بناءً على الإيرادات
        if (stats.total_revenue > 0) {
            // تحديث بيانات الرسم البياني للمبيعات
            const newSalesData = generateSalesDataFromRevenue(stats.total_revenue);
            salesChart.data.datasets[0].data = newSalesData;
            salesChart.update();
        }
    }

    // دالة لتوليد بيانات المبيعات من الإيرادات
    function generateSalesDataFromRevenue(totalRevenue) {
        const months = 7;
        const avgRevenue = totalRevenue / months;
        const variation = 0.3; // 30% تباين
        
        return Array.from({ length: months }, (_, i) => {
            const randomFactor = 1 + (Math.random() - 0.5) * variation;
            return Math.round(avgRevenue * randomFactor);
        });
    }

    // دالة لعرض رسائل الخطأ
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f8d7da;
            color: #721c24;
            padding: 12px 20px;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            z-index: 1000;
            font-weight: bold;
        `;
        
        document.body.appendChild(errorDiv);
        
        // إزالة الرسالة بعد 5 ثوان
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // دالة لإعادة تحميل الإحصائيات (يمكن استدعاؤها من أي مكان)
    function refreshStats() {
        fetchDashboardStats();
    }

    // إضافة دالة للتحديث التلقائي كل 5 دقائق
    function startAutoRefresh() {
        setInterval(fetchDashboardStats, 5 * 60 * 1000); // كل 5 دقائق
    }

    // جلب الإحصائيات عند تحميل الصفحة
    fetchDashboardStats();
    
    // بدء التحديث التلقائي
    startAutoRefresh();

    // جعل دالة التحديث متاحة عالمياً
    window.refreshDashboardStats = refreshStats;

    // Fetch and display orders (الكود الأصلي للطلبات)
    fetch('/api/admin/orders/')
        .then(response => response.json())
        .then(data => {
            const orderTable = document.getElementById('orders-tbody');
            if (orderTable) {
                orderTable.innerHTML = '';
                
                data.slice(0, 5).forEach(order => {
                    const status = order.is_paid ? "Shipped" : "Processing";
                    const statusClass = order.is_paid ? "shipped" : "processing";
                    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>#ORD-${order.id}</td>
                        <td>${order.user.username}</td>
                        <td>${orderDate}</td>
                        <td>$${order.total_price}</td>
                        <td><span class="status ${statusClass}">${status}</span></td>
                        <td><button class="btn-view" data-order-id="${order.id}">View</button></td>
                    `;
                    orderTable.appendChild(row);
                });

                // Add event listeners to view buttons
                document.querySelectorAll('.btn-view').forEach(button => {
                    button.addEventListener('click', function() {
                        const orderId = this.getAttribute('data-order-id');
                        viewOrderDetails(orderId, data);
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
        });

    // Function to view order details (الكود الأصلي)
    function viewOrderDetails(orderId, ordersData) {
        const order = ordersData.find(o => o.id == orderId);
        if (!order) return;

        // Format date
        const orderDate = new Date(order.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Create order items HTML
        let orderItemsHTML = '';
        order.items.forEach(item => {
            const itemDate = new Date(item.added_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            orderItemsHTML += `
                <div class="item">
                    <div class="item-image">
                        <img src="${item.product.image_1 || '/media/default-product.png'}" alt="${item.product.title}">
                    </div>
                    <div class="item-details">
                        <h4>${item.product.title}</h4>
                        <p><strong>Price:</strong> $${item.product.price}${item.product.discount ? ` (${item.product.discount}% discount)` : ''}</p>
                        <p><strong>Quantity:</strong> ${item.quantity}</p>
                        <p><strong>Total:</strong> $${item.get_total_price}</p>
                        ${item.product.color ? `<p><strong>Color:</strong> ${item.product.color.color}</p>` : ''}
                        ${item.product.size ? `<p><strong>Size:</strong> ${item.product.size.size}</p>` : ''}
                        ${item.product.Clothing_Categories?.length ? `<p><strong>Category:</strong> ${item.product.Clothing_Categories[0].category}</p>` : ''}
                        <p><strong>Added:</strong> ${itemDate}</p>
                    </div>
                </div>
            `;
        });

        // Create modal with order details
        const modal = document.createElement('div');
        modal.className = 'order-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <div class="order-container">
                    <div class="order-header">
                        <h2>Order #${order.id}</h2>
                        <p class="order-date">Created at: ${orderDate}</p>
                        <p class="order-status">Payment Status: ${order.is_paid ? 'Paid' : 'Not Paid'}</p>
                    </div>

                    <div class="customer-info">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.first_name} ${order.last_name}</p>
                        <p><strong>Email:</strong> ${order.email}</p>
                        <p><strong>Phone:</strong> ${order.phone}</p>
                        <p><strong>Address:</strong> ${order.address}</p>
                        
                        <div class="user-account">
                            <h4>User Account Details</h4>
                            <p><strong>Username:</strong> ${order.user.username}</p>
                            <p><strong>Email:</strong> ${order.user.email}</p>
                        </div>
                    </div>

                    <div class="order-items">
                        <h3>Order Items (${order.items.length})</h3>
                        ${orderItemsHTML}
                    </div>

                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <p><strong>Total:</strong> $${order.total_price}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .order-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
            }
            .close-modal {
                position: absolute;
                top: 10px;
                right: 20px;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            .status {
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .status.shipped {
                background-color: #d4edda;
                color: #155724;
            }
            .status.processing {
                background-color: #fff3cd;
                color: #856404;
            }
            .error-message {
                animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .growth-positive { color: #28a745; }
            .growth-negative { color: #dc3545; }
            .growth-neutral { color: #6c757d; }
        `;
        document.head.appendChild(style);

        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', function() {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }
});