// services/cartService.js
window.CartService = {
  getCart() {
    const currentUser = window.AuthService ? window.AuthService.getCurrentUser() : null;
    if (currentUser && currentUser.isAdmin) {
      return [];
    }
    const cart = localStorage.getItem("tqg_cart");
    return cart ? JSON.parse(cart) : [];
  },

  saveCart(cart) {
    localStorage.setItem("tqg_cart", JSON.stringify(cart));
    // Trigger cart update event to refresh UI badges
    window.dispatchEvent(new Event("cartUpdated"));
  },

  addToCart(productId, quantity = 1) {
    const isEn = (localStorage.getItem("tqg_lang") || "en") === "en";
    const currentUser = window.AuthService ? window.AuthService.getCurrentUser() : null;
    if (currentUser && currentUser.isAdmin) {
      return { success: false, message: isEn ? "Administrator accounts cannot buy products." : "Tài khoản quản trị viên không thể mua hàng." };
    }

    const cart = this.getCart();
    const existingItem = cart.find(item => item.productId === productId);
    const product = window.MOCK_PRODUCTS.find(p => p.id === productId);

    if (!product) return { success: false, message: isEn ? "Product not found." : "Không tìm thấy sản phẩm." };

    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        return { success: false, message: isEn ? `Quantity exceeds stock (Remaining: ${product.stock}).` : `Số lượng vượt quá tồn kho (Còn lại: ${product.stock}).` };
      }
      existingItem.quantity += quantity;
    } else {
      if (quantity > product.stock) {
        return { success: false, message: isEn ? `Quantity exceeds stock (Remaining: ${product.stock}).` : `Số lượng vượt quá tồn kho (Còn lại: ${product.stock}).` };
      }
      cart.push({ productId, quantity });
    }

    this.saveCart(cart);
    return { success: true, message: isEn ? `Added ${quantity} x ${product.nameEn || product.name} to cart.` : `Đã thêm ${quantity} x ${product.name} vào giỏ hàng.` };
  },

  updateQuantity(productId, quantity) {
    const isEn = (localStorage.getItem("tqg_lang") || "en") === "en";
    let cart = this.getCart();
    const existingItem = cart.find(item => item.productId === productId);
    const product = window.MOCK_PRODUCTS.find(p => p.id === productId);

    if (!existingItem || !product) return { success: false, message: isEn ? "Product not found in cart." : "Sản phẩm không có trong giỏ hàng." };

    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }

    if (quantity > product.stock) {
      return { success: false, message: isEn ? `Quantity exceeds stock (Remaining: ${product.stock}).` : `Số lượng vượt quá tồn kho (Còn lại: ${product.stock}).` };
    }

    existingItem.quantity = quantity;
    this.saveCart(cart);
    return { success: true, message: isEn ? "Quantity updated successfully." : "Đã cập nhật số lượng." };
  },

  removeFromCart(productId) {
    const isEn = (localStorage.getItem("tqg_lang") || "en") === "en";
    let cart = this.getCart();
    const product = window.MOCK_PRODUCTS.find(p => p.id === productId);
    cart = cart.filter(item => item.productId !== productId);
    this.saveCart(cart);
    const prodName = product ? (isEn ? (product.nameEn || product.name) : product.name) : (isEn ? "product" : "sản phẩm");
    return { success: true, message: isEn ? `Removed ${prodName} from cart.` : `Đã xóa ${prodName} khỏi giỏ hàng.` };
  },

  clearCart() {
    this.saveCart([]);
  },

  restoreCartItem(item, index = 0) {
    const isEn = (localStorage.getItem("tqg_lang") || "en") === "en";
    const cart = this.getCart();
    const existingIndex = cart.findIndex(cartItem => cartItem.productId === item.productId);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = item.quantity;
    } else {
      const safeIndex = Math.max(0, Math.min(index, cart.length));
      cart.splice(safeIndex, 0, { productId: item.productId, quantity: item.quantity });
    }

    this.saveCart(cart);
    return { success: true, message: isEn ? "Restored product to cart." : "Đã khôi phục sản phẩm vào giỏ hàng." };
  },

  getCartCount() {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  },

  getActiveVoucher() {
    const voucher = localStorage.getItem("tqg_active_voucher");
    return voucher ? JSON.parse(voucher) : null;
  },

  applyVoucher(code) {
    const isEn = (localStorage.getItem("tqg_lang") || "en") === "en";
    const vouchers = {
      "FREESHIP": { type: "freeship", discountVal: 30000, minOrder: 0, description: "Miễn phí vận chuyển" },
      "TUQUYGARDEN10": { type: "percentage", discountVal: 10, maxDiscount: 50000, minOrder: 0, description: "Giảm 10% tối đa 50.000đ" },
      "HEALTHY50": { type: "fixed", discountVal: 50000, minOrder: 500000, description: "Giảm 50.000đ cho đơn từ 500.000đ" }
    };

    const formattedCode = code.trim().toUpperCase();
    const voucher = vouchers[formattedCode];

    if (!voucher) {
      return { success: false, message: isEn ? "Invalid promo code." : "Mã giảm giá không hợp lệ." };
    }

    const subtotal = this.getCartSubtotal();
    if (subtotal < voucher.minOrder) {
      return { success: false, message: isEn ? `Minimum order of ${voucher.minOrder.toLocaleString()}đ required to use this code.` : `Yêu cầu đơn hàng tối thiểu từ ${voucher.minOrder.toLocaleString()}đ để sử dụng mã này.` };
    }

    localStorage.setItem("tqg_active_voucher", JSON.stringify({ code: formattedCode, ...voucher }));
    window.dispatchEvent(new Event("cartUpdated"));
    return { success: true, message: isEn ? `Promo code ${formattedCode} applied successfully!` : `Áp dụng mã ${formattedCode} thành công!`, voucher };
  },

  removeVoucher() {
    localStorage.removeItem("tqg_active_voucher");
    window.dispatchEvent(new Event("cartUpdated"));
  },

  getCartSubtotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => {
      const product = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  },

  getCartTotals() {
    const subtotal = this.getCartSubtotal();
    let shipping = subtotal > 1000000 || subtotal === 0 ? 0 : 30000; // Free ship for orders > 1M VND
    let discount = 0;
    const voucher = this.getActiveVoucher();

    if (voucher) {
      if (subtotal >= voucher.minOrder) {
        if (voucher.type === "freeship") {
          discount = Math.min(shipping, voucher.discountVal);
          shipping = shipping - discount;
          // Refund shipping discount in totals structure to show clearly
        } else if (voucher.type === "percentage") {
          const rawDiscount = Math.round(subtotal * (voucher.discountVal / 100));
          discount = voucher.maxDiscount ? Math.min(rawDiscount, voucher.maxDiscount) : rawDiscount;
        } else if (voucher.type === "fixed") {
          discount = voucher.discountVal;
        }
      } else {
        // Auto remove voucher if it no longer meets the condition
        this.removeVoucher();
      }
    }

    const total = Math.max(0, subtotal + shipping - (voucher?.type !== "freeship" ? discount : 0));

    return {
      subtotal,
      shipping,
      discount: voucher?.type !== "freeship" ? discount : 0,
      shippingDiscount: voucher?.type === "freeship" ? discount : 0,
      total,
      voucherCode: voucher ? voucher.code : null,
      voucherDescription: voucher ? voucher.description : null
    };
  },

  getFreeshipProgress() {
    const subtotal = this.getCartSubtotal();
    const threshold = 1000000; // 1,000,000đ freeship
    const percentage = Math.min(100, (subtotal / threshold) * 100);
    const needed = Math.max(0, threshold - subtotal);
    return { percentage, needed, isFree: subtotal >= threshold };
  }
};
