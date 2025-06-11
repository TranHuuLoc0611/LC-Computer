// Quản lý giỏ hàng
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Lưu giỏ hàng vào localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Cập nhật số lượng giỏ hàng trên header
function updateCartCount() {
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartLink.textContent = `Giỏ hàng (${totalItems})`;
    }
}

// Hiển thị giỏ hàng (trang cart.html)
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');

    if (!cartItemsContainer || !totalPriceElement) {
        // Đảm bảo các phần tử này tồn tại trên trang
        console.warn('Elements for cart items or total price not found. Are you on cart.html?');
        return;
    }

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Giỏ hàng trống!</p>';
        totalPriceElement.textContent = '0₫';
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = ''; // Xóa nội dung cũ để render lại

    cart.forEach(item => {
        // item.price đã là số khi được thêm vào giỏ hàng từ productToAdd.price
        total += item.price * item.quantity;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/60x60?text=No+Image'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 1rem;">
            <div>
                <h3>${item.name || 'Sản phẩm không tên'}</h3>
                <p>${(item.price || 0).toLocaleString('vi-VN')}₫ x ${item.quantity}</p>
            </div>
            <button class="remove-item" data-id="${item.id}">Xóa</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    totalPriceElement.textContent = `${total.toLocaleString('vi-VN')}₫`; // Định dạng tổng giá

    // Thêm sự kiện xóa sản phẩm
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            // Lấy productId từ data-id (sử dụng _id)
            const productId = button.getAttribute('data-id');
            // Lọc giỏ hàng để xóa sản phẩm dựa trên _id
            cart = cart.filter(item => item.id !== productId); // Cần đảm bảo item.id là _id
            saveCart();
            renderCartItems(); // Render lại giỏ hàng sau khi xóa
            updateCartCount(); // Cập nhật số lượng trên header
        });
    });
}

// Hàm hiển thị giỏ hàng trên trang thanh toán (checkout.html)
function renderCheckoutCartItems() {
    const checkoutItemsContainer = document.getElementById('checkout-cart-items');
    const checkoutTotalPriceElement = document.getElementById('checkout-total-price');

    // Kiểm tra xem các phần tử có tồn tại trên trang không
    if (!checkoutItemsContainer || !checkoutTotalPriceElement) {
        console.warn('Elements for checkout cart items or total price not found on this page.');
        return;
    }

    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p class="empty-cart">Giỏ hàng trống!</p>';
        checkoutTotalPriceElement.textContent = '0₫';
        return;
    }

    let total = 0;
    checkoutItemsContainer.innerHTML = ''; // Xóa nội dung cũ trước khi render lại

    cart.forEach(item => {
        // Đảm bảo item.price là số để tính toán
        total += item.price * item.quantity;

        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-cart-item'; // Class này đã được thêm CSS
        itemElement.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/50x50?text=No+Image'}" alt="${item.name}">
            <div class="checkout-cart-item-details">
                <h4>${item.name}</h4>
                <p>${(item.price || 0).toLocaleString('vi-VN')}₫ x ${item.quantity}</p>
            </div>
        `;
        checkoutItemsContainer.appendChild(itemElement);
    });

    checkoutTotalPriceElement.textContent = `${total.toLocaleString('vi-VN')}₫`;
}

// Gán sự kiện cho các nút "Thêm vào giỏ" (CẦN ĐẶT SAU renderProducts)
function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const productElement = event.target.closest('.product');
            const productId = productElement.getAttribute('data-id'); // Đây là _id từ MongoDB

            // Lấy thông tin sản phẩm trực tiếp từ các phần tử con của productElement
            const productName = productElement.querySelector('h3').textContent;
            // Lấy giá và chuyển đổi từ chuỗi có ký tự '₫' và dấu phân cách hàng nghìn
            const productPriceText = productElement.querySelector('.price').textContent;
            // Xóa '₫' và dấu chấm phân cách hàng nghìn (ví dụ: "15.000₫" -> "15000") rồi chuyển sang số nguyên
            const productPrice = parseInt(productPriceText.replace(/₫/g, '').replace(/\./g, ''));
            const productImage = productElement.querySelector('img').src;

            const existingItem = cart.find(item => item.id === productId); // Tìm bằng _id

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId, // Sử dụng trực tiếp productId (là _id từ data-id)
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }

            saveCart();
            updateCartCount();
            alert(`Đã thêm ${productName} vào giỏ!`); // Dùng productName để thông báo
        });
    });
}

// Hàm hiển thị sản phẩm (CẦN ĐẶT SAU fetchAndDisplayProducts)
function renderProducts(containerSelector, productsToRender) {
    const productListContainer = document.querySelector(containerSelector);
    if (!productListContainer) return;

    productListContainer.innerHTML = ''; // Xóa nội dung cũ

    productsToRender.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        // Dùng product._id để gán vào data-id, đây là ID từ MongoDB
        productElement.setAttribute('data-id', product._id);
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price.toLocaleString('vi-VN')}₫</p>
            <button class="add-to-cart">Thêm vào giỏ</button>
        `;
        productListContainer.appendChild(productElement);
    });

    // Gán lại sự kiện cho các nút "Thêm vào giỏ" sau khi render
    attachAddToCartListeners();
}

// Hàm để fetch sản phẩm từ API
// Có thể tùy chỉnh containerSelector và limit để hiển thị sản phẩm nổi bật trên trang chủ
async function fetchAndDisplayProducts(containerSelector, limit = null) {
    const productListContainer = document.querySelector(containerSelector);
    if (!productListContainer) {
        console.warn(`Container with selector "${containerSelector}" not found.`);
        return; // Không tìm thấy container, không làm gì cả
    }

    productListContainer.innerHTML = '<p>Đang tải sản phẩm...</p>'; // Hiển thị thông báo tải

    try {
        const response = await fetch('/api/products'); // Gọi API để lấy sản phẩm

        if (!response.ok) { // Kiểm tra nếu phản hồi không thành công (ví dụ: 404, 500)
            throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        let products = await response.json(); // Chuyển đổi phản hồi sang JSON

        if (limit && products.length > limit) {
            products = products.slice(0, limit); // Giới hạn số lượng sản phẩm nếu có limit
        }

        if (products.length === 0) {
            productListContainer.innerHTML = '<p>Không có sản phẩm nào để hiển thị.</p>';
            return;
        }

        // Gọi hàm renderProducts để hiển thị các sản phẩm đã fetch
        renderProducts(containerSelector, products);

        // attachAddToCartListeners được gọi bên trong renderProducts, đảm bảo các nút được gắn sự kiện
        // sau khi chúng đã được render.

    } catch (error) {
        console.error('Lỗi khi fetch và hiển thị sản phẩm:', error);
        productListContainer.innerHTML = '<p>Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.</p>';
    }
}

// Cập nhật giỏ hàng và render sản phẩm khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#cart-items')) { // Nếu đang ở trang giỏ hàng
        renderCartItems();
    }
    updateCartCount();

    // Render sản phẩm trên trang chủ (ví dụ 3 sản phẩm nổi bật)
    if (document.querySelector('body.home-page .products .product-list')) { // Thêm class 'home-page' vào body của index.html
        fetchAndDisplayProducts('body.home-page .products .product-list', 3); // Lấy 3 sản phẩm
    }
    // Render tất cả sản phẩm trên trang sản phẩm
    else if (document.querySelector('body.products-page .products .product-list')) { // Thêm class 'products-page' vào body của products.html
        fetchAndDisplayProducts('body.products-page .products .product-list'); // Lấy tất cả sản phẩm
    }
    // Render giỏ hàng trên trang thanh toán (checkout.html)
    else if (document.querySelector('#checkout-form')) { // Nếu đang ở trang thanh toán
        renderCheckoutCartItems();
    }

    // Xử lý form thanh toán (checkout form)
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Ngăn chặn hành vi gửi form mặc định

            // Lấy thông tin từ form
            const formData = new FormData(checkoutForm);
            const orderData = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                notes: formData.get('notes'),
                paymentMethod: formData.get('paymentMethod'),
                items: cart, // Gửi toàn bộ giỏ hàng hiện tại
                totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
            };

            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message + '\nĐơn hàng của bạn đã được đặt thành công!');
                    localStorage.removeItem('cart'); // Xóa giỏ hàng sau khi đặt hàng thành công
                    cart = []; // Cập nhật biến cart trong bộ nhớ
                    updateCartCount(); // Cập nhật số lượng giỏ hàng trên header
                    // Tùy chọn: Chuyển hướng người dùng đến trang xác nhận đơn hàng hoặc trang chủ
                    window.location.href = '/'; // Chuyển về trang chủ
                } else {
                    // Xử lý lỗi từ server (ví dụ: thiếu thông tin)
                    alert('Lỗi đặt hàng: ' + (result.message || 'Có lỗi xảy ra, vui lòng thử lại.'));
                }
            } catch (error) {
                console.error('Lỗi khi gửi đơn hàng:', error);
                alert('Không thể kết nối đến server để đặt hàng. Vui lòng thử lại sau.');
            }
        });
    }
});

// Menu mobile toggle
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.classList.toggle('active');
    });
}