// Import thư viện express đã cài đặt
const express = require('express');
const path = require('path'); // Module path để làm việc với đường dẫn file

// Khởi tạo ứng dụng Express
const app = express();
const PORT = process.env.PORT || 3000; // Cổng mà server sẽ lắng nghe. Mặc định là 3000

// ----------------------------------------------------
// Cấu hình Middleware
// ----------------------------------------------------

// Middleware để phục vụ các file tĩnh (HTML, CSS, JS, Images)
// Điều này rất quan trọng để trình duyệt có thể truy cập các file frontend
app.use(express.static(path.join(__dirname, '/'))); 
// '__dirname' là đường dẫn đến thư mục hiện tại của file server.js
// '/': Chỉ ra rằng mọi file trong thư mục gốc của dự án đều có thể được phục vụ tĩnh

// Middleware để xử lý dữ liệu JSON trong body của request (ví dụ: khi gửi dữ liệu từ form)
app.use(express.json());

// Middleware để xử lý dữ liệu từ form HTML (URL-encoded data)
app.use(express.urlencoded({ extended: true }));


// ----------------------------------------------------
// Định tuyến (Routes)
// ----------------------------------------------------

// Route mặc định cho trang chủ
// Khi người dùng truy cập '/', server sẽ gửi file index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route cho trang sản phẩm
app.get('/products.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});

// Route cho trang giỏ hàng
app.get('/cart.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
});

// Ví dụ một API đơn giản
app.get('/api/test', (req, res) => {
    res.json({ message: 'API test thành công từ server Express!' });
});


// ----------------------------------------------------
// Khởi động Server
// ----------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`Mở trình duyệt và truy cập: http://localhost:${PORT}`);
});