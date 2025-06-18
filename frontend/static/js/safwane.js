
// // ==============Show All Product ====================
// Showloader()
// // .fetch('/api/get_sizes/')
// // .then(res => res.json())
// // .then(data => {
// //     const size = document.getElementById('size')
// //     size.innerHTML = ``;
// //     data.forEach(size => {
// //         color.innerHTML =+ `
// //             <div class="size-options">${items.size}</div>
// //         `
// //     })
// // })
// // .fetch('/api/get_colors/')
// // .then(res => res.json())
// // .then(data => {
// //     const color = document.getElementById('color')
// //     color.innerHTML = ``;
// //     data.forEach(items => {
// //         color.innerHTML =+ `
// //         <div class="color-options">${items.color}</div>
// //         `
// //     })
// // })
// // .fetch('/api/get_category_products/')
// // .then(res => res.json())
// // .then(data => {
// //     const category = document.getElementById('category')
// //     category.innerHTML = ``;
// //     data.forEach(category => {
// //         color.innerHTML =+ `
// //             <div class="category-options">${category.category}</div>
// //         `
// //     })
// // })
// // .fetch('/api/get_categories/')
// // .then(res => res.json())
// // .then(data => {
// //     const categories = document.getElementById('categories')
// //     categories.innerHTML = ``;
// //     data.forEach(items => {
// //         categories.innerHTML =+ `
// //             <div class="categories-options">${items.category}</div>
// //         `
// //     })
// // })
fetch('/api/products/')
.then(res => res.json())
.then(data => {
    const all_items = document.getElementById('all_items');
    all_items.innerHTML = ``;
    data.forEach(prodect => {
        all_items.innerHTML += `
            <div class="product-card_context" data-product-id="${prodect.id}">
                <div class="product-card">
                    <div class="product-image">
                        <img  onclick="viewDetails(${prodect.id})" src="${prodect.image_1}" alt="${prodect.title}" onerror="this.src='https://via.placeholder.com/300x250/f8f9fa/6c757d?text=No+Image'">
                        ${`<div class="discount-badge">-${prodect.discount}%</div>`}
                        <button  onclick="Add_to_wishlist(${prodect.id})" title="Like" class="wishlist-btn" aria-label="Add to wishlist">
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
                        <h3 class="product-title">${prodect.title}</h3>
                        <p class="product-description">${prodect.title}</p>
                        <div class="price-container">
                            <span class="current-price">${prodect.price}</span>
                            <span class="old-price">${prodect.old_price}</span>
                        </div>
                    </div>
                </div>
                <div class="addtocart">
                    <button  title="Add To Cart" onclick="Add_To_Cart(${prodect.id})" class="add-to-cart-btn" data-product-id="${prodect.id}">
                        Add to cart <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                    <button  title="View Details"  class="product-info-btn" data-product-id="${prodect.id}" onclick="viewDetails(${prodect.id})" >
                        <i class="fa-solid fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `
    })
})
.finally(()=> {
    // Hideloader()
})
.catch(error => {
    alert(error)
})


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

async function Add_To_Cart(productId, quantity = 1) {
  try {
    const csrftoken = getCookie('csrftoken');
    const res = await fetch('/api/cart/add/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      credentials: 'include',  // لإرسال كويكز (access_token) تلقائيًا
      body: JSON.stringify({ product_id: productId, quantity })
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || 'تمت الإضافة إلى السلة بنجاح');
    } else {
      alert(data.error || '❌ حدث خطأ أثناء الإضافة إلى السلة');
    }
  } catch (err) {
    console.error(err);
    alert('⚠️ خطأ في الاتصال بالسيرفر');
  }
}



// // ================= Add To Wishlist=====================
// function Add_to_wishlist(product_id){
//     console.log(product_id,"Add_to_wishlist")
// }

// // ================= Add To Cart=========================




// ================= View Details =======================

// function viewDetails(productId) {
//     window.location.href = `/product-detail.html?id=${productId}`;
// }

// // ============ Show loader ==================
// function Showloader(){
//     const loader =  document.getElementById('loader-container')
//     loader.style.display = 'flex'
// }
// // ============ Hide loader ==================
// function Hideloader(){
//     const loader =  document.getElementById('loader-container')
//     loader.style.display = 'none'
// }

