require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware
app.use(express.static(path.join(__dirname, '/')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// KẾT NỐI MONGODB VÀ ĐỊNH NGHĨA MODEL
const DB_URI = process.env.DB_URI;

// Kết nối tới MongoDB
mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Kết nối MongoDB Atlas thành công!'))
    .catch(err => console.error('Lỗi kết nối MongoDB Atlas:', err));

// Định nghĩa Product Schema (cấu trúc dữ liệu cho sản phẩm)
const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // ID sản phẩm
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // Đường dẫn ảnh sản phẩm
    description: { type: String },
    category: { type: String, required: true }, // Ví dụ: 'CPU', 'GPU', 'RAM', 'SSD'
    specs: { type: Object } // Object để lưu thông số kỹ thuật chi tiết
});

// Tạo Product Model từ Schema
const Product = mongoose.model('Product', productSchema);

// Định tuyến (Routes)
// Route mặc định cho trang chủ
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

// Test API
app.get('/api/test', (req, res) => {
    res.json({ message: 'API test thành công từ server Express!' });
});

// API để lấy tất cả sản phẩm
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({}); // Tìm tất cả sản phẩm trong collection
        res.json(products); // Gửi danh sách sản phẩm dưới dạng JSON về cho client
    } catch (error) {
        console.error('Lỗi khi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm.' });
    }
});

// Hàm thêm dữ liệu mẫu vào database (chỉ chạy khi cần)
async function insertSampleProducts() {
    try {
        const products = [
            {
                id: 'cpu_i9_13900k',
                name: 'CPU Intel Core i9-13900K',
                price: 15000000,
                image: 'images/cpu-intel-i9.jpg',
                description: 'Bộ vi xử lý mạnh mẽ cho game thủ và người sáng tạo nội dung.',
                category: 'CPU',
                specs: { "Cores": "24 (8P + 16E)", "Threads": "32", "Max_Turbo_Frequency": "5.8 GHz", "Socket": "LGA1700" }
            },
            {
                id: 'gpu_rtx_4090',
                name: 'VGA NVIDIA GeForce RTX 4090',
                price: 45000000,
                image: 'images/gpu-nvidia-rtx4090.jpg',
                description: 'Card đồ họa hàng đầu cho hiệu năng gaming 4K và AI.',
                category: 'GPU',
                specs: { "VRAM": "24GB GDDR6X", "Memory_Bus": "384-bit", "Boost_Clock": "2.52 GHz", "Cuda_Cores": "16384" }
            },
            {
                id: 'ram_corsair_32gb',
                name: 'RAM Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3600MHz',
                price: 3500000,
                image: 'images/ram-corsair.jpg',
                description: 'Bộ nhớ RAM hiệu năng cao với đèn RGB đẹp mắt.',
                category: 'RAM',
                specs: { "Capacity": "32GB (2x16GB)", "Type": "DDR4", "Speed": "3600MHz", "Latency": "CL18" }
            },
            {
                id: 'ssd_samsung_970_evo_1tb',
                name: 'Ổ cứng SSD Samsung 970 EVO Plus 1TB NVMe M.2',
                price: 2800000,
                image: 'images/ssd-samsung-970.jpg',
                description: 'Ổ cứng SSD NVMe tốc độ cao cho hiệu suất vượt trội.',
                category: 'SSD',
                specs: { "Capacity": "1TB", "Form_Factor": "M.2 2280", "Interface": "PCIe Gen 3.0 x4 NVMe", "Read_Speed": "Up to 3,500 MB/s" }
            }
        ];

        // Xóa tất cả sản phẩm cũ (chỉ chạy khi muốn làm sạch database)
        // await Product.deleteMany({});
        // console.log('Đã xóa tất cả sản phẩm cũ.');

        // Thêm các sản phẩm mới
        for (const product of products) {
            // Kiểm tra xem sản phẩm đã tồn tại chưa trước khi thêm
            const existingProduct = await Product.findOne({ id: product.id });
            if (!existingProduct) {
                await Product.create(product);
                console.log(`Đã thêm sản phẩm: ${product.name}`);
            } else {
                console.log(`Sản phẩm đã tồn tại (không thêm): ${product.name}`);
            }
        }
        console.log('Hoàn tất việc thêm sản phẩm mẫu.');
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm mẫu:', error);
    }
}

// Chỉ chạy khi bạn muốn thêm dữ liệu lần đầu hoặc reset dữ liệu.
insertSampleProducts();

// ----------------------------------------------------
// Khởi động Server
// ----------------------------------------------------

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`Mở trình duyệt và truy cập: http://localhost:${PORT}`);
});