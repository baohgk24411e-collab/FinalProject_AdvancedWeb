# AdvancedWeb_FinalProject — Tứ Quý Garden (TypeScript + Angular & MongoDB Backend)

Dự án đồ án môn **Phát triển ứng dụng Web Nâng cao (Advanced Web Development)** được chuyển đổi hoàn chỉnh từ đồ án web tĩnh sang cấu trúc **Angular (TypeScript)** và **Node.js/Express + MongoDB** chuẩn theo môn học.

---

## 📁 Cấu trúc thư mục

```
AdvancedWeb_FinalProject/
├── my-app/                   # Frontend Angular (TypeScript, NgModule, Routing)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Header, Footer, ProductCard, Chatbot
│   │   │   ├── pages/        # 14 trang chức năng (Home, Products, Detail, Cart, Checkout, Login, Profile, Nutrition, Traceability, Contact, Admin...)
│   │   │   ├── services/     # ProductService, CartService, AuthService, OrderService, LanguageService
│   │   │   ├── models/       # TypeScript interfaces (Product, Category, Order, User, CartItem)
│   │   │   ├── data/         # Mock data TypeScript
│   │   │   ├── app-module.ts
│   │   │   └── app-routing-module.ts
│   │   ├── public/           # Images, Demo assets, Logo...
│   │   ├── styles/           # main.css, admin.css
│   │   └── index.html
│   ├── package.json
│   └── angular.json
│
└── my-server-mongodb/        # Backend RESTful API Express + MongoDB
    ├── index.js              # Express server (CORS http://localhost:4200, port 3002)
    ├── seed.js               # Script nạp dữ liệu ban đầu vào MongoDB
    ├── package.json
    └── data/                 # Dữ liệu mẫu ban đầu để seed
```

---

## 🚀 Hướng dẫn khởi chạy

### 1. Khởi chạy Frontend (Angular)
```bash
cd D:\AdvancedWeb_FinalProject\my-app
npm start
# Hoặc: ng serve
```
Truy cập: `http://localhost:4200`

### 2. Khởi chạy Backend (Node.js/Express + MongoDB)
```bash
cd D:\AdvancedWeb_FinalProject\my-server-mongodb

# (Tùy chọn) Nạp dữ liệu vào MongoDB (yêu cầu dịch vụ MongoDB đang chạy)
npm run seed

# Khởi chạy server
npm start
```
Server chạy tại: `http://localhost:3002`

---

## 📌 Danh sách các Route chính trong Angular

| Đường dẫn (URL) | Component | Mô tả chức năng |
| :--- | :--- | :--- |
| `/` | `HomeComponent` | Trang chủ: Banner, danh mục, sản phẩm nổi bật, gợi ý theo khảo sát |
| `/products` | `ProductsComponent` | Bộ lọc danh mục, khoảng giá, tìm kiếm, sắp xếp, phân trang |
| `/detail/:id` | `ProductDetailComponent` | Chi tiết sản phẩm, thư viện ảnh, thông số dinh dưỡng, thêm giỏ hàng |
| `/cart` | `CartComponent` | Giỏ hàng, cập nhật số lượng, mã giảm giá, tính phí vận chuyển |
| `/checkout` | `CheckoutComponent` | Thanh toán, chọn địa chỉ tỉnh/huyện/xã VN, COD/MoMo/VNPAY |
| `/login` | `LoginComponent` | Đăng nhập & Đăng ký tài khoản, phân quyền User / Admin |
| `/profile` | `ProfileComponent` | Thông tin cá nhân, lịch sử đơn hàng, cập nhật khảo sát dinh dưỡng |
| `/nutrition` | `NutritionComponent` | Công cụ tính BMI/TDEE, gợi ý khẩu phần & thực đơn theo thể trạng |
| `/traceability` | `TraceabilityComponent` | Quét QR & tra cứu nguồn gốc nông trại, nhật ký canh tác VietGAP |
| `/about` | `AboutComponent` | Giới thiệu thương hiệu Tứ Quý Garden, mạng lưới nông hộ |
| `/contact` | `ContactComponent` | Form liên hệ, hệ thống cửa hàng, câu hỏi thường gặp (FAQ) |
| `/admin/dashboard` | `AdminDashboardComponent` | Thống kê doanh thu, đơn hàng, biểu đồ tăng trưởng |
| `/admin/products` | `AdminProductsComponent` | Quản lý sản phẩm (CRUD thêm/sửa/xóa, cập nhật kho) |
| `/admin/orders` | `AdminOrdersComponent` | Quản lý và cập nhật trạng thái đơn hàng |

