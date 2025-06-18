document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    const saveButtons = document.querySelectorAll('.btn-save');
    const deleteButtons = document.querySelectorAll('.btn-delete');
    const notification = document.getElementById('notification');
    const apiBaseUrl = '/Board_api/';

    // Show notification
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000); // Hide after 3 seconds
    }

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
            fetchTabData(tab.dataset.tab);
        });
    });

    // Preview images
    function setupImagePreview(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        input.addEventListener('change', () => {
            const file = input.files[0];
            if (file) {
                preview.src = URL.createObjectURL(file);
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        });
    }

    setupImagePreview('admin-image', 'admin-image-preview');
    setupImagePreview('about-image-1', 'about-image-1-preview');
    setupImagePreview('logo', 'logo-preview');
    setupImagePreview('banner-image', 'banner-image-preview');

    // Get CSRF token from cookies
    function getCSRFToken() {
        const name = 'csrftoken';
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith(name))
            ?.split('=')[1];
        return cookieValue || '';
    }

    // Fetch data for a specific tab
    async function fetchTabData(tab) {
        let endpoint;
        switch (tab) {
            case 'admin-profile': endpoint = 'admin-profile'; break;
            case 'contact-settings': endpoint = 'contact-settings'; break;
            case 'about': endpoint = 'about'; break;
            case 'home-settings': endpoint = 'home-settings'; break;
            default: return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}${endpoint}/`, {
                headers: { 'X-CSRFToken': getCSRFToken() }
            });
            if (!response.ok) throw new Error(`Failed to fetch ${tab} data: ${response.status}`);
            const data = await response.json();
            console.log(`Fetched ${tab} data:`, data);
            const record = Array.isArray(data) ? (data.length > 0 ? data[0] : {}) : (data.results && data.results.length > 0 ? data.results[0] : data);
            populateForm(tab, record);
        } catch (error) {
            console.error(`Error fetching ${tab} data:`, error);
            alert(`Failed to load ${tab} data. Please try again.`);
            populateForm(tab, {});
        }
    }

    // Populate form fields with API data
    function populateForm(tab, data) {
        switch (tab) {
            case 'admin-profile':
                document.getElementById('admin-profile-id').value = data.id || '';
                document.getElementById('admin-username').value = data.username || '';
                document.getElementById('admin-email').value = data.email || '';
                document.getElementById('admin-first-name').value = data.first_name || '';
                document.getElementById('admin-last-name').value = data.last_name || '';
                if (data.Admin_image) {
                    document.getElementById('admin-image-preview').src = data.Admin_image;
                    document.getElementById('admin-image-preview').style.display = 'block';
                } else {
                    document.getElementById('admin-image-preview').style.display = 'none';
                }
                break;
            case 'contact-settings':
                document.getElementById('contact-settings-id').value = data.id || '';
                document.getElementById('contact-address').value = data.address || '';
                document.getElementById('contact-city').value = data.city || '';
                document.getElementById('contact-phone').value = data.phone || '';
                document.getElementById('contact-primary-email').value = data.primary_email || '';
                document.getElementById('contact-secondary-email').value = data.secondary_email || '';
                document.getElementById('contact-instagram').value = data.instagram || '';
                document.getElementById('contact-youtube').value = data.youtube || '';
                document.getElementById('contact-facebook').value = data.facebook || '';
                document.getElementById('contact-whatsapp').value = data.whatsapp || '';
                break;
            case 'about':
                document.getElementById('about-id').value = data.id || '';
                document.getElementById('about-title').value = data.title || '';
                document.getElementById('about-description').value = data.description || '';
                document.getElementById('about-paragraph-1').value = data.paragraph_1 || '';
                document.getElementById('about-paragraph-2').value = data.paragraph_2 || '';
                document.getElementById('about-paragraph-3').value = data.paragraph_3 || '';
                if (data.image_1) {
                    document.getElementById('about-image-1-preview').src = data.image_1;
                    document.getElementById('about-image-1-preview').style.display = 'block';
                } else {
                    document.getElementById('about-image-1-preview').style.display = 'none';
                }
                break;
            case 'home-settings':
                document.getElementById('home-settings-id').value = data.id || '';
                document.getElementById('site-title').value = data.site_title || '';
                document.getElementById('site-description').value = data.site_description || '';
                document.getElementById('welcome-message').value = data.welcome_message || '';
                if (data.logo) {
                    document.getElementById('logo-preview').src = data.logo;
                    document.getElementById('logo-preview').style.display = 'block';
                } else {
                    document.getElementById('logo-preview').style.display = 'none';
                }
                if (data.banner_image) {
                    document.getElementById('banner-image-preview').src = data.banner_image;
                    document.getElementById('banner-image-preview').style.display = 'block';
                } else {
                    document.getElementById('banner-image-preview').style.display = 'none';
                }
                break;
        }
    }

    // Save form data to API
    async function saveTabData(tab) {
        let endpoint, formData = new FormData();
        const id = document.getElementById(`${tab}-id`).value;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiBaseUrl}${tab}/${id}/` : `${apiBaseUrl}${tab}/`;

        switch (tab) {
            case 'admin-profile':
                endpoint = 'admin-profile';
                formData.append('username', document.getElementById('admin-username').value);
                formData.append('email', document.getElementById('admin-email').value);
                formData.append('first_name', document.getElementById('admin-first-name').value);
                formData.append('last_name', document.getElementById('admin-last-name').value);
                const adminImage = document.getElementById('admin-image').files[0];
                if (adminImage) {
                    formData.append('Admin_image', adminImage);
                }
                break;
            case 'contact-settings':
                endpoint = 'contact-settings';
                formData.append('address', document.getElementById('contact-address').value);
                formData.append('city', document.getElementById('contact-city').value);
                formData.append('phone', document.getElementById('contact-phone').value);
                formData.append('primary_email', document.getElementById('contact-primary-email').value);
                formData.append('secondary_email', document.getElementById('contact-secondary-email').value);
                formData.append('instagram', document.getElementById('contact-instagram').value);
                formData.append('youtube', document.getElementById('contact-youtube').value);
                formData.append('facebook', document.getElementById('contact-facebook').value);
                formData.append('whatsapp', document.getElementById('contact-whatsapp').value);
                break;
            case 'about':
                endpoint = 'about';
                formData.append('title', document.getElementById('about-title').value);
                formData.append('description', document.getElementById('about-description').value);
                formData.append('paragraph_1', document.getElementById('about-paragraph-1').value);
                formData.append('paragraph_2', document.getElementById('about-paragraph-2').value);
                formData.append('paragraph_3', document.getElementById('about-paragraph-3').value);
                const aboutImage = document.getElementById('about-image-1').files[0];
                if (aboutImage) formData.append('image_1', aboutImage);
                break;
            case 'home-settings':
                endpoint = 'home-settings';
                formData.append('site_title', document.getElementById('site-title').value);
                formData.append('site_description', document.getElementById('site-description').value);
                formData.append('welcome_message', document.getElementById('welcome-message').value);
                const logo = document.getElementById('logo').files[0];
                if (logo) formData.append('logo', logo);
                const bannerImage = document.getElementById('banner-image').files[0];
                if (bannerImage) formData.append('banner_image', bannerImage);
                break;
            default: return;
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'X-CSRFToken': getCSRFToken() },
                body: formData
            });
            const responseData = await response.json();
            console.log(`Save ${tab} response:`, responseData);
            if (!response.ok) throw new Error(`Failed to save ${tab} data: ${response.status}`);
            showNotification('Settings saved successfully!');
            fetchTabData(tab);
            if (tab === 'admin-profile') document.getElementById('admin-image').value = '';
        } catch (error) {
            console.error(`Error saving ${tab} data:`, error);
            alert(`Failed to save ${tab} settings. Please try again.`);
        }
    }

    // Delete data from API
    async function deleteTabData(tab) {
        const id = document.getElementById(`${tab}-id`).value;
        if (!id) {
            alert('No record to delete.');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${tab} settings?`)) return;

        try {
            const response = await fetch(`${apiBaseUrl}${tab}/${id}/`, {
                method: 'DELETE',
                headers: { 'X-CSRFToken': getCSRFToken() }
            });
            if (!response.ok) throw new Error(`Failed to delete ${tab} data: ${response.status}`);
            showNotification('Settings deleted successfully!');
            fetchTabData(tab);
        } catch (error) {
            console.error(`Error deleting ${tab} data:`, error);
            alert(`Failed to delete ${tab} settings. Please try again.`);
        }
    }

    // Save button click handlers
    saveButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            saveTabData(tab);
        });
    });

    // Delete button click handlers
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            deleteTabData(tab);
        });
    });

    // Fetch data for the initial active tab
    fetchTabData('admin-profile');
}); 