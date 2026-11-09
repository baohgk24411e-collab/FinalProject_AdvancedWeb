// The array is a display cache; every mutation is acknowledged by MongoDB.
window.OrderService = {
  orders: [],
  clear() { this.orders = []; localStorage.removeItem('tqg_orders'); },
  async refresh() { this.orders = await window.apiRequest('/api/orders'); return this.getOrders(); },
  getOrders() { return structuredClone(this.orders); },
  getUserOrders(id) { return this.getOrders().filter(o => o.userId === id); },
  getOrderById(id) { return this.getOrders().find(o => o.id === id); },
  async saveOrders(orders) {
    for (const order of orders) {
      const old = this.orders.find(o => o.id === order.id);
      if (!old) throw new Error('Không thể tạo đơn hàng bằng bộ nhớ trình duyệt');
      if (old.status !== order.status || JSON.stringify(old.refundRequest) !== JSON.stringify(order.refundRequest)) {
        const saved = await window.apiRequest('/api/orders/' + encodeURIComponent(order.id) + '/status', 'PUT', { status: order.status, refundRequest: order.refundRequest });
        this.orders[this.orders.findIndex(o => o.id === order.id)] = saved;
      }
    }
    window.dispatchEvent(new Event('ordersUpdated'));
  },
  async createOrder(customerInfo, address, paymentMethod, options = {}) {
    if (this.submitting) return { success: false, message: 'Đang gửi đơn hàng' };
    this.submitting = true;
    try {
      const selected = JSON.parse(localStorage.getItem('tuquy_checkout_selected_ids') || 'null');
      const cart = window.CartService.getCart().filter(item => !selected || selected.includes(item.productId));
      const body = {
        customerName: customerInfo.fullName, customerPhone: customerInfo.phone,
        address: [address.address, address.ward, address.district, address.province].filter(Boolean).join(', '),
        note: address.note || '', paymentMethod,
        items: cart.map(p => ({ productId: p.productId, quantity: p.quantity })),
        shippingMethod: options.shippingMethod || 'standard', voucherCode: options.voucherCode || '',
        giftBox: options.giftBox === true, greetingCard: options.greetingCard === true
      };
      const fingerprint = JSON.stringify(body);
      let pending = JSON.parse(sessionStorage.getItem('tqg_pending_order') || 'null');
      if (!pending || pending.fingerprint !== fingerprint) pending = { fingerprint, id: crypto.randomUUID() };
      sessionStorage.setItem('tqg_pending_order', JSON.stringify(pending));
      const order = await window.apiRequest('/api/orders', 'POST', { ...body, requestId: pending.id });
      this.orders = [order, ...this.orders.filter(o => o.id !== order.id)];
      cart.forEach(item => window.CartService.removeFromCart(item.productId));
      localStorage.removeItem('tuquy_checkout_selected_ids');
      sessionStorage.removeItem('tqg_pending_order');
      window.CartService.removeVoucher();
      try { window.MOCK_PRODUCTS = await window.apiRequest('/api/products'); } catch {}
      return { success: true, message: 'Đặt hàng thành công', orderId: order.id, total: order.total };
    } catch (error) { return { success: false, message: error.message }; }
    finally { this.submitting = false; }
  },
  async updateOrderStatus(id, status) {
    try {
      const updated = await window.apiRequest('/api/orders/' + encodeURIComponent(id) + '/status', 'PUT', { status });
      this.orders = this.orders.map(o => o.id === id ? updated : o);
      window.dispatchEvent(new Event('ordersUpdated'));
      return { success: true, message: 'Đã cập nhật trạng thái đơn hàng' };
    } catch (error) { return { success: false, message: error.message }; }
  },
  getAdminKPIs() {
    const orders = this.getOrders();
    const activeOrders = orders.filter(o => o.status !== "Đã hủy");

    const totalOrders = orders.length;
    const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProducts = window.MOCK_PRODUCTS.length;
    
    // Get unique customers
    const uniqueUsers = new Set(orders.map(o => o.userId));
    const totalCustomers = uniqueUsers.size; // mock additional count

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
