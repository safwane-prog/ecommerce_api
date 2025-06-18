document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ email, username, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = 'تم إنشاء الحساب بنجاح! يتم توجيهك الآن...';
                registerMessage.className = 'message success';
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            } else {
                registerMessage.textContent = data.message || 'حدث خطأ أثناء التسجيل';
                registerMessage.className = 'message error';
            }
        } catch (error) {
            registerMessage.textContent = 'حدث خطأ في الاتصال بالخادم';
            registerMessage.className = 'message error';
            console.error('Error:', error);
        }
    });

    // دالة مساعدة للحصول على قيمة cookie
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
});