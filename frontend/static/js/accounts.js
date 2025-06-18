document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = '/api/users/profile/';
    let userData = null;

    // Fetch profile data
    async function fetchProfileData() {
        try {
            const response = await fetch(API_BASE_URL, {
                headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' } // Replace with actual token
            });
            if (!response.ok) throw new Error('Failed to fetch profile data');
            userData = await response.json();
            populateProfileData();
        } catch (error) {
            console.error('Error fetching profile:', error);
            alert('Failed to load profile data. Please try again.');
        }
    }

    // Populate profile data across sections
    function populateProfileData() {
        if (!userData) return;

        // Sidebar
        document.getElementById('user-name').textContent = `${userData.profile.first_name} ${userData.profile.last_name}`;
        document.getElementById('user-email').textContent = userData.profile.email;
        if (userData.profile.profile_picture) {
            document.getElementById('profile-picture').src = userData.profile.profile_picture;
        }
        // Dashboard
        document.getElementById('total-orders').textContent = userData.orders.length;
        document.getElementById('wishlist-count').textContent = userData.wishlist.length;
        document.getElementById('reviews-count').textContent = userData.reviews.length;
        document.getElementById('total-spent').textContent = `$${userData.orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0).toFixed(2)}`;

        // Profile Form
        document.getElementById('firstName').value = userData.profile.first_name;
        document.getElementById('lastName').value = userData.profile.last_name;
        document.getElementById('email').value = userData.profile.email;
        document.getElementById('phone').value = userData.profile.phone;
        document.getElementById('address').value = userData.profile.address;

        // Recent Orders (Dashboard)
        const recentOrders = document.getElementById('recent-orders');
        recentOrders.innerHTML = userData.orders.slice(0, 3).map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status status-${order.is_paid ? 'delivered' : 'pending'}">${order.is_paid ? 'Delivered' : 'Pending'}</span>
                </div>
                <p>Order placed on ${new Date(order.created_at).toLocaleDateString()}</p>
            </div>
        `).join('');

        // Orders Section
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = userData.orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">Order #${order.id}</span>
                    <span class="order-status status-${order.is_paid ? 'delivered' : 'pending'}">${order.is_paid ? 'Delivered' : 'Pending'}</span>
                </div>
                <div class="order-details">
                    <div class="order-detail">
                        <span>Order Date</span>
                        <strong>${new Date(order.created_at).toLocaleDateString()}</strong>
                    </div>
                    <div class="order-detail">
                        <span>Total Amount</span>
                        <strong>$${order.total_price}</strong>
                    </div>
                    <div class="order-detail">
                        <span>Status</span>
                        <strong>${order.is_paid ? 'Paid' : 'Payment Pending'}</strong>
                    </div>
                </div>
            </div>
        `).join('');

        // Wishlist Section (Placeholder, as API returns empty wishlist)
        const wishlistGrid = document.getElementById('wishlist-grid');
        wishlistGrid.innerHTML = userData.wishlist.length === 0 ? '<p>No items in your wishlist.</p>' : '';

        // Reviews Section (Placeholder, as API returns empty reviews)
        const reviewsList = document.getElementById('reviews-list');
        reviewsList.innerHTML = userData.reviews.length === 0 ? '<p>No reviews yet.</p>' : '';
    }

    // Handle profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const saveButton = this.querySelector('.btn-save');
            saveButton.textContent = 'Saving...';
            saveButton.disabled = true;

            const formData = new FormData();
            formData.append('first_name', document.getElementById('firstName').value);
            formData.append('last_name', document.getElementById('lastName').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('phone', document.getElementById('phone').value);
            formData.append('address', document.getElementById('address').value);
            const profilePicture = document.getElementById('profile-picture-input').files[0];
            if (profilePicture) formData.append('profile_picture', profilePicture);

            try {
                const response = await fetch(`${API_BASE_URL}update/`, {
                    method: 'PATCH',
                    headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }, // Replace with actual token
                    body: formData
                });
                if (!response.ok) throw new Error('Failed to update profile');
                saveButton.textContent = 'Saved!';
                saveButton.style.backgroundColor = '#28a745';
                setTimeout(() => {
                    saveButton.textContent = 'Save Changes';
                    saveButton.style.backgroundColor = '';
                    saveButton.disabled = false;
                    fetchProfileData(); // Refresh data after update
                }, 2000);
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('Failed to update profile. Please try again.');
                saveButton.textContent = 'Save Changes';
                saveButton.disabled = false;
            }
        });
    }

    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });

    // Logout functionality
    function logout() {
        if (confirm('Are you sure you want to logout?')) {
            document.querySelector('.loader-container').style.display = 'flex';
            setTimeout(() => {
                alert('You have been logged out successfully!');
                window.location.href = '/login';
            }, 2000);
        }
    }

    // Initialize
    fetchProfileData();
});