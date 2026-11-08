// data/orders.js
window.MOCK_ORDERS = [
  {
    id: "TQG1256",
    userId: "u_1",
    customerName: "Nguyễn Thị Hà",
    customerPhone: "0912345678",
    customerEmail: "nguyenha@gmail.com",
    address: "15 Tràng Tiền, Hoàn Kiếm, Hà Nội",
    paymentMethod: "COD",
    items: [
      { productId: 45, name: "Mix Hạt Dinh Dưỡng 5 loại cao cấp", price: 149000, quantity: 2, image: "images/Product_Images/03. Hình ảnh/granola/Mix Nuts 5 loại.png" },
      { productId: 1, name: "Xoài cát Hòa Lộc", price: 95000, quantity: 3, image: "images/Product_Images/03. Hình ảnh/Trái cây/17-Xoài cát Hòa Lộc/17-1.png" }
    ],
    subtotal: 583000,
    shipping: 0,
    discount: 50000,
    total: 533000,
    status: "Đang xử lý",
    date: "2026-06-26T09:21:00.000Z"
  },
  {
    id: "TQG1255",
    userId: "u_2",
    customerName: "Trần Văn Nam",
    customerPhone: "0902345678",
    customerEmail: "vannam@gmail.com",
    address: "123 Nguyễn Đình Chiểu, Quận 3, TP. Hồ Chí Minh",
    paymentMethod: "E-wallet",
    items: [
      { productId: 48, name: "Combo Eat Clean Sống Khỏe Mỗi Ngày", price: 269000, quantity: 1, image: "images/Product_Images/03. Hình ảnh/combo/1-Eat Clean Box/ECB-001/ECB-01-1.png" },
      { productId: 14, name: "Sầu riêng Musang King", price: 250000, quantity: 1, image: "images/Product_Images/03. Hình ảnh/Trái cây/13-Sầu riêng Musang King/13-2.png" }
    ],
    subtotal: 519000,
    shipping: 0,
    discount: 30000,
    total: 489000,
    status: "Đang giao",
    date: "2026-06-26T08:15:00.000Z"
  },
  {
    id: "TQG1254",
    userId: "u_3",
    customerName: "Lê Minh Anh",
    customerPhone: "0934567890",
    customerEmail: "minhanh@gmail.com",
    address: "456 Trần Hưng Đạo, Sơn Trà, Đà Nẵng",
    paymentMethod: "Bank transfer",
    items: [
      { productId: 47, name: "Granola hạt & trái cây tự nhiên", price: 129000, quantity: 2, image: "images/Product_Images/03. Hình ảnh/granola/Granola Hạt và Trái cây.png" },
      { productId: 3, name: "Ổi Ruby không hạt", price: 45000, quantity: 4, image: "images/Product_Images/03. Hình ảnh/Trái cây/2-Ổi Ruby/2-1.png" }
    ],
    subtotal: 438000,
    shipping: 30000,
    discount: 0,
    total: 468000,
    status: "Hoàn thành",
    date: "2026-06-25T07:42:00.000Z"
  },
  {
    id: "TQG1253",
    userId: "u_4",
    customerName: "Phạm Thị Lan",
    customerPhone: "0945678901",
    customerEmail: "lanpham@gmail.com",
    address: "789 Lê Lợi, Ngô Quyền, Hải Phòng",
    paymentMethod: "COD",
    items: [
      { productId: 50, name: "Combo Quà Tặng Gia Đình Tứ Quý", price: 399000, quantity: 1, image: "images/Product_Images/03. Hình ảnh/combo/Healthy Gift Box.png" }
    ],
    subtotal: 399000,
    shipping: 30000,
    discount: 0,
    total: 429000,
    status: "Chờ xác nhận",
    date: "2026-06-24T22:30:00.000Z"
  },
  {
    id: "TQG1252",
    userId: "u_5",
    customerName: "Hoàng Quốc Bảo",
    customerPhone: "0956789012",
    customerEmail: "baohq@gmail.com",
    address: "12 Lý Tự Trọng, Cần Thơ",
    paymentMethod: "COD",
    items: [
      { productId: 10, name: "Bưởi da xanh Bến Tre", price: 85000, quantity: 1, image: "images/Product_Images/03. Hình ảnh/Trái cây/9-Bưởi da xanh/9-2.png" }
    ],
    subtotal: 85000,
    shipping: 30000,
    discount: 0,
    total: 115000,
    status: "Đã hủy",
    date: "2026-06-24T21:05:00.000Z"
  }
];
