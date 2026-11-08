// js/cart.js

const CHECKOUT_SELECTED_KEY = "tuquy_checkout_selected_ids";
const CART_VOUCHERS = [
  { 
    code: "FREESHIP", 
    titleVi: "Miễn phí vận chuyển", titleEn: "Free Shipping", 
    descVi: "Áp dụng cho mọi đơn hàng", descEn: "Applies to all orders", 
    condVi: "Không giới hạn đơn tối thiểu", condEn: "No minimum order required", 
    minOrder: 0 
  },
  { 
    code: "TUQUYGARDEN10", 
    titleVi: "Giảm 10%", titleEn: "10% Discount", 
    descVi: "Tối đa 50.000đ", descEn: "Max 50,000đ", 
    condVi: "Áp dụng cho mọi đơn hàng", condEn: "Applies to all orders", 
    minOrder: 0 
  },
  { 
    code: "HEALTHY50", 
    titleVi: "Giảm 50.000đ", titleEn: "50,000đ Discount", 
    descVi: "Cho đơn hàng từ 500.000đ", descEn: "For orders from 500,000đ", 
    condVi: "Đơn hàng từ 500.000đ", condEn: "Orders from 500,000đ", 
    minOrder: 500000 
  }
];

const cartPageState = { selectedIds: new Set(), manuallyDeselected: new Set(), initialized: false };

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = window.AuthService ? window.AuthService.getCurrentUser() : null;
  if (currentUser && currentUser.isAdmin) {
    window.location.replace("admin-dashboard.html");
    return;
  }
  renderCartPage();
});

function translateCategory(cat) {
  const mapping = {
    "Fruits": "Fresh Fruits",
    "Nutritional Seeds": "Nutritional Seeds",
    "Granola": "Granola",
    "Combo Healthy": "Combo Healthy"
  };
  return mapping[cat] || cat;
}

function formatCurrency(value) {
  return `${Math.max(0, value || 0).toLocaleString()}đ`;
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCartItems() {
  const cart = window.CartService ? window.CartService.getCart() : [];
  return cart.map(item => {
    const product = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product !== undefined);
}

function syncSelectedState(cartItems) {
  const currentIds = new Set(cartItems.map(item => Number(item.productId)));

  if (!cartPageState.initialized) {
    cartPageState.selectedIds = new Set(currentIds);
    cartPageState.initialized = true;
    return;
  }

  cartPageState.selectedIds.forEach(id => {
    if (!currentIds.has(Number(id))) cartPageState.selectedIds.delete(id);
  });
  cartPageState.manuallyDeselected.forEach(id => {
    if (!currentIds.has(Number(id))) cartPageState.manuallyDeselected.delete(id);
  });

  cartItems.forEach(item => {
    const id = Number(item.productId);
    if (!cartPageState.selectedIds.has(id) && !cartPageState.manuallyDeselected.has(id)) {
      cartPageState.selectedIds.add(id);
    }
  });
}

function getSelectedItems(cartItems) {
  return cartItems.filter(item => cartPageState.selectedIds.has(Number(item.productId)));
}

function calculateTotalsFromItems(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  let shipping = subtotal > 1000000 || subtotal === 0 ? 0 : 30000;
  let discount = 0;
  let shippingDiscount = 0;
  const voucher = window.CartService ? window.CartService.getActiveVoucher() : null;

  if (voucher && subtotal >= (voucher.minOrder || 0)) {
    if (voucher.type === "freeship") {
      shippingDiscount = Math.min(shipping, voucher.discountVal || shipping);
      shipping -= shippingDiscount;
    } else if (voucher.type === "percentage") {
      const rawDiscount = Math.round(subtotal * ((voucher.discountVal || 0) / 100));
      discount = voucher.maxDiscount ? Math.min(rawDiscount, voucher.maxDiscount) : rawDiscount;
    } else if (voucher.type === "fixed") {
      discount = Math.min(voucher.discountVal || 0, subtotal);
    }
  }

  return {
    subtotal,
    shipping,
    discount,
    shippingDiscount,
    total: Math.max(0, subtotal + shipping - discount),
    voucherCode: voucher ? voucher.code : null,
    voucherDescription: voucher ? voucher.description : null
  };
}

function getFreeshipProgressFromSubtotal(subtotal) {
  const threshold = 1000000;
  return {
    percentage: Math.min(100, (subtotal / threshold) * 100),
    needed: Math.max(0, threshold - subtotal),
    isFree: subtotal >= threshold
  };
}


function renderCartPage() {
  const root = document.getElementById("cart-root");
  if (!root || !window.CartService) return;

  const cart = window.CartService.getCart();
  const cartItems = getCartItems();
  syncSelectedState(cartItems);

  if (cartItems.length === 0) {
    renderEmptyCart(root);
    return;
  }

  const selectedItems = getSelectedItems(cartItems);
  const totals = calculateTotalsFromItems(selectedItems);
  const progress = getFreeshipProgressFromSubtotal(totals.subtotal);
  const selectedCount = selectedItems.length;
  const allSelected = selectedCount === cartItems.length;

  const crossSell = window.MOCK_PRODUCTS
    .filter(p => p.isBestSeller && !cart.some(item => item.productId === p.id))
    .slice(0, 4);

  root.innerHTML = `
    <div class="cart-page-container container" style="margin-top: 20px; margin-bottom: 50px;">
      <ul class="breadcrumb" style="display:flex; list-style:none; gap:10px; font-size:14px; margin-bottom:25px; padding:0;">
        <li><a href="index.html" style="color:var(--color-text-light);"><span class="lang-vi">Trang chủ</span><span class="lang-en">Home</span></a></li>
        <li><span style="color:var(--color-text-light);">/</span></li>
        <li style="color:var(--color-primary); font-weight:600;"><span class="lang-vi">Giỏ hàng của bạn</span><span class="lang-en">Your Cart</span></li>
      </ul>

      <h1 class="page-title font-serif" style="font-size:32px; color:var(--color-text-dark); margin-bottom:20px;">
        <span class="lang-vi">Giỏ Hàng Của Bạn</span><span class="lang-en">Your Shopping Cart</span>
      </h1>
      
      <div class="freeship-progress-banner bg-cream-light" style="background-color:var(--color-cream-light); padding:15px 20px; border-radius:12px; border:1px solid var(--color-gray-border); margin-bottom:30px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; gap:12px;">
          <span>
            <span class="lang-vi">
              ${progress.isFree 
                ? "Congratulations! Selected items are eligible for <strong>Free nationwide shipping</strong>!" 
                : `Buy <strong>${formatCurrency(progress.needed)}</strong> more to get Free shipping nationwide.`}
            </span>
            <span class="lang-en">
              ${progress.isFree 
                ? "Congratulations! Selected items qualify for <strong>Free Shipping nationwide</strong>!" 
                : `Add <strong>${formatCurrency(progress.needed)}</strong> more selected items to qualify for Free Shipping.`}
            </span>
          </span>
          <strong>${Math.round(progress.percentage)}%</strong>
        </div>
        <div class="progress-bar-bg" style="width: 100%; height: 8px; background-color: var(--color-gray-border); border-radius: 4px; overflow: hidden;">
          <div class="progress-bar-fill" style="width: ${progress.percentage}%; height: 100%; background-color: var(--color-primary); border-radius: 4px; transition: width 0.3s;"></div>
        </div>
      </div>

      <div class="cart-layout-grid" style="display:grid; grid-template-columns: 1fr 380px; gap:30px; align-items:start;">
        <div class="cart-items-column">
          <div class="cart-table-header cart-table-header-selectable" style="display:grid; grid-template-columns: 42px 2fr 1fr 1fr 1fr 56px; padding:12px 15px; border-bottom:2px solid var(--color-gray-border); font-weight:700; font-size:14px; color:var(--color-text-dark);">
            <label class="cart-check-label cart-select-all-wrap" title="Chọn tất cả">
              <input type="checkbox" id="cart-select-all" ${allSelected ? "checked" : ""} onchange="toggleSelectAll(this.checked)">
              <span class="cart-custom-check"></span>
            </label>
            <span><span class="lang-vi">Sản phẩm</span><span class="lang-en">Product</span></span>
            <span style="text-align:center;"><span class="lang-vi">Đơn giá</span><span class="lang-en">Price</span></span>
            <span style="text-align:center;"><span class="lang-vi">Số lượng</span><span class="lang-en">Qty</span></span>
            <span style="text-align:center;"><span class="lang-vi">Thành tiền</span><span class="lang-en">Subtotal</span></span>
            <span></span>
          </div>

          <div class="cart-items-list" style="margin-bottom:20px;">
            ${cartItems.map(item => renderCartItemRow(item)).join("")}
          </div>

          <div class="cart-bottom-actions" style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; gap:12px; flex-wrap:wrap;">
            <a href="products.html" class="btn btn-outline btn-sm">&larr; <span class="lang-vi">Tiếp tục mua sắm</span><span class="lang-en">Continue shopping</span></a>
            <button class="btn btn-secondary btn-xs" style="background-color:var(--color-danger); color:white; border:none;" onclick="clearCart()"><span class="lang-vi">Xóa sạch giỏ hàng</span><span class="lang-en">Clear Cart</span></button>
          </div>
        </div>

        <div class="cart-summary-column">
          <div class="summary-card" style="background-color:var(--color-cream-light); padding:25px; border-radius:12px; border:1px solid var(--color-gray-border);">
            <h3 style="font-size:18px; color:var(--color-text-dark); margin:0 0 20px 0; border-bottom:1px solid var(--color-gray-border); padding-bottom:8px;">
              <span class="lang-vi">Tổng đơn hàng</span><span class="lang-en">Order Summary</span>
            </h3>
            
            <div style="display:flex; flex-direction:column; gap:12px; font-size:14px; margin-bottom:20px;">
              <div style="display:flex; justify-content:space-between; gap:12px;">
                <span><span class="lang-vi">Đã chọn:</span><span class="lang-en">Selected:</span></span>
                <span>${selectedCount}/${cartItems.length} products</span>
              </div>
              <div style="display:flex; justify-content:space-between; gap:12px;">
                <span><span class="lang-vi">Tạm tính:</span><span class="lang-en">Subtotal:</span></span>
                <span>${formatCurrency(totals.subtotal)}</span>
              </div>
              <div style="display:flex; justify-content:space-between; gap:12px;">
                <span><span class="lang-vi">Phí giao hàng:</span><span class="lang-en">Shipping:</span></span>
                <span>${totals.shipping === 0 ? "Freeship" : formatCurrency(totals.shipping)}</span>
              </div>

              ${totals.shippingDiscount > 0 ? `
                <div style="display:flex; justify-content:space-between; color:var(--color-primary); font-weight:600; gap:12px;">
                  <span><span class="lang-vi">Vận chuyển (Mã giảm):</span><span class="lang-en">Ship Promo:</span></span>
                  <span>-${formatCurrency(totals.shippingDiscount)}</span>
                </div>
              ` : ""}

              ${totals.discount > 0 ? `
                <div style="display:flex; justify-content:space-between; color:var(--color-primary); font-weight:600; gap:12px;">
                  <span><span class="lang-vi">Giảm giá mã (${totals.voucherCode}):</span><span class="lang-en">Voucher Discount:</span></span>
                  <span>-${formatCurrency(totals.discount)}</span>
                </div>
              ` : ""}

              <hr style="border:none; border-top:1px solid var(--color-gray-border); margin:5px 0;">

              <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; color:var(--color-primary); gap:12px;">
                <span><span class="lang-vi">Tổng cộng:</span><span class="lang-en">Total cost:</span></span>
                <span>${formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div style="background:white; padding:15px; border-radius:8px; border:1px solid var(--color-gray-border); margin-bottom:18px;">
              <label style="font-weight:600; font-size:13px; display:block; margin-bottom:8px;"><span class="lang-vi">Nhập mã giảm giá:</span><span class="lang-en">Discount code:</span></label>
              <div class="cart-voucher-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                ${(() => {
                  const currentLang = localStorage.getItem("tqg_lang") || "vi";
                  const placeholderText = currentLang === "en" ? "e.g. TUQUYGARDEN10" : "Ví dụ: TUQUYGARDEN10";
                  return `<input type="text" id="cart-voucher-input" placeholder="${placeholderText}" style="flex:1; min-width:160px; padding:8px 10px; border-radius:6px; border:1px solid var(--color-gray-border); font-size:13px; outline:none;" value="${totals.voucherCode || ""}" ${totals.voucherCode ? "disabled" : ""}>`;
                })()}
                ${totals.voucherCode 
                  ? `<button class="btn btn-danger" style="padding:8px 12px; font-size:13px;" onclick="removeVoucher()"><span class="lang-vi">Gỡ</span><span class="lang-en">Remove</span></button>`
                  : `<button class="btn btn-primary" style="padding:8px 12px; font-size:13px;" onclick="applyVoucher()"><span class="lang-vi">Áp dụng</span><span class="lang-en">Apply</span></button>`
                }
                <button class="btn btn-outline cart-voucher-picker-btn" style="padding:8px 12px; font-size:13px;" onclick="openVoucherModal()" type="button"><span class="lang-vi">Chọn voucher</span><span class="lang-en">Choose voucher</span></button>
              </div>
              ${(() => {
                const currentLang = localStorage.getItem("tqg_lang") || "vi";
                let displayDesc = totals.voucherDescription;
                if (currentLang === "en") {
                  if (totals.voucherCode === "FREESHIP") displayDesc = "Free shipping";
                  else if (totals.voucherCode === "TUQUYGARDEN10") displayDesc = "10% off, max 50,000đ";
                  else if (totals.voucherCode === "HEALTHY50") displayDesc = "50,000đ off for orders from 500,000đ";
                }
                return totals.voucherCode 
                  ? `<p style="font-size:11px; color:var(--color-primary); margin-top:8px; font-weight:600;">✓ ${escapeHTML(displayDesc)}</p>` 
                  : `<p style="font-size:10px; color:var(--color-text-light); margin-top:6px;">
                      <span class="lang-vi">* Thử mã: <strong>FREESHIP</strong>, <strong>TUQUYGARDEN10</strong> hoặc <strong>HEALTHY50</strong></span>
                      <span class="lang-en">* Try code: <strong>FREESHIP</strong>, <strong>TUQUYGARDEN10</strong> or <strong>HEALTHY50</strong></span>
                     </p>`;
              })()}
            </div>

            ${selectedCount === 0 ? `<p class="cart-selection-warning">Please select at least one product to checkout</p>` : ""}

            <a href="checkout.html" onclick="handleCheckoutClick(event)" class="btn btn-primary btn-block btn-lg ${selectedCount === 0 ? "cart-checkout-disabled" : ""}" aria-disabled="${selectedCount === 0}" style="font-size:15px; padding:12px 0;">
              <span class="lang-vi">Tiến hành thanh toán</span><span class="lang-en">Proceed to Checkout</span>
            </a>
          </div>
        </div>
      </div>

      ${renderVoucherModal(totals.subtotal)}

      ${crossSell.length === 0 ? "" : `
        <div class="cross-sell-section" style="margin-top: 50px; border-top:1px solid var(--color-gray-border); padding-top:40px;">
          <h2 class="section-title font-serif" style="font-size: 24px; margin-bottom:25px;">
            <span class="lang-vi">Bạn có thể thích thêm</span><span class="lang-en">You might also like</span>
          </h2>
          <div class="products-grid-4" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:20px;">
            ${crossSell.map(item => window.Components.ProductCard(item)).join("")}
          </div>
        </div>
      `}
    </div>
  `;

  updateSelectAllState();
}

function renderCartItemRow(item) {
  const selected = cartPageState.selectedIds.has(Number(item.productId));
  return `
    <div class="cart-item-row cart-item-row-selectable ${selected ? "" : "cart-item-unselected"}" data-product-id="${item.productId}" style="display:grid; grid-template-columns: 42px 2fr 1fr 1fr 1fr 56px; padding:20px 15px; border-bottom:1px solid var(--color-gray-border); align-items:center; font-size:14px;">
      <div class="cart-select-cell">
        <label class="cart-check-label" title="Chọn sản phẩm">
          <input type="checkbox" ${selected ? "checked" : ""} onchange="toggleCartItemSelection(${item.productId}, this.checked)">
          <span class="cart-custom-check"></span>
        </label>
      </div>
      <div class="col-product" style="display:flex; gap:15px; align-items:center;">
        <img src="${item.product.image}" alt="${escapeHTML(item.product.name)}" style="width:65px; height:65px; border-radius:8px; object-fit:contain; background-color:var(--color-cream-light);">
        <div>
          <h4 style="margin:0 0 4px 0; font-size:15px; font-weight:700;"><a href="detail.html?id=${item.productId}" style="color:var(--color-text-dark);">${escapeHTML(item.product.name)}</a></h4>
          <span style="font-size:11px; color:var(--color-text-light); display:block;">${translateCategory(item.product.category)}</span>
          <span style="font-size:11px; color:var(--color-primary); display:block; font-weight:600;"><span class="lang-vi">Còn lại: ${item.product.stock}</span><span class="lang-en">Stock: ${item.product.stock}</span></span>
        </div>
      </div>

      <div style="text-align:center;"><span class="mobile-label">Đơn giá</span><span>${formatCurrency(item.product.price)}</span></div>

      <div style="display:flex; justify-content:center;">
        <span class="mobile-label">Số lượng</span>
        <div class="qty-adjuster-sm" style="display:flex; align-items:center; border:1px solid var(--color-gray-border); border-radius:4px; overflow:hidden; background:white;">
          <button style="border:none; padding:4px 8px; background:none; cursor:pointer;" onclick="adjustQty(${item.productId}, -1)">-</button>
          <input type="number" value="${item.quantity}" min="1" max="${item.product.stock}" style="border:none; width:30px; text-align:center; outline:none; font-weight:600;" onchange="setQty(${item.productId}, this.value)">
          <button style="border:none; padding:4px 8px; background:none; cursor:pointer;" onclick="adjustQty(${item.productId}, 1)">+</button>
        </div>
      </div>

      <div style="text-align:center; font-weight:700; color:var(--color-text-dark);"><span class="mobile-label">Thành tiền</span><span>${formatCurrency(item.product.price * item.quantity)}</span></div>

      <div class="action-cell" style="text-align:center;">
        <button class="remove-item-btn cart-trash-btn" onclick="removeItem(${item.productId})" title="Xóa sản phẩm" aria-label="Xóa ${escapeHTML(item.product.name)}">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
        </button>
      </div>
    </div>
  `;
}

function renderVoucherModal(selectedSubtotal) {
  const currentLang = localStorage.getItem("tqg_lang") || "vi";
  const modalTitle = currentLang === "en" ? "Select Voucher" : "Chọn voucher";
  const selectLabel = currentLang === "en" ? "Currently selected total:" : "Tổng đã chọn hiện tại:";
  const closeLabel = currentLang === "en" ? "Close modal" : "Đóng modal";

  return `
    <div class="cart-voucher-modal" id="cart-voucher-modal" aria-hidden="true">
      <div class="cart-voucher-overlay" onclick="closeVoucherModal()"></div>
      <div class="cart-voucher-card" role="dialog" aria-modal="true" aria-labelledby="cart-voucher-title">
        <button type="button" class="cart-voucher-close" onclick="closeVoucherModal()" aria-label="${closeLabel}">&times;</button>
        <h3 id="cart-voucher-title">${modalTitle}</h3>
        <p class="cart-voucher-subtitle">${selectLabel} <strong>${formatCurrency(selectedSubtotal)}</strong></p>
        <div class="cart-voucher-list">
          ${CART_VOUCHERS.map(voucher => {
            const eligible = selectedSubtotal >= voucher.minOrder;
            const title = currentLang === "en" ? voucher.titleEn : voucher.titleVi;
            const description = currentLang === "en" ? voucher.descEn : voucher.descVi;
            const condition = currentLang === "en" ? voucher.condEn : voucher.condVi;
            const btnText = eligible 
              ? (currentLang === "en" ? "Apply" : "Áp dụng") 
              : (currentLang === "en" ? "Not eligible" : "Chưa đủ điều kiện");
            return `
              <div class="cart-voucher-item ${eligible ? "" : "is-disabled"}">
                <div>
                  <strong>${voucher.code}</strong>
                  <h4>${title}</h4>
                  <p>${description}</p>
                  <span>${condition}</span>
                </div>
                <button type="button" class="btn ${eligible ? "btn-primary" : "btn-outline"}" ${eligible ? `onclick="applyVoucherCode('${voucher.code}')"` : "disabled"}>${btnText}</button>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderEmptyCart(root) {
  root.innerHTML = `
    <div class="cart-page-container container text-center" style="padding: 100px 0;">
      <div class="empty-icon-circle" style="width:80px; height:80px; background-color:var(--color-cream-light); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px auto; color:var(--color-text-light);">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
      </div>
      <h2 class="font-serif" style="font-size:24px; margin-bottom:10px;"><span class="lang-vi">Giỏ hàng của bạn đang trống</span><span class="lang-en">Your Cart is empty</span></h2>
      <p style="color: var(--color-text-light); max-width: 500px; margin: 10px auto 25px auto; font-size:14px;"><span class="lang-vi">Hãy ghé thăm cửa hàng của chúng tôi để lựa chọn các loại trái cây chín ngọt và hạt dinh dưỡng cao cấp nhất.</span><span class="lang-en">Visit our catalog to add ripe fruits and delicious seeds to your order.</span></p>
      <a href="products.html" class="btn btn-primary btn-lg"><span class="lang-vi">Mua sắm ngay</span><span class="lang-en">Shop Now</span></a>
    </div>
  `;
}

function updateSelectAllState() {
  const selectAll = document.getElementById("cart-select-all");
  if (!selectAll) return;
  const cartItems = getCartItems();
  const selectedCount = getSelectedItems(cartItems).length;
  const isPartial = selectedCount > 0 && selectedCount < cartItems.length;
  const label = selectAll.closest(".cart-check-label");
  selectAll.checked = selectedCount > 0 && selectedCount === cartItems.length;
  selectAll.indeterminate = isPartial;
  selectAll.dataset.state = isPartial ? "partial" : (selectAll.checked ? "all" : "none");
  if (label) label.classList.toggle("is-indeterminate", isPartial);
}

function refreshCart() {
  renderCartPage();
  if (window.updateHeaderState) window.updateHeaderState();
}

function showCartToast(message, type = "success", action) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast cart-action-toast ${type}`;
  const iconColor = type === "error" ? "var(--color-danger)" : type === "info" ? "#4f7d8f" : "var(--color-primary)";
  toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:${iconColor}; flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg><span>${escapeHTML(message)}</span>`;

  let timer;
  if (action && typeof action.handler === "function") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "toast-undo-btn";
    btn.textContent = action.label || "Undo";
    btn.addEventListener("click", () => {
      window.clearTimeout(timer);
      action.handler();
      toast.remove();
    });
    toast.appendChild(btn);
  }

  container.appendChild(toast);
  timer = window.setTimeout(() => {
    toast.classList.add("fade-out");
    window.setTimeout(() => toast.remove(), 300);
  }, action ? 4000 : 3000);
}

function validateVoucherForSelected(code) {
  const voucher = CART_VOUCHERS.find(item => item.code === code.toUpperCase());
  const selectedSubtotal = calculateTotalsFromItems(getSelectedItems(getCartItems())).subtotal;
  if (!voucher) return { success: true };
  if (selectedSubtotal < voucher.minOrder) {
    return { success: false, message: `Voucher ${voucher.code} requires a minimum order of ${formatCurrency(voucher.minOrder)}.` };
  }
  return { success: true };
}

window.toggleCartItemSelection = function(productId, checked) {
  const id = Number(productId);
  if (checked) {
    cartPageState.selectedIds.add(id);
    cartPageState.manuallyDeselected.delete(id);
  } else {
    cartPageState.selectedIds.delete(id);
    cartPageState.manuallyDeselected.add(id);
  }
  renderCartPage();
};

window.toggleSelectAll = function(checked) {
  const cartItems = getCartItems();
  if (checked) {
    cartItems.forEach(item => cartPageState.selectedIds.add(Number(item.productId)));
    cartPageState.manuallyDeselected.clear();
  } else {
    cartPageState.selectedIds.clear();
    cartItems.forEach(item => cartPageState.manuallyDeselected.add(Number(item.productId)));
  }
  renderCartPage();
};

window.adjustQty = function(productId, amount) {
  if (!window.CartService) return;
  const cart = window.CartService.getCart();
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  const result = window.CartService.updateQuantity(productId, item.quantity + amount);
  if (result.success) refreshCart();
  else showCartToast(result.message, "error");
};

window.setQty = function(productId, val) {
  if (!window.CartService) return;
  const result = window.CartService.updateQuantity(productId, parseInt(val, 10) || 1);
  if (result.success) refreshCart();
  else showCartToast(result.message, "error");
};

window.removeItem = function(productId) {
  if (!window.CartService) return;
  const cart = window.CartService.getCart();
  const removedIndex = cart.findIndex(item => item.productId === productId);
  const removedItem = cart[removedIndex];
  const product = window.MOCK_PRODUCTS.find(p => p.id === productId);
  const wasSelected = cartPageState.selectedIds.has(Number(productId));
  if (!removedItem) return;

  const result = window.CartService.removeFromCart(productId);
  if (result.success) {
    cartPageState.selectedIds.delete(Number(productId));
    cartPageState.manuallyDeselected.delete(Number(productId));
    refreshCart();
    showCartToast(`Removed ${product ? product.name : "product"} from cart`, "success", {
      label: "Undo",
      handler: () => {
        if (window.CartService.restoreCartItem) {
          window.CartService.restoreCartItem(removedItem, removedIndex);
        } else {
          const currentCart = window.CartService.getCart();
          currentCart.splice(removedIndex, 0, removedItem);
          window.CartService.saveCart(currentCart);
        }
        if (wasSelected) {
          cartPageState.selectedIds.add(Number(productId));
          cartPageState.manuallyDeselected.delete(Number(productId));
        } else {
          cartPageState.selectedIds.delete(Number(productId));
          cartPageState.manuallyDeselected.add(Number(productId));
        }
        refreshCart();
      }
    });
  }
};

window.clearCart = function() {
  if (!window.CartService) return;
  const isEn = (localStorage.getItem("tqg_lang") || "en") === "en";
  
  const title = isEn ? "Clear Cart" : "Xóa giỏ hàng";
  const message = isEn ? "Are you sure you want to clear your entire cart?" : "Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?";
  const confirmBtnText = isEn ? "Clear Cart" : "Xóa giỏ hàng";
  const cancelBtnText = isEn ? "Cancel" : "Hủy";

  const modalHTML = `
    <div style="text-align: center; padding: 20px 15px; font-family: 'Outfit', sans-serif;">
      <div style="font-size: 46px; margin-bottom: 18px; color: #ef4444;">⚠️</div>
      <h3 style="font-size: 20px; font-weight: 800; color: #2E3A2B; margin-bottom: 12px; font-family: 'Outfit', sans-serif;">${title}</h3>
      <p style="font-size: 14.5px; color: #5B6A56; margin-bottom: 28px; line-height: 1.6; font-family: 'Inter', sans-serif;">${message}</p>
      <div style="display: flex; gap: 14px; justify-content: center; width: 100%;">
        <button onclick="window.closeCustomModal()" class="btn btn-outline" style="min-width: 120px; font-weight: 700; border-radius: 10px; padding: 10px 18px; font-family: 'Outfit', sans-serif; font-size: 14px; cursor: pointer;">${cancelBtnText}</button>
        <button id="modal-confirm-clear-btn" class="btn btn-primary" style="background: #ef4444; border-color: #ef4444; color: white; min-width: 120px; font-weight: 700; border-radius: 10px; padding: 10px 18px; font-family: 'Outfit', sans-serif; font-size: 14px; cursor: pointer;">${confirmBtnText}</button>
      </div>
    </div>
  `;

  if (window.showCustomModal) {
    window.showCustomModal(modalHTML);
    const confirmBtn = document.getElementById("modal-confirm-clear-btn");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        window.CartService.clearCart();
        cartPageState.selectedIds.clear();
        cartPageState.manuallyDeselected.clear();
        showCartToast(isEn ? "Cart cleared successfully." : "Đã xóa sạch giỏ hàng.", "success");
        window.closeCustomModal();
        refreshCart();
      });
    }
  } else {
    if (confirm(message)) {
      window.CartService.clearCart();
      cartPageState.selectedIds.clear();
      cartPageState.manuallyDeselected.clear();
      showCartToast(isEn ? "Cart cleared successfully." : "Đã xóa sạch giỏ hàng.", "success");
      refreshCart();
    }
  }
};

window.applyVoucher = function() {
  const input = document.getElementById("cart-voucher-input");
  if (!input || !input.value.trim()) {
    showCartToast("Please enter code.", "error");
    return;
  }
  window.applyVoucherCode(input.value.trim());
};

window.applyVoucherCode = function(code) {
  if (!window.CartService) return;
  const formattedCode = code.trim().toUpperCase();
  const validation = validateVoucherForSelected(formattedCode);
  if (!validation.success) {
    showCartToast(validation.message, "error");
    return;
  }

  const result = window.CartService.applyVoucher(formattedCode);
  if (result.success) {
    const input = document.getElementById("cart-voucher-input");
    if (input) input.value = formattedCode;
    closeVoucherModal();
    showCartToast(`Code ${formattedCode} applied successfully`, "success");
    renderCartPage();
  } else {
    showCartToast(result.message, "error");
  }
};

window.removeVoucher = function() {
  if (!window.CartService) return;
  window.CartService.removeVoucher();
  showCartToast("Promo code removed.", "success");
  renderCartPage();
};

window.openVoucherModal = function() {
  const modal = document.getElementById("cart-voucher-modal");
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
};

window.closeVoucherModal = function() {
  const modal = document.getElementById("cart-voucher-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

window.handleCheckoutClick = function(event) {
  if (!window.AuthService || !window.AuthService.getCurrentUser()) {
    event.preventDefault();
    const isEn = (localStorage.getItem("tqg_lang") || "en") === "en";
    showCartToast(
      isEn 
        ? "Please log in to make a purchase." 
        : "Vui lòng đăng nhập tài khoản để thực hiện mua hàng.", 
      "error"
    );
    setTimeout(() => {
      window.location.href = "login.html?redirect=cart.html";
    }, 1500);
    return;
  }

  const selectedItems = getSelectedItems(getCartItems());
  if (selectedItems.length === 0) {
    event.preventDefault();
    showCartToast("Please select at least one product to checkout", "error");
    return;
  }

  localStorage.setItem(CHECKOUT_SELECTED_KEY, JSON.stringify(selectedItems.map(item => item.productId)));
};
