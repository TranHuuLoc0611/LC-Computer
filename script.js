// Quản lý giỏ hàng
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Dữ liệu sản phẩm (thêm 20 sản phẩm của bạn vào đây)
const productsData = [
    {
        id: '1',
        name: 'CPU Intel Core i9-13900K',
        price: 15000000,
        image: 'images/cpu-intel-i9.jpg',
        description: 'Bộ vi xử lý mạnh mẽ cho game thủ và người sáng tạo nội dung.'
    },
    {
        id: '2',
        name: 'VGA NVIDIA GeForce RTX 4090',
        price: 45000000,
        image: 'images/gpu-nvidia-rtx4090.jpg',
        description: 'Card đồ họa hàng đầu cho hiệu năng gaming 4K và AI.'
    },
    {
        id: '3',
        name: 'RAM Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3600MHz',
        price: 3500000,
        image: 'images/ram-corsair.jpg',
        description: 'Bộ nhớ RAM hiệu năng cao với đèn RGB đẹp mắt.'
    },
    {
        id: '4',
        name: 'Ổ cứng SSD Samsung 970 EVO Plus 1TB NVMe M.2',
        price: 2800000,
        image: 'images/ssd-samsung.jpg',
        description: 'Ổ cứng SSD tốc độ cao giúp tăng tốc độ tải game và ứng dụng.'
    },
    {
        id: '5',
        name: 'Mainboard ASUS ROG Strix Z790-E Gaming WiFi',
        price: 9000000,
        image: 'images/mainboard-asus.jpg',
        description: 'Bo mạch chủ cao cấp hỗ trợ các CPU Intel Core thế hệ mới nhất.'
    }
    // ...
];

// Cập nhật giỏ hàng và render sản phẩm khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#cart-items')) { // Nếu đang ở trang giỏ hàng
        renderCartItems();
    }
    updateCartCount();

    // Render sản phẩm trên trang chủ (ví dụ 3 sản phẩm nổi bật)
    if (document.querySelector('body.home-page .products .product-list')) { // Thêm class 'home-page' vào body của index.html
        const featuredProducts = productsData.slice(0, 3); // Lấy 3 sản phẩm đầu tiên
        renderProducts('body.home-page .products .product-list', featuredProducts);
    } 
    // Render tất cả sản phẩm trên trang sản phẩm
    else if (document.querySelector('body.products-page .products .product-list')) { // Thêm class 'products-page' vào body của products.html
        renderProducts('body.products-page .products .product-list', productsData);
    }
});

// Hàm hiển thị sản phẩm
function renderProducts(containerSelector, productsToRender) {
    const productListContainer = document.querySelector(containerSelector);
    if (!productListContainer) return;

    productListContainer.innerHTML = ''; // Xóa nội dung cũ
    
    productsToRender.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.setAttribute('data-id', product.id);
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price.toLocaleString()}₫</p>
            <button class="add-to-cart">Thêm vào giỏ</button>
        `;
        productListContainer.appendChild(productElement);
    });

    // Gán lại sự kiện cho các nút "Thêm vào giỏ" sau khi render
    attachAddToCartListeners();
}

// Gán sự kiện cho các nút "Thêm vào giỏ"
function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const productElement = event.target.closest('.product');
            const productId = productElement.getAttribute('data-id');
            
            const productToAdd = productsData.find(p => p.id === productId);

            if (!productToAdd) {
                console.error('Sản phẩm không tìm thấy trong dữ liệu:', productId);
                return;
            }
            
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productToAdd.id,
                    name: productToAdd.name,
                    price: productToAdd.price,
                    image: productToAdd.image, // Lưu cả ảnh vào giỏ hàng
                    quantity: 1
                });
            }
            
            saveCart();
            updateCartCount();
            alert(`Đã thêm ${productToAdd.name} vào giỏ!`);
        });
    });
}

// Hiển thị giỏ hàng (trang cart.html)
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Giỏ hàng trống!</p>';
        totalPriceElement.textContent = '0₫';
        return;
    }
    
    let total = 0;
    cartItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const priceNumber = parseInt(item.price); // Giá đã là số trong productsData
        total += priceNumber * item.quantity;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 1rem;">
            <div>
                <h3>${item.name}</h3>
                <p>${item.price.toLocaleString()}₫ x ${item.quantity}</p>
            </div>
            <button class="remove-item" data-id="${item.id}">Xóa</button>
        `;
        cartItemsContainer.appendChild(itemElement);
    });
    
    totalPriceElement.textContent = `${total.toLocaleString()}₫`;
    
    // Thêm sự kiện xóa sản phẩm
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            cart = cart.filter(item => item.id !== productId);
            saveCart();
            renderCartItems();
            updateCartCount();
        });
    });
}

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

// Menu mobile toggle
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.classList.toggle('active');
    });
}