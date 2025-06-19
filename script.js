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

// Hàm hỗ trợ xóa sản phẩm khỏi giỏ hàng
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems(); // Render lại giỏ hàng sau khi xóa
    updateCartCount(); // Cập nhật số lượng trên header
}

// Gắn sự kiện cho các nút trong giỏ hàng (tăng/giảm số lượng, xóa từng cái)
function attachCartItemListeners() {
    // Nút Tăng số lượng (+)
    document.querySelectorAll('.increase-quantity').forEach(button => {
        // Sử dụng .onclick thay vì .addEventListener để tránh gắn sự kiện trùng lặp
        // mỗi khi renderCartItems được gọi
        button.onclick = (event) => {
            const productId = event.target.dataset.id; // Lấy data-id từ nút
            const item = cart.find(p => p.id === productId);
            if (item) {
                item.quantity++;
                saveCart();
                renderCartItems(); // Render lại giỏ hàng để cập nhật hiển thị và tổng tiền
                updateCartCount(); // Cập nhật số lượng trên header
            }
        };
    });

    // Nút Giảm số lượng (-)
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.onclick = (event) => {
            const productId = event.target.dataset.id;
            const item = cart.find(p => p.id === productId);
            if (item && item.quantity > 1) { // Chỉ giảm nếu số lượng lớn hơn 1
                item.quantity--;
                saveCart();
                renderCartItems();
                updateCartCount();
            } else if (item && item.quantity === 1) {
                // Nếu số lượng là 1 và người dùng bấm giảm, hỏi xác nhận và xóa sản phẩm
                if (confirm(`Bạn có muốn xóa "${item.name}" khỏi giỏ hàng không?`)) {
                    removeFromCart(productId);
                }
            }
        };
    });

    // Nút Xóa từng sản phẩm (bên cạnh mỗi item)
    document.querySelectorAll('.remove-item-btn').forEach(button => {
        button.onclick = (event) => {
            const productId = event.target.dataset.id;
            const itemToRemove = cart.find(item => item.id === productId);
            if (itemToRemove && confirm(`Bạn có chắc chắn muốn xóa "${itemToRemove.name}" khỏi giỏ hàng không?`)) {
                removeFromCart(productId);
            }
        };
    });

    // Nút Xóa tất cả giỏ hàng (nút lớn ở dưới tổng tiền)
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.onclick = () => {
            if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng không?')) {
                cart = []; // Xóa toàn bộ mảng giỏ hàng
                saveCart();
                renderCartItems(); // Render lại để hiển thị giỏ hàng trống
                updateCartCount(); // Cập nhật số lượng trên header thành 0
            }
        };
    }

    // Xử lý nút "Tiến hành thanh toán" trên cart.html
    const proceedToCheckoutBtn = document.querySelector('.btn-checkout[href="checkout.html"]');
    if (proceedToCheckoutBtn) {
        // Nếu đây là thẻ <a>, nó tự chuyển hướng, không cần JS.
        // Nhưng nếu bạn đổi sang <button> với id như đã đề xuất trước đó, thì sẽ cần event listener.
        // Giả sử vẫn là thẻ <a> với href, nó sẽ tự hoạt động.
        // Nếu không, hãy đổi thành button và thêm listener:
        /*
        proceedToCheckoutBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Ngăn hành vi mặc định của link nếu bạn muốn thêm logic trước
            window.location.href = 'checkout.html';
        });
        */
        // Bỏ comment dòng trên nếu bạn muốn nút checkout là button và điều hướng bằng JS
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
        // Khi giỏ hàng trống, đảm bảo các nút cũng bị ẩn/vô hiệu hóa nếu cần
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) clearCartBtn.style.display = 'none'; // Ẩn nút xóa tất cả
        const checkoutBtn = document.querySelector('.btn-checkout');
        if (checkoutBtn) checkoutBtn.style.display = 'none'; // Ẩn nút thanh toán
        return;
    } else {
        // Hiện lại các nút nếu có sản phẩm trong giỏ
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) clearCartBtn.style.display = ''; // Hiện nút xóa tất cả
        const checkoutBtn = document.querySelector('.btn-checkout');
        if (checkoutBtn) checkoutBtn.style.display = ''; // Hiện nút thanh toán
    }

    let total = 0;
    cartItemsContainer.innerHTML = ''; // Xóa nội dung cũ để render lại

    cart.forEach(item => {
        // item.price đã là số khi được thêm vào giỏ hàng từ productToAdd.price
        total += item.price * item.quantity;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        // Thêm data-id vào phần tử cha .cart-item để dễ dàng thao tác sau này
        itemElement.setAttribute('data-id', item.id);

        itemElement.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/90x90?text=No+Image'}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name || 'Sản phẩm không tên'}</h4>
                <p class="cart-item-price">${(item.price || 0).toLocaleString('vi-VN')}₫</p>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item-btn" data-id="${item.id}">Xóa</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    totalPriceElement.textContent = `${total.toLocaleString('vi-VN')}₫`; // Định dạng tổng giá

    // ************* ĐIỂM QUAN TRỌNG NHẤT CẦN THAY ĐỔI *************
    // GỌI HÀM GẮN SỰ KIỆN SAU KHI TẤT CẢ CÁC NÚT (BAO GỒM +, -, XÓA) ĐƯỢC RENDER VÀO DOM!
    attachCartItemListeners();
    // ************************************************************
}

// Hàm hiển thị giỏ hàng trên trang thanh toán (checkout.html)
function renderCheckoutCartItems() {
    const checkoutItemsContainer = document.getElementById('checkout-cart-items');
    const checkoutTotalPriceElement = document.getElementById('checkout-total-price');
    const checkoutForm = document.getElementById('checkout-form'); // Lấy thêm form để ẩn/hiện

    // Kiểm tra xem các phần tử có tồn tại trên trang không
    if (!checkoutItemsContainer || !checkoutTotalPriceElement || !checkoutForm) {
        console.warn('Elements for checkout cart items, total price, or form not found on this page. Are you on checkout.html?');
        return;
    }

    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = `
            <p class="empty-cart-checkout">Giỏ hàng trống!
            <br>Vui lòng quay lại <a href="products.html">trang sản phẩm</a> để thêm hàng.</p>
        `;
        checkoutTotalPriceElement.textContent = '0₫';
        checkoutForm.style.display = 'none'; // Ẩn toàn bộ form thanh toán nếu giỏ hàng trống
        return;
    } else {
        checkoutForm.style.display = ''; // Đảm bảo form được hiển thị nếu có sản phẩm
    }

    let total = 0;
    checkoutItemsContainer.innerHTML = ''; // Xóa nội dung cũ trước khi render lại

    cart.forEach(item => {
        // Đảm bảo item.price là số để tính toán
        total += item.price * item.quantity;

        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-cart-item'; // Class này đã được thêm CSS
        itemElement.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/60x60?text=No+Image'}" alt="${item.name}">
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
            const productElement = event.target.closest('.product-card');
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
    // Luôn cập nhật số lượng giỏ hàng trên header khi DOMContentLoaded
    // Điều này cần cho tất cả các trang có header chứa cart-link
    updateCartCount();

    // Render giỏ hàng trên trang cart.html
    if (document.querySelector('#cart-items')) {
        renderCartItems();
    }
    // Render sản phẩm trên trang chủ (ví dụ 3 sản phẩm nổi bật)
    else if (document.querySelector('body.home-page .products .product-list')) {
        fetchAndDisplayProducts('body.home-page .products .product-list', 3); // Lấy 3 sản phẩm
    }
    // Render tất cả sản phẩm trên trang sản phẩm
    else if (document.querySelector('body.products-page .products .product-list')) {
        fetchAndDisplayProducts('body.products-page .products .product-list'); // Lấy tất cả sản phẩm
    }
    // Render giỏ hàng trên trang thanh toán (checkout.html)
    else if (document.querySelector('#checkout-form')) {
        renderCheckoutCartItems();
    }

    // Thêm sự kiện cho nút "Thanh toán" trên trang giỏ hàng (cart.html)
    const checkoutBtn = document.getElementById('checkout-btn'); // Tìm cái nút "Thanh toán" bằng ID của nó
    if (checkoutBtn) { // Nếu tìm thấy cái nút đó
        checkoutBtn.addEventListener('click', () => { // Thì khi nó được bấm
            if (cart.length === 0) { // Kiểm tra xem giỏ hàng có rỗng không
                alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.'); // Rỗng thì báo lỗi
            } else {
                window.location.href = '/checkout.html'; // KHÔNG RỖNG thì chuyển sang trang checkout.html
            }
        });
    }

    // Xử lý form thanh toán (checkout form)
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Ngăn chặn hành vi gửi form mặc định

            // Lấy nút xác nhận đặt hàng để vô hiệu hóa khi submit
            const placeOrderBtn = checkoutForm.querySelector('.btn-place-order');
            if (placeOrderBtn) {
                placeOrderBtn.disabled = true;
                placeOrderBtn.textContent = 'Đang xử lý...';
            }

            // Thu thập thông tin khách hàng từ form
            const formData = new FormData(checkoutForm);
            const customerInfo = {};
            for (let [key, value] of formData.entries()) {
                customerInfo[key] = value;
            }

            // KIỂM TRA CÁC TRƯỜNG BẮT BUỘC
            if (!customerInfo.fullName || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
                alert('Vui lòng điền đầy đủ các thông tin bắt buộc (Họ và tên, Email, Số điện thoại, Địa chỉ).');
                // Re-enable nút nếu có lỗi
                if (placeOrderBtn) {
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.textContent = 'Xác nhận đặt hàng';
                }
                return; // Dừng hàm nếu thiếu thông tin
            }

            // Tạo đối tượng đơn hàng
            // Chúng ta sẽ lấy TỪNG trường thông tin khách hàng từ customerInfo
            // và đưa chúng vào cấp độ GỐC của orderData
            const orderData = {
                fullName: customerInfo.fullName,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address,
                notes: customerInfo.notes,
                // Sửa thành 'COD' để khớp với enum của server
                paymentMethod: 'COD', // <--- DÒNG BẠN CẦN THAY ĐỔI!
                items: cart,
                totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
            };

            try {
                // Gửi dữ liệu đơn hàng lên server
                const response = await fetch('/api/orders', { // Đảm bảo URL này đúng với server của bạn
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
                    window.location.href = '/'; // Chuyển về trang chủ
                } else {
                    // Xử lý lỗi từ server (ví dụ: thiếu thông tin)
                    alert('Lỗi đặt hàng: ' + (result.message || 'Có lỗi xảy ra, vui lòng thử lại.'));
                }
            } catch (error) {
                console.error('Lỗi khi gửi đơn hàng:', error);
                alert('Không thể kết nối đến server để đặt hàng. Vui lòng thử lại sau.');
            } finally {
                // Luôn re-enable nút sau khi request hoàn tất (thành công hoặc lỗi)
                if (placeOrderBtn) {
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.textContent = 'Xác nhận đặt hàng';
                }
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