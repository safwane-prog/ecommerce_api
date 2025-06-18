document.addEventListener("DOMContentLoaded", () => {
    const cartItemsContainer = document.getElementById("cart_items");
    const subtotalElem = document.getElementById("subtotal");
    const discountElem = document.getElementById("discount");
    const deliveryElem = document.getElementById("delivery");
    const totalElem = document.getElementById("total");
    const discountNumber = document.getElementById("Discount_number");

    const DISCOUNT_PERCENT = 10; // خصم 10%
    const DELIVERY_FEE = 30;     // سعر التوصيل ثابت

    fetch("/api/cart/", {
        method: "GET",
        credentials: "include", // لإرسال الكوكيز
    })
    .then(res => {
        if (!res.ok) throw new Error("فشل في تحميل السلة");
        return res.json();
    })
    .then(data => {
        cartItemsContainer.innerHTML = ""; // تفريغ السلة الحالية
        let subtotal = 0;
        console.log(data)
        data.forEach(item => {
            const { product, quantity, get_total_price } = item;
            subtotal += get_total_price;

            const itemDiv = document.createElement("div");
            itemDiv.classList.add("cart-item");
            itemDiv.innerHTML = `
                <button class="delete-btn">🗑️</button>
                <img src="${product.image_1}" alt="${product.title}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${product.title}</div>
                    <div class="item-specs">Size: M<br>Color: Default</div>
                    <div class="item-price">$${product.price}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn">-</button>
                    <span class="quantity">${quantity}</span>
                    <button class="quantity-btn">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });

        // الحسابات
        const discountAmount = (subtotal * DISCOUNT_PERCENT) / 100;
        const total = subtotal - discountAmount + DELIVERY_FEE;

        // التحديث في HTML
        subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
        discountElem.textContent = `-$${discountAmount.toFixed(2)}`;
        deliveryElem.textContent = `$${DELIVERY_FEE.toFixed(2)}`;
        totalElem.textContent = `$${total.toFixed(2)}`;
        discountNumber.textContent = DISCOUNT_PERCENT;
    })
    .catch(error => {
        cartItemsContainer.innerHTML = "<p>فشل في تحميل العربة</p>";
        console.error(error);
    });
});


