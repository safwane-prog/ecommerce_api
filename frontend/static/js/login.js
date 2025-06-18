async function authenticatedFetch(url, options = {}) {
    // Ensure credentials are included
    options.credentials = 'include';
    
    try {
        let response = await fetch(url, options);
        
        // Check if token was refreshed in the background
        if (response.headers.get('X-Token-Refreshed') || 
            (response.ok && await response.clone().json().then(data => data.token_refreshed).catch(() => false))) {
            console.log('Token was automatically refreshed');
        }
        
        return response;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
}


    async function register() {
        try {
            const response = await fetch("/api/users/register/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username: document.getElementById("reg-username").value,
                    email: document.getElementById("reg-email").value,
                    password: document.getElementById("reg-password").value
                }),
                credentials: "include"
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert("تم التسجيل بنجاح!");
                // Clear form
                document.getElementById("reg-username").value = "";
                document.getElementById("reg-email").value = "";
                document.getElementById("reg-password").value = "";
            } else {
                alert("خطأ في التسجيل: " + JSON.stringify(data));
            }
        } catch (error) {
            alert("حدث خطأ أثناء التسجيل");
            console.error(error);
        }
    }
    async function login() {
    try {
        const response = await fetch("/api/users/login/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: document.getElementById("login-username").value,
                password: document.getElementById("login-password").value
            }),
            credentials: "include"
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert("تم تسجيل الدخول بنجاح!");
            // Clear form
            document.getElementById("login-username").value = "";
            document.getElementById("login-password").value = "";
            
            // Update UI to show logged in state
            updateLoginUI(true);
        } else {
            alert("خطأ في تسجيل الدخول: " + data.error);
        }
    } catch (error) {
        alert("حدث خطأ أثناء تسجيل الدخول");
        console.error(error);
    }
}

    async function logout() {
    try {
        const response = await fetch("/api/users/logout/", {
            method: "POST",
            credentials: "include"
        });
        
        const data = await response.json();
        alert(data.msg);
        
        // Update UI to show logged out state
        updateLoginUI(false);
        
        // Clear any cached data
        clearUserData();
        
    } catch (error) {
        alert("حدث خطأ أثناء تسجيل الخروج");
        console.error(error);
    }
}


    async function getProtected() {
    try {
        const response = await authenticatedFetch("/api/users/protected/");
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById("protected-data").textContent = data.msg;
        } else if (response.status === 401) {
            alert("يجب تسجيل الدخول أولاً");
            updateLoginUI(false);
        } else {
            const data = await response.json();
            alert("خطأ: " + (data.error || "حدث خطأ غير متوقع"));
        }
    } catch (error) {
        alert("حدث خطأ أثناء جلب البيانات");
        console.error(error);
    }
}
async function refreshToken() {
    try {
        const response = await fetch("/api/users/refresh/", {
            method: "POST",
            credentials: "include"
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log("Token refreshed manually:", data.msg);
            return true;
        } else {
            console.log("Failed to refresh token");
            updateLoginUI(false);
            return false;
        }
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}