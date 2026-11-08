// services/orderService.js
window.OrderService = {
  getOrders() {
    const orders = localStorage.getItem("tqg_orders");
    if (orders) return JSON.parse(orders);

    // Initial mock orders to seed dashboard beautifully
    const mockOrders = window.MOCK_ORDERS || [];
    this.saveOrders(mockOrders);
    return mockOrders;
  },

  saveOrders(orders) {
    localStorage.setItem("tqg_orders", JSON.stringify(orders));
  },

  getUserOrders(userId) {
    return this.getOrders().filter(order => order.userId === userId);
  },

  getOrderById(orderId) {
    return this.getOrders().find(order => order.id === orderId);
  },

  createOrder(customerInfo, shippingAddress, paymentMethod, totals) {
    const orders = this.getOrders();
    const fullCart = window.CartService.getCart();
    
    if (fullCart.length === 0) {
      return { success: false, message: "Giỏ hàng của bạn đang trống." };
    }

    // Filter to selected items only (if selection exists)
    const selectedStr = localStorage.getItem("tuquy_checkout_selected_ids");
    let selectedIds = null;
    if (selectedStr) {
      try {
        selectedIds = JSON.parse(selectedStr);
      } catch (e) {}
    }

    const cart = fullCart.filter(item => !selectedIds || selectedIds.includes(item.productId));
    if (cart.length === 0) {
      return { success: false, message: "Không có sản phẩm nào được chọn để thanh toán." };
    }

    const items = cart.map(item => {
      const product = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      };
    });

    // Deduct stock
    cart.forEach(item => {
      const product = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });
    // Save updated stock to local storage mockup
    localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));

    const currentUser = window.AuthService.getCurrentUser();
    const orderId = "TQG" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: orderId,
      userId: currentUser ? currentUser.id : "guest_" + Date.now(),
      customerName: customerInfo.fullName,
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email || "",
      address: `${shippingAddress.address}, ${shippingAddress.ward}, ${shippingAddress.district}, ${shippingAddress.province}`,
      paymentMethod,
      items,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      discount: totals.discount,
      total: totals.total,
      status: "Chờ xác nhận",
      date: new Date().toISOString(),
      note: shippingAddress.note || ""
    };

    orders.unshift(newOrder); // Add to beginning
    this.saveOrders(orders);
    
    // Remove only checked out items from cart instead of clearing everything
    cart.forEach(item => {
      window.CartService.removeFromCart(item.productId);
    });
    
    // Clear selection storage
    localStorage.removeItem("tuquy_checkout_selected_ids");
    window.CartService.removeVoucher();

    return { success: true, message: "Đặt hàng thành công!", orderId };
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const orderIdx = orders.findIndex(o => o.id === orderId);

    if (orderIdx === -1) {
      return { success: false, message: "Không tìm thấy đơn hàng." };
    }

    orders[orderIdx].status = newStatus;
    this.saveOrders(orders);
    
    window.dispatchEvent(new Event("ordersUpdated"));
    return { success: true, message: `Cập nhật trạng thái đơn hàng sang: ${newStatus}` };
  },

  getAdminKPIs() {
    const orders = this.getOrders();
    const activeOrders = orders.filter(o => o.status !== "Đã hủy");

    const totalOrders = orders.length;
    const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProducts = window.MOCK_PRODUCTS.length;
    
    // Get unique customers
    const uniqueUsers = new Set(orders.map(o => o.userId));
    const totalCustomers = uniqueUsers.size + 3; // mock additional count

    // Low stock products
    const lowStock = window.MOCK_PRODUCTS.filter(p => p.stock < 15).slice(0, 5);

    // Bestselling calculation based on quantity sold in orders
    const salesMap = {};
    orders.forEach(order => {
      if (order.status !== "Đã hủy") {
        order.items.forEach(item => {
          salesMap[item.productId] = (salesMap[item.productId] || 0) + item.quantity;
        });
      }
    });

    const bestSellers = Object.keys(salesMap)
      .map(id => {
        const prod = window.MOCK_PRODUCTS.find(p => p.id === parseInt(id));
        return {
          id: parseInt(id),
          name: prod ? prod.name : "Sản phẩm ẩn",
          image: prod ? prod.image : "",
          sales: salesMap[id]
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      totalOrders,
      revenue,
      totalProducts,
      totalCustomers,
      lowStock,
      bestSellers
    };
  }
};
