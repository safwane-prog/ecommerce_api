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

document.getElementById("contactForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    // Check if user is logged in
    const isLoggedIn = await checkLoginStatus();
    if (!isLoggedIn) {
        // Create login prompt card
        const loginCard = document.createElement("div");
        loginCard.className = "login-card";
        loginCard.innerHTML = `
            <div class="login-card-content">
                <svg class="login-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#e74c3c"/>
                </svg>
                <h2>Please Log In</h2>
                <p>You need to be logged in to send a message. Please log in or register to continue.</p>
                <button class="login-btn">Log In</button>
                <button class="register-btn">Register</button>
                <button class="close-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="#4a5568" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(loginCard);

        // Add animation class
        setTimeout(() => {
            loginCard.classList.add("show");
        }, 100);

        // Close button functionality
        loginCard.querySelector(".close-btn").addEventListener("click", () => {
            loginCard.classList.remove("show");
            setTimeout(() => {
                loginCard.remove();
            }, 500); // Match animation duration
        });

        // Login button functionality (redirect to login page)
        loginCard.querySelector(".login-btn").addEventListener("click", () => {
            window.location.href = "/login"; // Adjust the login URL as needed
        });

        // Register button functionality (redirect to register page)
        loginCard.querySelector(".register-btn").addEventListener("click", () => {
            window.location.href = "/register"; // Adjust the register URL as needed
        });
        return; // Stop form submission
    }

    const formData = {
        first_name: document.getElementById("firstName").value.trim(),
        last_name: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        subject: document.getElementById("subject").value.trim(),
        message: document.getElementById("message").value.trim(),
    };

    try {
        const response = await fetch("/api/contact/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // Create success card
            const successCard = document.createElement("div");
            successCard.className = "success-card";
            successCard.innerHTML = `
                <div class="success-card-content">
                    <svg class="success-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#3498db"/>
                    </svg>
                    <h2>Message Sent Successfully!</h2>
                    <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
                    <button class="close-btn">Close</button>
                </div>
            `;
            document.body.appendChild(successCard);

            // Add animation class
            setTimeout(() => {
                successCard.classList.add("show");
            }, 100);

            // Close button functionality
            successCard.querySelector(".close-btn").addEventListener("click", () => {
                successCard.classList.remove("show");
                setTimeout(() => {
                    successCard.remove();
                }, 500); // Match animation duration
            });

            // Reset form
            document.getElementById("contactForm").reset();
        } else {
            const errorData = await response.json();
            alert("Error: " + (errorData.detail || "Could not send message."));
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("An unexpected error occurred. Please try again later.");
    }
});

// Fetch contact settings
async function loadContactSettings() {
    try {
        const response = await fetch('/Board_api/contact-settings/');
        const data = await response.json();

        if (data.length > 0) {
            const contact = data[0];
            const elements = {
                Address: document.getElementById('Address'),
                city: document.getElementById('city'),
                Phone: document.getElementById('Phone'),
                Email: document.getElementById('Email'),
                Email_2: document.getElementById('Email_2'),
                youtube: document.getElementById('youtube'),
                instagram: document.getElementById('instagram'),
                facebook: document.getElementById('facebook'),
                whatsapp: document.getElementById('whatsapp')
            };

            // Helper function to handle visibility
            const toggleVisibility = (element, value, fallbackId) => {
                if (value && value.trim()) {
                    element.textContent = value;
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                    document.getElementById(fallbackId).style.display = 'block';
                }
            };

            // Handle contact information
            toggleVisibility(elements.Address, contact.address, 'address-fallback');
            toggleVisibility(elements.city, contact.city, 'address-fallback');
            toggleVisibility(elements.Phone, contact.phone, 'phone-fallback');
            toggleVisibility(elements.Email, contact.primary_email, 'email-fallback');
            toggleVisibility(elements.Email_2, contact.secondary_email, 'email-fallback');

            // Handle social links
            const socialLinks = [
                { element: elements.youtube, url: contact.youtube },
                { element: elements.instagram, url: contact.instagram },
                { element: elements.facebook, url: contact.facebook },
                { element: elements.whatsapp, url: contact.whatsapp }
            ];

            socialLinks.forEach(({ element, url }) => {
                element.href = url && url.trim() ? url : '#';
                if (element.href === '#' || element.href.includes('#')) {
                    element.classList.add('disabled');
                    element.style.pointerEvents = 'none';
                    element.style.opacity = '0.5';
                }
            });
        } else {
            console.error("No contact data found");
            showFallbacks();
        }
    } catch (error) {
        console.error('Error loading contact data:', error);
        showFallbacks();
    }
}

// Show fallback texts for all fields
function showFallbacks() {
    const fallbacks = [
        { element: 'Address', fallback: 'address-fallback' },
        { element: 'city', fallback: 'address-fallback' },
        { element: 'Phone', fallback: 'phone-fallback' },
        { element: 'Email', fallback: 'email-fallback' },
        { element: 'Email_2', fallback: 'email-fallback' }
    ];

    fallbacks.forEach(({ element, fallback }) => {
        document.getElementById(element).style.display = 'none';
        document.getElementById(fallback).style.display = 'block';
    });
}

// Initialize contact settings
loadContactSettings();

// Add CSS for success and login cards
const style = document.createElement('style');
style.textContent = `
    .success-card, .login-card {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.5);
        background: white;
        border-radius: 16px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        opacity: 0;
        visibility: hidden;
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        z-index: 1000;
        max-width: 90%;
        width: 420px;
    }

    .success-card.show, .login-card.show {
        opacity: 1;
        visibility: visible;
        transform: translate(-50%, -50%) scale(1);
    }

    .success-card-content, .login-card-content {
        padding: 2.5rem;
        text-align: center;
    }

    .success-icon, .login-icon {
        display: block;
        margin: 0 auto 1.5rem;
        animation: iconBounce 0.6s ease-in-out;
    }

    @keyframes iconBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    .success-card h2, .login-card h2 {
        font-size: 2rem;
        color: #2c3e50;
        margin-bottom: 1rem;
        font-weight: 700;
        animation: fadeIn 0.5s ease-in 0.2s forwards;
        opacity: 0;
    }

    .success-card p, .login-card p {
        font-size: 1.1rem;
        color: #4a5568;
        margin-bottom: 2rem;
        animation: fadeIn 0.5s ease-in 0.3s forwards;
        opacity: 0;
    }

    @keyframes fadeIn {
        to { opacity: 1; }
    }

    .close-btn, .login-btn, .register-btn {
        background: #3498db;
        color: white;
        border: none;
        padding: 0.9rem 2rem;
        border-radius: 10px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.3s ease;
        animation: fadeIn 0.5s ease-in 0.4s forwards;
        opacity: 0;
        margin: 0 0.5rem;
    }

    .login-btn {
        background: #e74c3c;
    }

    .register-btn {
        background: #2ecc71;
    }

    .close-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 0.5rem;
        background: transparent;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-btn svg {
        width: 20px;
        height: 20px;
    }

    .close-btn:hover, .login-btn:hover, .register-btn:hover {
        transform: translateY(-2px);
    }

    .login-btn:hover {
        background: #c0392b;
        box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
    }

    .register-btn:hover {
        background: #27ae60;
        box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
    }

    .close-btn:hover {
        background: #f1f1f1;
        box-shadow: none;
    }

    @media (max-width: 480px) {
        .success-card, .login-card {
            width: 90%;
        }

        .success-card h2, .login-card h2 {
            font-size: 1.6rem;
        }

        .success-card p, .login-card p {
            font-size: 1rem;
        }

        .success-card-content, .login-card-content {
            padding: 2rem;
        }

        .close-btn {
            top: 5px;
            right: 5px;
        }
    }
`;
document.head.appendChild(style);