// js/checkout.js

let placedOrderId = "";
let placedOrderTotal = 0;
let placedDeliveryText = "Expected 2-3 days";
let paymentMethodsExpanded = false;

const CHECKOUT_VOUCHERS = [
  { code: "FREESHIP", title: "Free Shipping", description: "Applies to all orders", condition: "No minimum order required", type: "freeship", discountVal: 30000, minOrder: 0 },
  { code: "TUQUYGARDEN10", title: "10% Off", description: "Up to 100,000đ", condition: "Applies to all orders", type: "percentage", discountVal: 10, maxDiscount: 100000, minOrder: 0 },
  { code: "HEALTHY50", title: "50,000đ Off", description: "For orders from 500,000đ", condition: "Min order 500,000đ", type: "fixed", discountVal: 50000, minOrder: 500000 }
];

const SHIPPING_METHODS = {
  standard: { id: "standard", title: "Standard Shipping", desc: "Estimated delivery in 2-3 days", price: 0, priceText: "Free", tag: "Recommended" },
  express: { id: "express", title: "Express Shipping", desc: "Estimated delivery in 24h-48h", price: 30000, priceText: "30.000đ" },
  scheduled: { id: "scheduled", title: "Scheduled Delivery", desc: "Choose your preferred time slot", price: 40000, priceText: "40.000đ" }
};

const PAYMENT_METHODS = {
  COD: { id: "COD", title: "Cash on Delivery (COD)", desc: "Pay the shipper upon receiving items" },
  "E-wallet": { id: "E-wallet", title: "E-Wallet (MoMo / ZaloPay)", desc: "Demo payment feature for project" },
  "Bank transfer": { id: "Bank transfer", title: "Bank Transfer", desc: "Transfer according to the demo bank details" },
  Card: { id: "Card", title: "ATM / Visa Card (Demo)", desc: "Demo payment feature for project" }
};

const checkoutState = {
  address: {
    id: "addr-default",
    fullName: "Nguyen Hoang Anh",
    phone: "0912345678",
    email: "anhnguyen@gmail.com",
    province: "TP. Ho Chi Minh",
    district: "Thu Duc City",
    ward: "Linh Trung Ward",
    address: "VNU-HCM Dormitory Zone B",
    note: "",
    isDefault: true
  },
  addressBook: [],
  selectedAddressId: "",
  locationData: {
    loading: false,
    loaded: false,
    error: "",
    provinces: [],
    wardsByProvince: {}
  },
  shipping: { method: "standard", timeSlot: "" },
  payment: "COD",
  bankTransfer: { selectedBankId: "vcb-001" },
  linkedBanks: [
    {
      id: "vcb-001",
      bankName: "Vietcombank",
      accountHolder: "NGUYEN HOANG ANH",
      accountNumber: "0123456789",
      isDefault: true
    }
  ],
  extras: { giftBox: false, greetingCard: false, message: "" },
  rewardApplied: false,
  invoice: { enabled: false, company: "", taxCode: "", email: "" }
};

let draftAddressModal = null;
let addressMap = null;
let addressMarker = null;

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = window.AuthService ? window.AuthService.getCurrentUser() : null;
  if (!currentUser) {
    window.location.replace("login.html?redirect=cart.html");
    return;
  }
  if (currentUser.isAdmin) {
    window.location.replace("admin-dashboard.html");
    return;
  }
  placedOrderId = "";
  hydrateCheckoutState();
  loadVietnamLocations();
  renderCheckoutPage();
});

function hydrateCheckoutState() {
  const currentUser = window.AuthService ? window.AuthService.getCurrentUser() || {} : {};
  checkoutState.address.fullName = currentUser.name || checkoutState.address.fullName;
  checkoutState.address.phone = currentUser.phone || checkoutState.address.phone;
  checkoutState.address.email = currentUser.email || checkoutState.address.email;
  normalizeAddressBook();
}

function normalizeAddressBook() {
  if (!Array.isArray(checkoutState.addressBook) || checkoutState.addressBook.length === 0) {
    const legacyAddress = {
      id: checkoutState.address.id || "addr-default",
      fullName: checkoutState.address.fullName || "",
      phone: checkoutState.address.phone || "",
      email: checkoutState.address.email || "",
      provinceCode: checkoutState.address.provinceCode || "",
      provinceName: checkoutState.address.provinceName || "",
      wardCode: checkoutState.address.wardCode || "",
      wardName: checkoutState.address.wardName || "",
      latitude: checkoutState.address.latitude || null,
      longitude: checkoutState.address.longitude || null,
      province: checkoutState.address.province || "",
      district: checkoutState.address.district || "",
      ward: checkoutState.address.ward || "",
      address: checkoutState.address.address || "",
      note: checkoutState.address.note || "",
      isDefault: checkoutState.address.isDefault !== false
    };
    checkoutState.addressBook = [legacyAddress];
    checkoutState.selectedAddressId = legacyAddress.id;
  }

  const selected = checkoutState.addressBook.find(item => item.id === checkoutState.selectedAddressId)
    || checkoutState.addressBook.find(item => item.isDefault)
    || checkoutState.addressBook[0];

  checkoutState.selectedAddressId = selected.id;
  checkoutState.address = selected;
}

function removeVietnameseTones(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeLocationText(text) {
  return removeVietnameseTones(text)
    .toLowerCase()
    .replace(/tp\.?/g, "thanh pho")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const FALLBACK_LOCATION_DATA = {
  provinces: [
    { code: "79", name: "Ho Chi Minh City" },
    { code: "01", name: "Hanoi City" },
    { code: "48", name: "Da Nang City" }
  ],
  wardsByProvince: {
    "79": [
      { code: "26734", name: "Linh Trung Ward", provinceCode: "79" },
      { code: "26737", name: "Thu Duc Ward", provinceCode: "79" }
    ],
    "01": [
      { code: "00001", name: "Ba Dinh Ward", provinceCode: "01" }
    ],
    "48": [
      { code: "20194", name: "Hai Chau Ward", provinceCode: "48" }
    ]
  }
};

async function loadVietnamLocations() {
  const locationData = checkoutState.locationData;
  if (locationData.loaded || locationData.loading) return locationData;

  locationData.loading = true;
  locationData.error = "";

  try {
    const response = await fetch("data/vietnam-addresses-demo.json", { cache: "force-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    locationData.provinces = Array.isArray(data.provinces) ? data.provinces : [];
    locationData.wardsByProvince = data.wardsByProvince || {};
    locationData.loaded = true;
  } catch (error) {
    locationData.error = "Could not load local address data";
    locationData.provinces = FALLBACK_LOCATION_DATA.provinces;
    locationData.wardsByProvince = FALLBACK_LOCATION_DATA.wardsByProvince;
    locationData.loaded = true;
  } finally {
    locationData.loading = false;
    if (document.getElementById("checkout-modal")?.classList.contains("is-open") && draftAddressModal) {
      draftAddressModal = hydrateAddressLocation(draftAddressModal);
      renderAddressForm(draftAddressModal);
    }
  }

  return locationData;
}

function getProvinceByCode(code) {
  return checkoutState.locationData.provinces.find(province => province.code === String(code || ""));
}

function getWardByCode(provinceCode, wardCode) {
  return (checkoutState.locationData.wardsByProvince[provinceCode] || []).find(ward => ward.code === String(wardCode || ""));
}

function findProvinceByName(name) {
  const normalizedName = normalizeLocationText(name);
  if (!normalizedName) return null;
  return checkoutState.locationData.provinces.find(province => {
    const provinceName = normalizeLocationText(province.name);
    return provinceName === normalizedName || provinceName.includes(normalizedName) || normalizedName.includes(provinceName);
  }) || null;
}

function findWardByName(provinceCode, wardName) {
  const normalizedName = normalizeLocationText(wardName);
  if (!normalizedName) return null;
  return (checkoutState.locationData.wardsByProvince[provinceCode] || []).find(ward => {
    const candidate = normalizeLocationText(ward.name);
    return candidate === normalizedName || candidate.includes(normalizedName) || normalizedName.includes(candidate);
  }) || null;
}

function hydrateAddressLocation(address) {
  const draft = { ...address };
  const province = getProvinceByCode(draft.provinceCode) || findProvinceByName(draft.provinceName || draft.province);
  if (province) {
    draft.provinceCode = province.code;
    draft.provinceName = province.name;
    draft.province = province.name;
  }

  const ward = getWardByCode(draft.provinceCode, draft.wardCode) || findWardByName(draft.provinceCode, draft.wardName || draft.ward);
  if (ward) {
    draft.wardCode = ward.code;
    draft.wardName = ward.name;
    draft.ward = ward.name;
  }

  return draft;
}

function getSelectedAddress() {
  normalizeAddressBook();
  return checkoutState.addressBook.find(item => item.id === checkoutState.selectedAddressId) || checkoutState.address;
}

function formatCurrency(value) {
  return `${Math.max(0, value || 0).toLocaleString("vi-VN")}đ`;
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
  
  const selectedStr = localStorage.getItem("tuquy_checkout_selected_ids");
  let selectedIds = null;
  if (selectedStr) {
    try {
      selectedIds = JSON.parse(selectedStr);
    } catch(e) {}
  }

  const filteredCart = cart.filter(item => !selectedIds || selectedIds.includes(item.productId));
  return filteredCart.map(item => {
    const product = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);
}

function getActiveVoucher() {
  const active = window.CartService ? window.CartService.getActiveVoucher() : null;
  if (!active) return null;
  return CHECKOUT_VOUCHERS.find(voucher => voucher.code === active.code) || active;
}

function getAddressLine() {
  const a = getSelectedAddress();
  if (a.provinceName || a.wardName || a.provinceCode || a.wardCode) {
    return [a.address, a.wardName || a.ward, a.provinceName || a.province].filter(Boolean).join(", ");
  }
  return [a.address, a.ward, a.district, a.province].filter(Boolean).join(", ");
}

function getCheckoutTotals() {
  const items = getCartItems();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingMethod = SHIPPING_METHODS[checkoutState.shipping.method] || SHIPPING_METHODS.standard;
  const shippingBeforeDiscount = shippingMethod.price;
  const voucher = getActiveVoucher();
  let shippingDiscount = 0;
  let voucherDiscount = 0;

  if (voucher && subtotal >= (voucher.minOrder || 0)) {
    if (voucher.type === "freeship") {
      shippingDiscount = Math.min(shippingBeforeDiscount, voucher.discountVal || shippingBeforeDiscount);
    } else if (voucher.type === "percentage") {
      const raw = Math.round(subtotal * ((voucher.discountVal || 0) / 100));
      voucherDiscount = voucher.maxDiscount ? Math.min(raw, voucher.maxDiscount) : raw;
    } else if (voucher.type === "fixed") {
      voucherDiscount = Math.min(voucher.discountVal || 0, subtotal);
    }
  }

  const giftBox = checkoutState.extras.giftBox ? 25000 : 0;
  const greetingCard = checkoutState.extras.greetingCard ? 10000 : 0;
  const rewardDiscount = checkoutState.rewardApplied ? 50000 : 0;
  const shipping = Math.max(0, shippingBeforeDiscount - shippingDiscount);
  const total = Math.max(0, subtotal + shipping + giftBox + greetingCard - voucherDiscount - rewardDiscount);
  const saved = shippingDiscount + voucherDiscount + rewardDiscount;
  const rewardEarned = Math.max(0, Math.floor(total / 10000));

  return { subtotal, shippingBeforeDiscount, shipping, shippingDiscount, voucherDiscount, rewardDiscount, giftBox, greetingCard, total, saved, rewardEarned, voucher };
}

function icon(name) {
  const icons = {
    location: '<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M10 17h4V5H2v12h3"></path><path d="M14 8h4l4 4v5h-3"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>',
    wallet: '<svg viewBox="0 0 24 24"><path d="M20 7H5a3 3 0 0 1 0-6h12v4"></path><path d="M3 5v14a3 3 0 0 0 3 3h14a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1"></path><path d="M16 14h2"></path></svg>',
    gift: '<svg viewBox="0 0 24 24"><path d="M20 12v10H4V12"></path><path d="M2 7h20v5H2z"></path><path d="M12 22V7"></path><path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7Z"></path><path d="M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"></path></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="m12 2 3 7 7 .6-5.3 4.7 1.6 6.9L12 17.5l-6.3 3.7 1.6-6.9L2 9.6 9 9l3-7Z"></path></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M6 7h12l1 14H5L6 7Z"></path><path d="M9 7a3 3 0 0 1 6 0"></path></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg>',
    tag: '<svg viewBox="0 0 24 24"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"></path><circle cx="7.5" cy="7.5" r="1.5"></circle></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="m9 12 2 2 4-5"></path></svg>',
    headset: '<svg viewBox="0 0 24 24"><path d="M3 14h3a2 2 0 0 1 2 2v3H6a3 3 0 0 1-3-3v-2Z"></path><path d="M21 14h-3a2 2 0 0 0-2 2v3h2a3 3 0 0 0 3-3v-2Z"></path><path d="M3 14a9 9 0 0 1 18 0"></path><path d="M13 21h3a2 2 0 0 0 2-2"></path></svg>',
    package: '<svg viewBox="0 0 24 24"><path d="m21 8-9-5-9 5 9 5 9-5Z"></path><path d="M3 8v8l9 5 9-5V8"></path><path d="M12 13v8"></path></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>'
  };
  return icons[name] || icons.check;
}

function renderCheckoutPage() {
  const root = document.getElementById("checkout-root");
  if (!root || !window.CartService) return;

  if (placedOrderId) {
    renderSuccessScreen(root);
    return;
  }

  const cartItems = getCartItems();
  if (cartItems.length === 0) {
    root.innerHTML = renderEmptyCheckout();
    return;
  }

  const totals = getCheckoutTotals();
  root.innerHTML = `
    <main class="modern-checkout-page">
      <div class="modern-checkout-container container">
        <div class="modern-checkout-grid">
          <section class="modern-checkout-main">
            ${renderAddressCard()}
            ${renderShippingCard()}
            ${renderPaymentCard()}
            ${renderExtrasCard()}
            ${renderRewardInvoiceCard()}
            <button type="button" class="modern-place-order-btn" onclick="openConfirmOrderModal()">${icon("lock")} <span>Place Order</span><strong>${formatCurrency(totals.total)}</strong>${icon("chevron")}</button>
            <p class="modern-checkout-terms">${icon("shield")} We protect your data and do not share it with third parties.</p>
          </section>
          <aside class="modern-checkout-sidebar">
            ${renderOrderSummary(cartItems, totals)}
          </aside>
        </div>
      </div>
      ${renderModalShell()}
    </main>
  `;
}

function renderEmptyCheckout() {
  return `
    <div class="checkout-page-container container text-center" style="padding: 100px 0;">
      <h2 class="font-serif">Your cart is empty</h2>
      <p>There are no products to check out. Please return to shopping.</p>
      <a href="products.html" class="btn btn-primary" style="margin-top: 20px;">Return to Store</a>
    </div>
  `;
}

function renderCheckoutHeader() {
  return "";
}

function renderSectionCard(type, title, body, extraClass = "") {
  return `
    <article class="modern-info-card ${extraClass}">
      <div class="modern-card-title"><span class="modern-card-icon">${icon(type)}</span><h2>${title}</h2></div>
      ${body}
    </article>
  `;
}

function renderAddressCard() {
  const a = getSelectedAddress();
  return renderSectionCard("location", "Shipping Address", `
    <div class="modern-address-card">
      <div class="modern-address-summary">
        <div class="modern-line-strong">${escapeHTML(a.fullName)} <span>•</span> ${formatPhone(a.phone)} ${a.isDefault ? '<em>Mặc định</em>' : ''}</div>
        ${a.email ? `<p>${escapeHTML(a.email)}</p>` : ""}
        <p>${escapeHTML(getAddressLine())}</p>
        ${a.note ? `<small class="address-note">Note: ${escapeHTML(a.note)}</small>` : ""}
      </div>
      <div class="address-card-actions">
        <button type="button" class="modern-outline-btn" onclick="openAddressModal()">${icon("edit")} Change</button>
      </div>
    </div>
  `);
}

function renderShippingCard() {
  const visibleMethods = [SHIPPING_METHODS.standard, SHIPPING_METHODS.express, SHIPPING_METHODS.scheduled];
  return renderSectionCard("truck", "Shipping Method", `
    <div class="modern-option-stack">
      ${visibleMethods.map(method => shippingOption(method)).join("")}
    </div>
    ${checkoutState.shipping.method === "scheduled" ? renderShippingTimeslot() : ""}
  `);
}

function shippingOption(method) {
  const checked = checkoutState.shipping.method === method.id;
  return `
    <label class="modern-choice-row ${checked ? "is-selected" : ""}">
      <input type="radio" name="checkout-shipping" value="${method.id}" ${checked ? "checked" : ""} onchange="selectShippingMethod(this.value)">
      <span class="modern-radio-dot"></span>
      <div class="modern-choice-copy">
        <strong>${method.title} ${method.tag ? `<em>${method.tag}</em>` : ""}</strong>
        <p>${method.desc}</p>
      </div>
      <b>${method.priceText}</b>
    </label>
  `;
}

function renderShippingTimeslot() {
  const slots = ["Sáng 8:00-11:00", "Chiều 13:00-17:00", "Tối 18:00-21:00"];
  const selectedSlot = checkoutState.shipping.timeSlot || slots[0];
  return `
    <div class="modern-scheduled-slot">
      <label for="checkout-shipping-timeslot">Preferred Delivery Time</label>
      <select id="checkout-shipping-timeslot" onchange="updateShippingTimeSlot(this.value)">
        ${slots.map(slot => `<option value="${slot}" ${slot === selectedSlot ? "selected" : ""}>${slot}</option>`).join("")}
      </select>
    </div>
  `;
}

function renderPaymentCard() {
  const primaryMethods = [PAYMENT_METHODS.COD, PAYMENT_METHODS["Bank transfer"]];
  const extraMethods = [PAYMENT_METHODS["E-wallet"], PAYMENT_METHODS.Card];
  const selectedExtra = extraMethods.some(method => method.id === checkoutState.payment);
  const methodsToRender = paymentMethodsExpanded || selectedExtra ? primaryMethods.concat(extraMethods) : primaryMethods;

  return renderSectionCard("wallet", "Payment Method", `
    <div class="modern-payment-methods">
      ${methodsToRender.map(method => paymentOption(method)).join("")}
    </div>
    <button type="button" class="payment-more-toggle" onclick="togglePaymentMethods()">${paymentMethodsExpanded ? "Collapse" : "Show more payment methods"}</button>
  `);
}

function paymentOption(method) {
  const checked = checkoutState.payment === method.id;
  return `
    <label class="modern-choice-row payment-choice ${checked ? "is-selected" : ""}">
      <input type="radio" name="checkout-payment" value="${method.id}" ${checked ? "checked" : ""} onchange="selectPaymentMethod(this.value)">
      <span class="modern-radio-dot"></span>
      <div class="modern-choice-copy">
        <strong>${method.title}</strong>
        <p>${method.desc}</p>
      </div>
    </label>
    ${checked ? renderPaymentInlineNote() : ""}
  `;
}

function renderPaymentInlineNote() {
  if (checkoutState.payment === "Bank transfer") {
    return renderBankTransferDetails();
  }

  if (checkoutState.payment === "E-wallet" || checkoutState.payment === "Card") {
    return `<p class="modern-demo-note checkout-inline-note">Chức năng thanh toán demo cho đồ án</p>`;
  }

  return "";
}

function getSelectedLinkedBank() {
  if (!checkoutState.linkedBanks.length) return null;
  return checkoutState.linkedBanks.find(bank => bank.id === checkoutState.bankTransfer.selectedBankId)
    || checkoutState.linkedBanks.find(bank => bank.isDefault)
    || checkoutState.linkedBanks[0];
}

function renderBankTransferDetails() {
  const banks = checkoutState.linkedBanks;
  const selectedBank = getSelectedLinkedBank();

  if (!banks.length) {
    return `
      <div class="bank-transfer-panel">
        <div>
          <strong>You have not linked a bank account</strong>
          <p>Link a bank account to use bank transfer.</p>
        </div>
        <button type="button" class="modern-outline-btn" onclick="openLinkBankModal()">Link Bank</button>
      </div>
    `;
  }

  if (selectedBank && checkoutState.bankTransfer.selectedBankId !== selectedBank.id) {
    checkoutState.bankTransfer.selectedBankId = selectedBank.id;
  }

  return `
    <div class="bank-transfer-panel">
      <div class="bank-transfer-header">
        <div>
          <strong>Linked Bank Account</strong>
          <p>Bank transfer details will be saved with the demo order.</p>
        </div>
        <button type="button" class="modern-outline-btn" onclick="openLinkBankModal()">Link Bank</button>
      </div>
      ${banks.length > 1 ? `
        <label class="bank-select-field">
          <span>Select Bank</span>
          <select onchange="selectLinkedBank(this.value)">
            ${banks.map(bank => `<option value="${bank.id}" ${bank.id === selectedBank.id ? "selected" : ""}>${escapeHTML(bank.bankName)} - ${maskBankAccount(bank.accountNumber)}</option>`).join("")}
          </select>
        </label>
      ` : ""}
      <div class="linked-bank-card">
        <div>
          <b>${escapeHTML(selectedBank.bankName)}</b>
          ${selectedBank.isDefault ? "<em>Mặc định</em>" : ""}
          <p>Account Holder: <strong>${escapeHTML(selectedBank.accountHolder)}</strong></p>
          <p>Account Number: <strong>${escapeHTML(selectedBank.accountNumber)}</strong></p>
          <p>Memo: <strong>TQG ${escapeHTML(getSelectedAddress().phone)}</strong></p>
        </div>
      </div>
    </div>
  `;
}

function maskBankAccount(accountNumber) {
  const value = String(accountNumber || "");
  if (value.length <= 4) return value;
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
}

function renderExtrasCard() {
  const giftTitle = '<span class="lang-vi">Gói quà tặng?</span><span class="lang-en">Add Gift Wrap?</span>';
  const greetingPlaceholder = document.body.classList.contains("lang-en")
    ? "Wishing you health and happiness!"
    : "Chúc bạn luôn khỏe mạnh và hạnh phúc!";

  return renderSectionCard("gift", giftTitle, `
      <div class="modern-gift-layout">
        <div class="modern-gift-copy">
          <p>
            <span class="lang-vi">Làm đơn hàng thêm đặc biệt hơn.</span>
            <span class="lang-en">Make your order feel more special.</span>
          </p>
          <label class="modern-choice-row compact ${checkoutState.extras.giftBox ? "is-selected" : ""}">
            <input type="radio" name="checkout-gift" ${checkoutState.extras.giftBox ? "checked" : ""} onchange="selectGiftWrap(true)">
            <span class="modern-radio-dot"></span>
            <strong>
              <span class="lang-vi">Có, gói giúp tôi! (+25.000đ)</span>
              <span class="lang-en">Yes, please! (+25.000đ)</span>
            </strong>
            <em><span class="lang-vi">Được gói đẹp</span><span class="lang-en">Beautiful wrap</span></em>
          </label>
          <label class="modern-choice-row compact ${!checkoutState.extras.giftBox ? "is-selected" : ""}">
            <input type="radio" name="checkout-gift" ${!checkoutState.extras.giftBox ? "checked" : ""} onchange="selectGiftWrap(false)">
            <span class="modern-radio-dot"></span>
            <strong><span class="lang-vi">Không, cảm ơn</span><span class="lang-en">No, thanks</span></strong>
          </label>
          <label class="modern-checkbox-row modern-greeting-toggle"><input type="checkbox" ${checkoutState.extras.greetingCard ? "checked" : ""} onchange="toggleExtra('greetingCard', this.checked)"><span></span><b><span class="lang-vi">Thêm thiệp chúc mừng?</span><span class="lang-en">Add greeting card?</span></b><em>+10.000đ</em></label>
          ${checkoutState.extras.greetingCard ? `<div class="modern-message-box"><textarea maxlength="100" placeholder="${greetingPlaceholder}" oninput="updateGreetingMessage(this)">${escapeHTML(checkoutState.extras.message)}</textarea><small>${checkoutState.extras.message.length}/100</small></div>` : ""}
        </div>
        <div class="gift-illustration" aria-hidden="true">
          <span class="gift-sparkle one"></span>
          <span class="gift-sparkle two"></span>
          <div class="gift-box-art">
            <div class="gift-lid"><span></span></div>
            <div class="gift-body"><span></span><i><span class="lang-vi">Tặng bạn</span><span class="lang-en">For you</span></i></div>
            <div class="gift-face"></div>
          </div>
        </div>
      </div>
  `, "modern-gift-card");
}

function renderRewardInvoiceCard() {
  return renderSectionCard("star", "Reward Points & Invoice", `
    <div class="reward-invoice-grid">
      <div class="reward-mini-card">
        <p>You currently have: <strong>1,250 points</strong></p>
        <label class="modern-checkbox-row"><input type="checkbox" ${checkoutState.rewardApplied ? "checked" : ""} onchange="toggleReward(this.checked)"><span></span><b>Use 500 points for a 50,000đ discount</b></label>
        <small>After using, you will have 750 points left</small>
      </div>
      <div class="reward-mini-card">
        <label class="modern-checkbox-row invoice-toggle"><input type="checkbox" ${checkoutState.invoice.enabled ? "checked" : ""} onchange="toggleInvoice(this.checked)"><span></span><b>I want to request an invoice</b></label>
        <small>Electronic invoice will be sent to your email</small>
        ${checkoutState.invoice.enabled ? `
        <div class="modern-invoice-fields">
          <input value="${escapeHTML(checkoutState.invoice.company)}" oninput="updateInvoiceField('company', this.value)" placeholder="Company Name">
          <input value="${escapeHTML(checkoutState.invoice.taxCode)}" oninput="updateInvoiceField('taxCode', this.value)" placeholder="Tax Code">
          <input value="${escapeHTML(checkoutState.invoice.email)}" oninput="updateInvoiceField('email', this.value)" placeholder="Invoice Email">
        </div>` : ""}
      </div>
    </div>
  `);
}

function renderOrderSummary(items, totals) {
  return `
    <div class="modern-summary-card">
      <div class="modern-card-title"><span class="modern-card-icon">${icon("bag")}</span><h2>Your Order</h2></div>
      <div class="modern-summary-items">
        ${items.map(item => `
          <div class="modern-summary-item">
            <img src="${item.product.image}" alt="${escapeHTML(item.product.name)}">
            <div><strong>${escapeHTML(item.product.name)}</strong><span>${formatCurrency(item.product.price)} x ${item.quantity}</span></div>
            <b>${formatCurrency(item.product.price * item.quantity)}</b>
          </div>
        `).join("")}
      </div>
      <div class="modern-voucher-entry">
        <h3 class="modern-summary-section-title">Voucher</h3>
        <div class="modern-voucher-input">
          <span>${icon("tag")}</span>
          <input id="checkout-voucher-input" type="text" placeholder="Enter voucher code" onkeydown="handleVoucherKey(event)">
          <button type="button" onclick="applyVoucherFromInput()">Apply</button>
        </div>
        <button type="button" class="modern-voucher-link" onclick="openVoucherModal()">View available vouchers</button>
        ${totals.voucher ? `<button type="button" class="modern-voucher-chip" onclick="removeCheckoutVoucher()">${totals.voucher.code} ${icon("x")}</button>` : ""}
      </div>
      <div class="modern-money-lines">
        <h3 class="modern-summary-section-title">Payment Details</h3>
        ${moneyLine("Subtotal", totals.subtotal)}
        ${moneyLine("Shipping Fee", totals.shipping, totals.shipping === 0 ? "Freeship" : null)}
        ${totals.voucherDiscount ? moneyLine(`Voucher Discount (${totals.voucher.code})`, -totals.voucherDiscount, null, true) : ""}
        ${totals.shippingDiscount ? moneyLine("Shipping Discount", -totals.shippingDiscount, null, true) : ""}
        ${totals.rewardDiscount ? moneyLine("Reward Points Discount", -totals.rewardDiscount, null, true) : ""}
        ${totals.giftBox ? moneyLine("Gift Wrapping", totals.giftBox) : ""}
        ${totals.greetingCard ? moneyLine("Greeting Card", totals.greetingCard) : ""}
      </div>
      <div class="modern-summary-total"><span>Total cost</span><strong>${formatCurrency(totals.total)}</strong></div>
      <div class="modern-summary-badges"><div>${icon("shield")} You save: <strong>${formatCurrency(totals.saved)}</strong></div><div>${icon("star")} You will earn: <strong>+${totals.rewardEarned} điểm</strong></div></div>
      <div class="modern-summary-trust">
        <span>${icon("shield")} Secure Checkout</span>
        <span>${icon("headset")} 24/7 Support<br><strong>1900 633 123</strong></span>
        <span>${icon("package")} Easy Returns<br>7 Days</span>
      </div>
      <p class="modern-secure-foot">${icon("lock")} Your information is fully secured</p>
    </div>
  `;
}

function moneyLine(label, value, display, negative) {
  return `<div class="modern-money-line ${negative ? "is-discount" : ""}"><span>${label}</span><strong>${display || `${value < 0 ? "-" : ""}${formatCurrency(Math.abs(value))}`}</strong></div>`;
}

function renderModalShell() {
  return `<div class="modern-modal" id="checkout-modal" aria-hidden="true"><div class="modern-modal-overlay" onclick="closeCheckoutModal()"></div><div class="modern-modal-card" id="checkout-modal-card"></div></div>`;
}

function setModalContent(html) {
  const modal = document.getElementById("checkout-modal");
  const card = document.getElementById("checkout-modal-card");
  if (!modal || !card) return;
  card.innerHTML = html;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function resetAddressMap() {
  if (addressMap) {
    addressMap.remove();
    addressMap = null;
    addressMarker = null;
  }
}

window.closeCheckoutModal = function() {
  const modal = document.getElementById("checkout-modal");
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  resetAddressMap();
};

window.openAddressModal = function() {
  normalizeAddressBook();
  draftAddressModal = null;
  loadVietnamLocations();
  renderAddressModal();
};

function renderAddressModal() {
  resetAddressMap();
  setModalContent(`
    <button class="modern-modal-close" onclick="closeCheckoutModal()">&times;</button>
    <h3>Change thông tin người nhận</h3>
    <div class="address-book-list">
      ${checkoutState.addressBook.map(address => renderAddressBookItem(address)).join("")}
    </div>
    <div class="modern-modal-actions"><button class="modern-secondary-btn" onclick="openAddressFormModal()">Add recipient</button><button class="modern-primary-btn" onclick="closeCheckoutModal()">Done</button></div>
  `);
}

function renderAddressBookItem(address) {
  const selected = address.id === checkoutState.selectedAddressId;
  return `
    <label class="address-book-item ${selected ? "is-selected" : ""}">
      <input type="radio" name="saved-address" value="${address.id}" ${selected ? "checked" : ""} onchange="selectAddress('${address.id}')">
      <span class="modern-radio-dot"></span>
      <div>
        <strong>${escapeHTML(address.fullName)} <em>${formatPhone(address.phone)}</em> ${address.isDefault ? "<b>Mặc định</b>" : ""}</strong>
        ${address.email ? `<p>${escapeHTML(address.email)}</p>` : ""}
        <p>${escapeHTML(getAddressLineFor(address))}</p>
        ${address.note ? `<small>Note: ${escapeHTML(address.note)}</small>` : ""}
      </div>
      <div class="address-book-actions">
        <button type="button" onclick="event.stopPropagation(); openAddressFormModal('${address.id}')">Edit</button>
      </div>
    </label>
  `;
}

function getAddressLineFor(address) {
  if (address.provinceName || address.wardName || address.provinceCode || address.wardCode) {
    return [address.address, address.wardName || address.ward, address.provinceName || address.province].filter(Boolean).join(", ");
  }
  return [address.address, address.ward, address.district, address.province].filter(Boolean).join(", ");
}

window.selectAddress = function(addressId) {
  const address = checkoutState.addressBook.find(item => item.id === addressId);
  if (!address) return;
  checkoutState.selectedAddressId = addressId;
  checkoutState.address = address;
  renderCheckoutPage();
  renderAddressModal();
};

window.openAddressFormModal = function(addressId = "") {
  normalizeAddressBook();
  loadVietnamLocations();
  const address = checkoutState.addressBook.find(item => item.id === addressId) || {
    id: "",
    fullName: "",
    phone: "",
    email: "",
    provinceCode: "",
    provinceName: "",
    wardCode: "",
    wardName: "",
    latitude: null,
    longitude: null,
    province: "",
    district: "",
    ward: "",
    address: "",
    note: "",
    isDefault: checkoutState.addressBook.length === 0
  };
  draftAddressModal = hydrateAddressLocation(address);
  renderAddressForm(draftAddressModal);
};

function renderAddressForm(addressDraft) {
  setModalContent(`
    <button class="modern-modal-close" onclick="closeCheckoutModal()">&times;</button>
    <h3>${addressDraft.id ? "Edit người nhận" : "Add recipient"}</h3>
    ${checkoutState.locationData.error ? `<p class="address-location-alert">${escapeHTML(checkoutState.locationData.error)}</p>` : ""}
    <input type="hidden" id="address-id" value="${escapeHTML(addressDraft.id)}">
    <div class="modern-form-grid address-form-grid">
      ${field("address-name", "Recipient Name", addressDraft.fullName, "text", "updateAddressDraftField('fullName', this.value)")}
      ${field("address-phone", "Phone Number", addressDraft.phone, "tel", "updateAddressDraftField('phone', this.value)")}
      ${field("address-email", "Email", addressDraft.email, "email", "updateAddressDraftField('email', this.value)")}
      ${renderProvinceSelect(addressDraft)}
      <div id="address-ward-field-wrap">
        ${renderWardSelect(addressDraft)}
      </div>
      ${field("address-detail", "Detailed Address", addressDraft.address, "text", "updateAddressDraftField('address', this.value)")}
      <div class="modern-field full"><label>Order Note</label><input id="address-note" value="${escapeHTML(addressDraft.note)}" placeholder="Call before delivery" oninput="updateAddressDraftField('note', this.value)"><small class="address-field-error"></small></div>
      ${renderAddressMapSection(addressDraft)}
      <label class="modern-checkbox-row full"><input type="checkbox" id="address-default" ${addressDraft.isDefault ? "checked" : ""} onchange="updateAddressDraftField('isDefault', this.checked)"><span></span><b>Set as default address</b></label>
    </div>
    <div class="modern-modal-actions address-form-actions"><button class="modern-secondary-btn" onclick="openAddressModal()">Back</button><button class="modern-primary-btn" onclick="saveAddressModal()">Save Address</button></div>
  `);
  window.setTimeout(() => {
    initAddressMap();
    centerMapByAddressOrDefault();
  }, 0);
}

function field(id, label, value, type = "text", inputHandler = "") {
  const handler = inputHandler ? ` oninput="${inputHandler}"` : "";
  return `<div class="modern-field"><label>${label}</label><input id="${id}" type="${type}" value="${escapeHTML(value)}"${handler}><small class="address-field-error"></small></div>`;
}

function selectField(id, label, options, selected) {
  return `<div class="modern-field"><label>${label}</label><select id="${id}">${options.map(opt => `<option value="${opt}" ${opt === selected ? "selected" : ""}>${opt}</option>`).join("")}</select><small></small></div>`;
}

function renderProvinceSelect(addressDraft) {
  const locationData = checkoutState.locationData;
  const disabled = locationData.loading ? " disabled" : "";
  const firstOption = locationData.loading
    ? `<option value="">Loading local database...</option>`
    : `<option value="">Select Province/City</option>`;
  const options = locationData.provinces.map(province => `
    <option value="${escapeHTML(province.code)}" ${province.code === addressDraft.provinceCode ? "selected" : ""}>${escapeHTML(province.name)}</option>
  `).join("");

  return `
    <div class="modern-field">
      <label>Province/City</label>
      <select id="address-province" class="location-select" onchange="handleAddressProvinceChange(this.value)"${disabled}>
        ${firstOption}
        ${options}
      </select>
      <small class="address-field-error"></small>
    </div>
  `;
}

function renderWardSelect(addressDraft) {
  const locationData = checkoutState.locationData;
  const provinceCode = addressDraft.provinceCode || "";
  const allWards = provinceCode ? (locationData.wardsByProvince[provinceCode] || []) : [];
  let placeholder = "Vui lòng chọn Province/City trước";
  let disabled = true;

  if (locationData.loading) {
    placeholder = "Loading local database...";
  } else if (provinceCode) {
    disabled = false;
    placeholder = allWards.length ? "Select Ward/Commune" : "No Ward data available";
  }

  return `
    <div class="modern-field">
      <label>Ward/Commune</label>
      <select id="address-ward" class="location-select" onchange="handleAddressWardChange(this.value)" ${disabled || !allWards.length ? "disabled" : ""}>
        <option value="">${escapeHTML(placeholder)}</option>
        ${allWards.map(ward => `<option value="${escapeHTML(ward.code)}" ${ward.code === addressDraft.wardCode ? "selected" : ""}>${escapeHTML(ward.name)}</option>`).join("")}
      </select>
      <small class="address-field-error"></small>
    </div>
  `;
}

function renderAddressMapSection(addressDraft) {
  const hasCoordinates = Number.isFinite(Number(addressDraft.latitude)) && Number.isFinite(Number(addressDraft.longitude));
  const status = addressDraft.locationStatus ? `<small class="address-location-status">${escapeHTML(addressDraft.locationStatus)}</small>` : "";
  const error = addressDraft.locationError ? `<small class="address-location-error">${escapeHTML(addressDraft.locationError)}</small>` : "";
  const warning = addressDraft.locationWarning ? `<small class="address-location-warning">${escapeHTML(addressDraft.locationWarning)}</small>` : "";

  return `
    <section class="address-map-section full">
      <div class="address-map-toolbar">
        <div>
          <h4>Confirm Delivery Location</h4>
          <p class="address-location-note">Pin your location to help shipper deliver accurately.</p>
        </div>
        <button type="button" class="use-current-location-btn" onclick="getCurrentUserLocation()">Use current location</button>
      </div>
      <div id="address-map-container" class="address-map-container"></div>
      <p class="address-coordinate-text">${hasCoordinates ? `Delivery coordinates: ${Number(addressDraft.latitude).toFixed(6)}, ${Number(addressDraft.longitude).toFixed(6)}` : "Click on map to pin delivery location."}</p>
      <div id="address-map-message">${status}${error}${warning}</div>
    </section>
  `;
}

function setFieldError(id, message) {
  const input = document.getElementById(id);
  const fieldEl = input ? input.closest(".modern-field") : null;
  const small = fieldEl ? fieldEl.querySelector("small") : null;
  if (small) small.textContent = message || "";
  if (fieldEl) fieldEl.classList.toggle("has-error", !!message);
}

window.updateAddressDraftField = function(fieldName, value) {
  if (!draftAddressModal) return;
  draftAddressModal[fieldName] = value;
  if (["address", "provinceCode", "wardCode"].includes(fieldName)) {
    centerMapByAddressOrDefault();
  }
};

window.handleAddressProvinceChange = function(value) {
  if (!draftAddressModal) return;
  const province = getProvinceByCode(value);
  draftAddressModal.provinceCode = province ? province.code : "";
  draftAddressModal.provinceName = province ? province.name : "";
  draftAddressModal.province = province ? province.name : "";
  draftAddressModal.wardCode = "";
  draftAddressModal.wardName = "";
  draftAddressModal.ward = "";
  const wrap = document.getElementById("address-ward-field-wrap");
  if (wrap) wrap.innerHTML = renderWardSelect(draftAddressModal);
  centerMapByAddressOrDefault();
};

window.handleAddressWardChange = function(value) {
  if (!draftAddressModal) return;
  const ward = getWardByCode(draftAddressModal.provinceCode, value);
  draftAddressModal.wardCode = ward ? ward.code : "";
  draftAddressModal.wardName = ward ? ward.name : "";
  draftAddressModal.ward = ward ? ward.name : "";
  centerMapByAddressOrDefault();
};

function getDefaultMapCenter() {
  if (!draftAddressModal) return [16.047079, 108.20623];
  const provinceName = normalizeLocationText(draftAddressModal.provinceName || draftAddressModal.province);
  if (provinceName.includes("ho chi minh")) return [10.776889, 106.700806];
  if (provinceName.includes("ha noi")) return [21.028511, 105.804817];
  if (provinceName.includes("da nang")) return [16.047079, 108.20623];
  if (provinceName.includes("can tho")) return [10.045162, 105.746857];
  if (provinceName.includes("hue")) return [16.463713, 107.590866];
  return [15.903062, 105.806692];
}

function initAddressMap() {
  const container = document.getElementById("address-map-container");
  if (!container || !draftAddressModal) return;
  if (!window.L) {
    draftAddressModal.locationError = "Failed to load map. Please check your connection or enter address manually.";
    updateAddressMapText();
    return;
  }

  if (addressMap) {
    addressMap.remove();
    addressMap = null;
    addressMarker = null;
  }

  const center = Number.isFinite(Number(draftAddressModal.latitude)) && Number.isFinite(Number(draftAddressModal.longitude))
    ? [Number(draftAddressModal.latitude), Number(draftAddressModal.longitude)]
    : getDefaultMapCenter();

  addressMap = L.map(container).setView(center, draftAddressModal.latitude ? 16 : 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(addressMap);

  addressMap.on("click", event => {
    updateAddressMarker(event.latlng.lat, event.latlng.lng, true);
  });

  if (Number.isFinite(Number(draftAddressModal.latitude)) && Number.isFinite(Number(draftAddressModal.longitude))) {
    updateAddressMarker(draftAddressModal.latitude, draftAddressModal.longitude, false);
  }

  window.setTimeout(() => addressMap && addressMap.invalidateSize(), 120);
}

function updateAddressMarker(latitude, longitude, shouldCenter = true) {
  if (!draftAddressModal || !addressMap || !window.L) return;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  draftAddressModal.latitude = lat;
  draftAddressModal.longitude = lng;
  draftAddressModal.locationWarning = "";

  const latLng = [lat, lng];
  if (!addressMarker) {
    addressMarker = L.marker(latLng, { draggable: true }).addTo(addressMap);
    addressMarker.on("dragend", event => {
      const position = event.target.getLatLng();
      updateAddressMarker(position.lat, position.lng, false);
    });
  } else {
    addressMarker.setLatLng(latLng);
  }

  if (shouldCenter) addressMap.setView(latLng, Math.max(addressMap.getZoom(), 16));
  updateAddressMapText();
}

function updateAddressMapText() {
  const coordinateText = document.querySelector(".address-coordinate-text");
  const message = document.getElementById("address-map-message");
  if (!draftAddressModal) return;

  const hasCoordinates = Number.isFinite(Number(draftAddressModal.latitude)) && Number.isFinite(Number(draftAddressModal.longitude));
  if (coordinateText) {
    coordinateText.textContent = hasCoordinates
      ? `Delivery coordinates: ${Number(draftAddressModal.latitude).toFixed(6)}, ${Number(draftAddressModal.longitude).toFixed(6)}`
      : "Click on map to pin delivery location.";
  }

  if (message) {
    message.innerHTML = [
      draftAddressModal.locationStatus ? `<small class="address-location-status">${escapeHTML(draftAddressModal.locationStatus)}</small>` : "",
      draftAddressModal.locationError ? `<small class="address-location-error">${escapeHTML(draftAddressModal.locationError)}</small>` : "",
      draftAddressModal.locationWarning ? `<small class="address-location-warning">${escapeHTML(draftAddressModal.locationWarning)}</small>` : ""
    ].join("");
  }
}

function centerMapByAddressOrDefault() {
  if (!draftAddressModal || !addressMap) return;
  if (Number.isFinite(Number(draftAddressModal.latitude)) && Number.isFinite(Number(draftAddressModal.longitude))) {
    updateAddressMarker(draftAddressModal.latitude, draftAddressModal.longitude, false);
    return;
  }
  addressMap.setView(getDefaultMapCenter(), draftAddressModal.provinceCode ? 11 : 6);
  window.setTimeout(() => addressMap && addressMap.invalidateSize(), 80);
}

window.getCurrentUserLocation = function() {
  if (!draftAddressModal) return;
  if (!navigator.geolocation) {
    draftAddressModal.locationError = "Your browser does not support geolocation.";
    draftAddressModal.locationStatus = "";
    updateAddressMapText();
    return;
  }

  draftAddressModal.locationStatus = "Fetching position...";
  draftAddressModal.locationError = "";
  updateAddressMapText();

  navigator.geolocation.getCurrentPosition(
    position => {
      draftAddressModal.locationStatus = "Current position fetched. Please check the pin on the map.";
      draftAddressModal.locationError = "";
      updateAddressMarker(position.coords.latitude, position.coords.longitude, true);
      updateAddressMapText();
    },
    error => {
      draftAddressModal.locationStatus = "";
      draftAddressModal.locationError = error.code === error.PERMISSION_DENIED
        ? "Location access denied. Please enter address manually."
        : "Could not fetch current location. Please try again or pin manually.";
      updateAddressMapText();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
};

function validateAddressDraft(addressDraft) {
  let valid = true;
  setFieldError("address-name", "");
  setFieldError("address-phone", "");
  setFieldError("address-email", "");
  setFieldError("address-province", "");
  setFieldError("address-ward", "");
  setFieldError("address-detail", "");

  if (!addressDraft.fullName) {
    setFieldError("address-name", "Name cannot be empty");
    valid = false;
  }

  if (!/^(0|\+84)(\d{9,10})$/.test(String(addressDraft.phone || "").replace(/\s/g, ""))) {
    setFieldError("address-phone", "Phone Number không hợp lệ");
    valid = false;
  }

  if (addressDraft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addressDraft.email)) {
    setFieldError("address-email", "Invalid email address");
    valid = false;
  }

  if (!addressDraft.provinceCode) {
    setFieldError("address-province", "Vui lòng chọn Province/City");
    valid = false;
  }

  if (!addressDraft.wardCode) {
    setFieldError("address-ward", "Vui lòng chọn Ward/Commune");
    valid = false;
  }

  if (!addressDraft.address) {
    setFieldError("address-detail", "Detailed Address không được trống");
    valid = false;
  }

  return valid;
}

window.saveAddressModal = function() {
  if (!draftAddressModal) return;
  updateAddressDraftField("fullName", document.getElementById("address-name")?.value.trim() || "");
  updateAddressDraftField("phone", document.getElementById("address-phone")?.value.trim() || "");
  updateAddressDraftField("email", document.getElementById("address-email")?.value.trim() || "");
  updateAddressDraftField("address", document.getElementById("address-detail")?.value.trim() || "");
  updateAddressDraftField("note", document.getElementById("address-note")?.value.trim() || "");
  updateAddressDraftField("isDefault", !!document.getElementById("address-default")?.checked);

  const id = document.getElementById("address-id")?.value || "";
  const hasCoordinates = Number.isFinite(Number(draftAddressModal.latitude)) && Number.isFinite(Number(draftAddressModal.longitude));
  if (!hasCoordinates) {
    draftAddressModal.locationWarning = "You have not pinned your location. Shipper might call to confirm.";
    updateAddressMapText();
  }

  if (!validateAddressDraft(draftAddressModal)) return;

  const savedAddress = {
    id: id || `addr-${Date.now()}`,
    fullName: draftAddressModal.fullName,
    phone: draftAddressModal.phone,
    email: draftAddressModal.email,
    provinceCode: draftAddressModal.provinceCode,
    provinceName: draftAddressModal.provinceName,
    wardCode: draftAddressModal.wardCode,
    wardName: draftAddressModal.wardName,
    province: draftAddressModal.provinceName,
    district: "",
    ward: draftAddressModal.wardName,
    address: draftAddressModal.address,
    note: draftAddressModal.note,
    latitude: hasCoordinates ? Number(draftAddressModal.latitude) : null,
    longitude: hasCoordinates ? Number(draftAddressModal.longitude) : null,
    isDefault: draftAddressModal.isDefault
  };

  if (savedAddress.isDefault) {
    checkoutState.addressBook.forEach(item => { item.isDefault = false; });
  }

  const existingIndex = checkoutState.addressBook.findIndex(item => item.id === savedAddress.id);
  if (existingIndex >= 0) {
    checkoutState.addressBook[existingIndex] = savedAddress;
  } else {
    checkoutState.addressBook.push(savedAddress);
  }

  if (!checkoutState.addressBook.some(item => item.isDefault)) {
    savedAddress.isDefault = true;
  }

  checkoutState.selectedAddressId = savedAddress.id;
  checkoutState.address = savedAddress;
  draftAddressModal = null;
  closeCheckoutModal();
  renderCheckoutPage();
  showCheckoutToast("Recipient info updated", "success");
  if (!hasCoordinates) {
    showCheckoutToast("You have not pinned your location. Shipper might call to confirm.", "warning");
  }
};

window.openShippingModal = function() {
  setModalContent(`
    <button class="modern-modal-close" onclick="closeCheckoutModal()">&times;</button>
    <h3>Select Shipping Method</h3>
    <div class="modern-radio-stack">
      ${Object.values(SHIPPING_METHODS).map(method => radioCard("shipping-method", method.id, method.title, method.desc, method.priceText, checkoutState.shipping.method === method.id)).join("")}
    </div>
    <div id="shipping-timeslot-wrap" class="modern-timeslot-wrap" style="display:${checkoutState.shipping.method === "scheduled" ? "block" : "none"}">
      <label>Preferred Delivery Time</label>
      <select id="shipping-timeslot"><option ${checkoutState.shipping.timeSlot === "Sáng 8:00-11:00" ? "selected" : ""}>Sáng 8:00-11:00</option><option ${checkoutState.shipping.timeSlot === "Chiều 13:00-17:00" ? "selected" : ""}>Chiều 13:00-17:00</option><option ${checkoutState.shipping.timeSlot === "Tối 18:00-21:00" ? "selected" : ""}>Tối 18:00-21:00</option></select>
    </div>
    <div class="modern-modal-actions"><button class="modern-secondary-btn" onclick="closeCheckoutModal()">Cancel</button><button class="modern-primary-btn" onclick="saveShippingModal()">Save Method</button></div>
  `);
  document.querySelectorAll('input[name="shipping-method"]').forEach(input => input.addEventListener("change", () => {
    const wrap = document.getElementById("shipping-timeslot-wrap");
    if (wrap) wrap.style.display = input.value === "scheduled" && input.checked ? "block" : wrap.style.display;
    if (input.checked && input.value !== "scheduled" && wrap) wrap.style.display = "none";
  }));
};

function radioCard(name, value, title, desc, price, checked) {
  return `<label class="modern-radio-card"><input type="radio" name="${name}" value="${value}" ${checked ? "checked" : ""}><span></span><div><strong>${title}</strong><p>${desc}</p></div><b>${price}</b></label>`;
}

window.saveShippingModal = function() {
  const selected = document.querySelector('input[name="shipping-method"]:checked');
  checkoutState.shipping.method = selected ? selected.value : "standard";
  checkoutState.shipping.timeSlot = checkoutState.shipping.method === "scheduled" ? document.getElementById("shipping-timeslot").value : "";
  closeCheckoutModal();
  renderCheckoutPage();
  showCheckoutToast("Shipping method updated", "success");
};

window.openPaymentModal = function() {
  setModalContent(`
    <button class="modern-modal-close" onclick="closeCheckoutModal()">&times;</button>
    <h3>Select Payment Method</h3>
    <div class="modern-radio-stack">
      ${Object.values(PAYMENT_METHODS).map(method => radioCard("payment-method", method.id, method.title, method.desc, "", checkoutState.payment === method.id)).join("")}
    </div>
    <div class="modern-payment-extra" id="payment-extra"></div>
    <div class="modern-modal-actions"><button class="modern-secondary-btn" onclick="closeCheckoutModal()">Cancel</button><button class="modern-primary-btn" onclick="savePaymentModal()">Save Method</button></div>
  `);
  document.querySelectorAll('input[name="payment-method"]').forEach(input => input.addEventListener("change", updatePaymentExtra));
  updatePaymentExtra();
};

function updatePaymentExtra() {
  const selected = document.querySelector('input[name="payment-method"]:checked')?.value;
  const box = document.getElementById("payment-extra");
  if (!box) return;
  if (selected === "Bank transfer") {
    box.innerHTML = `<div class="modern-bank-box"><p><b>Ngân hàng:</b> Vietcombank</p><p><b>Chủ tài khoản:</b> TU QUY GARDEN</p><p><b>Số tài khoản:</b> 0123456789</p><p><b>Nội dung:</b> TQG ${getSelectedAddress().phone}</p></div>`;
  } else if (selected === "E-wallet" || selected === "Card") {
    box.innerHTML = `<p class="modern-demo-note">Chức năng thanh toán demo cho đồ án</p>`;
  } else {
    box.innerHTML = "";
  }
}

window.savePaymentModal = function() {
  const selected = document.querySelector('input[name="payment-method"]:checked');
  checkoutState.payment = selected ? selected.value : "COD";
  closeCheckoutModal();
  renderCheckoutPage();
  showCheckoutToast("Payment method updated", "success");
};

window.openVoucherModal = function() {
  const subtotal = getCheckoutTotals().subtotal;
  setModalContent(`
    <button class="modern-modal-close" onclick="closeCheckoutModal()">&times;</button>
    <h3>Chọn voucher</h3>
    <div class="modern-voucher-list">
      ${CHECKOUT_VOUCHERS.map(voucher => {
        const eligible = subtotal >= voucher.minOrder;
        return `<div class="modern-voucher-card ${eligible ? "" : "is-disabled"}"><div><strong>${voucher.code}</strong><h4>${voucher.title}</h4><p>${voucher.description}</p><span>${voucher.condition}</span></div><button class="modern-primary-btn" ${eligible ? `onclick="applyCheckoutVoucher('${voucher.code}')"` : "disabled"}>${eligible ? "Apply" : "Chưa đủ điều kiện"}</button></div>`;
      }).join("")}
    </div>
  `);
};

window.applyCheckoutVoucher = function(code) {
  const voucher = CHECKOUT_VOUCHERS.find(item => item.code === code);
  if (!voucher) return;
  localStorage.setItem("tqg_active_voucher", JSON.stringify({ code, ...voucher }));
  closeCheckoutModal();
  renderCheckoutPage();
  showCheckoutToast(`Applied code ${code}`, "success");
};

window.handleVoucherKey = function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    applyVoucherFromInput();
  }
};

window.applyVoucherFromInput = function() {
  const input = document.getElementById("checkout-voucher-input");
  const code = input ? input.value.trim().toUpperCase() : "";
  const voucher = CHECKOUT_VOUCHERS.find(item => item.code === code);
  const subtotal = getCheckoutTotals().subtotal;

  if (!code) {
    showCheckoutToast("Please enter a voucher code", "error");
    return;
  }

  if (!voucher) {
    showCheckoutToast("Invalid voucher code", "error");
    return;
  }

  if (subtotal < (voucher.minOrder || 0)) {
    showCheckoutToast("Order is not eligible for this voucher", "error");
    return;
  }

  localStorage.setItem("tqg_active_voucher", JSON.stringify({ code: voucher.code, ...voucher }));
  renderCheckoutPage();
  showCheckoutToast(`Applied code ${voucher.code}`, "success");
};

window.removeCheckoutVoucher = function() {
  localStorage.removeItem("tqg_active_voucher");
  renderCheckoutPage();
  showCheckoutToast("Voucher removed", "success");
};

window.selectShippingMethod = function(methodId) {
  checkoutState.shipping.method = methodId;
  checkoutState.shipping.timeSlot = methodId === "scheduled" ? (checkoutState.shipping.timeSlot || "Sáng 8:00-11:00") : "";
  renderCheckoutPage();
};

window.updateShippingTimeSlot = function(value) {
  checkoutState.shipping.timeSlot = value;
};

window.selectPaymentMethod = function(methodId) {
  checkoutState.payment = methodId;
  if (methodId === "Bank transfer" && !checkoutState.bankTransfer.selectedBankId) {
    const defaultBank = checkoutState.linkedBanks.find(bank => bank.isDefault) || checkoutState.linkedBanks[0];
    checkoutState.bankTransfer.selectedBankId = defaultBank ? defaultBank.id : "";
  }
  renderCheckoutPage();
};

window.togglePaymentMethods = function() {
  paymentMethodsExpanded = !paymentMethodsExpanded;
  renderCheckoutPage();
};

window.selectLinkedBank = function(bankId) {
  checkoutState.bankTransfer.selectedBankId = bankId;
  renderCheckoutPage();
};

window.openLinkBankModal = function() {
  setModalContent(`
    <button class="modern-modal-close" onclick="closeCheckoutModal()">&times;</button>
    <h3>Link Bank demo</h3>
    <div class="modern-form-grid">
      ${field("demo-bank-name", "Bank Name", "")}
      ${field("demo-bank-holder", "Chủ tài khoản", getSelectedAddress().fullName.toUpperCase())}
      <div class="modern-field full"><label>Số tài khoản</label><input id="demo-bank-number" inputmode="numeric" value=""><small></small></div>
      <label class="modern-checkbox-row full"><input type="checkbox" id="demo-bank-default" ${checkoutState.linkedBanks.length ? "" : "checked"}><span></span><b>Set as default bank</b></label>
    </div>
    <div class="modern-modal-actions"><button class="modern-secondary-btn" onclick="closeCheckoutModal()">Cancel</button><button class="modern-primary-btn" onclick="saveDemoLinkedBank()">Save Bank</button></div>
  `);
};

window.saveDemoLinkedBank = function() {
  const bankName = document.getElementById("demo-bank-name").value.trim();
  const accountHolder = document.getElementById("demo-bank-holder").value.trim();
  const accountNumber = document.getElementById("demo-bank-number").value.trim();
  const isDefault = document.getElementById("demo-bank-default").checked || checkoutState.linkedBanks.length === 0;
  let valid = true;

  setFieldError("demo-bank-name", "");
  setFieldError("demo-bank-holder", "");
  setFieldError("demo-bank-number", "");

  if (!bankName) { setFieldError("demo-bank-name", "Please enter bank name"); valid = false; }
  if (!accountHolder) { setFieldError("demo-bank-holder", "Please enter account holder name"); valid = false; }
  if (!/^\d{6,20}$/.test(accountNumber)) { setFieldError("demo-bank-number", "Account number must be 6 to 20 digits"); valid = false; }
  if (!valid) return;

  if (isDefault) checkoutState.linkedBanks.forEach(bank => { bank.isDefault = false; });

  const newBank = {
    id: `bank-${Date.now()}`,
    bankName,
    accountHolder: accountHolder.toUpperCase(),
    accountNumber,
    isDefault
  };

  checkoutState.linkedBanks.push(newBank);
  checkoutState.bankTransfer.selectedBankId = newBank.id;
  closeCheckoutModal();
  renderCheckoutPage();
  showCheckoutToast("Demo bank linked successfully", "success");
};

window.selectGiftWrap = function(enabled) {
  checkoutState.extras.giftBox = enabled;
  renderCheckoutPage();
};

window.toggleExtra = function(key, checked) {
  checkoutState.extras[key] = checked;
  if (!checked && key === "greetingCard") checkoutState.extras.message = "";
  renderCheckoutPage();
};

window.updateGreetingMessage = function(input) {
  checkoutState.extras.message = input.value.slice(0, 100);
};

window.toggleReward = function(checked) {
  checkoutState.rewardApplied = checked;
  renderCheckoutPage();
  if (checked) showCheckoutToast("Reward points applied", "success");
};

window.toggleInvoice = function(checked) {
  checkoutState.invoice.enabled = checked;
  renderCheckoutPage();
};

window.updateInvoiceField = function(field, value) {
  checkoutState.invoice[field] = value;
};

function validateCheckoutState() {
  const errors = [];
  const address = getSelectedAddress();
  const compactPhone = String(address.phone || "").replace(/\s/g, "");

  if (!address.fullName || !address.fullName.trim()) errors.push("Please enter recipient name.");
  if (!/^(0|\+84)(\d{9,10})$/.test(compactPhone)) errors.push("Phone Number nhận hàng không hợp lệ.");
  if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) errors.push("Invalid recipient email.");
  if (!address.address || !address.address.trim()) errors.push("Please enter detailed address.");
  if (!(address.wardName || address.ward) || !(address.provinceName || address.province)) errors.push("Please select province/city and ward/commune.");
  if (!checkoutState.shipping.method || !SHIPPING_METHODS[checkoutState.shipping.method]) errors.push("Please select shipping method.");
  if (checkoutState.shipping.method === "scheduled" && !checkoutState.shipping.timeSlot) errors.push("Please select shipping time slot.");
  if (!checkoutState.payment || !PAYMENT_METHODS[checkoutState.payment]) errors.push("Please select payment method.");
  if (checkoutState.payment === "Bank transfer") {
    if (!checkoutState.linkedBanks.length) errors.push("Please link a bank account for bank transfer.");
    if (!getSelectedLinkedBank()) errors.push("Please select bank for transfer.");
  }

  if (checkoutState.invoice.enabled) {
    const invoice = checkoutState.invoice;
    if (!invoice.company.trim()) errors.push("Please enter company name for invoice.");
    if (!invoice.taxCode.trim()) errors.push("Please enter tax code.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.email.trim())) errors.push("Invoice Email không hợp lệ.");
  }

  return errors;
}

window.openConfirmOrderModal = function() {
  const errors = validateCheckoutState();
  if (errors.length) {
    showCheckoutToast(errors[0], "error");
    return;
  }

  const totals = getCheckoutTotals();
  const selectedAddress = getSelectedAddress();
  const shipping = SHIPPING_METHODS[checkoutState.shipping.method] || SHIPPING_METHODS.standard;
  const payment = PAYMENT_METHODS[checkoutState.payment] || PAYMENT_METHODS.COD;
  const selectedBank = checkoutState.payment === "Bank transfer" ? getSelectedLinkedBank() : null;
  setModalContent(`
    <button class="modern-modal-close" onclick="closeCheckoutModal()">&times;</button>
    <h3>Confirm Order</h3>
    <div class="modern-confirm-list">
      <p><span>Người nhận</span><strong>${escapeHTML(selectedAddress.fullName)}</strong></p>
      <p><span>Phone Number</span><strong>${formatPhone(selectedAddress.phone)}</strong></p>
      <p><span>Delivery Address</span><strong>${escapeHTML(getAddressLine())}</strong></p>
      <p><span>Giao hàng</span><strong>${shipping.title}</strong></p>
      <p><span>Thanh toán</span><strong>${payment.title}</strong></p>
      ${selectedBank ? `<p><span>Ngân hàng</span><strong>${escapeHTML(selectedBank.bankName)} - ${escapeHTML(maskBankAccount(selectedBank.accountNumber))}</strong></p>` : ""}
      <p class="is-total"><span>Total cost</span><strong>${formatCurrency(totals.total)}</strong></p>
    </div>
    <div class="modern-modal-actions"><button class="modern-secondary-btn" onclick="closeCheckoutModal()">Cancel</button><button class="modern-primary-btn" onclick="confirmPlaceOrder()">Confirm Order</button></div>
  `);
};

window.confirmPlaceOrder = function() {
  if (!window.CartService || !window.OrderService) return;
  const errors = validateCheckoutState();
  if (errors.length) {
    showCheckoutToast(errors[0], "error");
    return;
  }

  const totals = getCheckoutTotals();
  const selectedAddress = getSelectedAddress();
  const selectedBank = checkoutState.payment === "Bank transfer" ? getSelectedLinkedBank() : null;
  const orderNoteParts = [];
  if (selectedAddress.note) {
    orderNoteParts.push(`Giao hàng: ${selectedAddress.note}`);
  }
  if (checkoutState.extras.greetingCard && checkoutState.extras.message) {
    orderNoteParts.push(`Thiệp: ${checkoutState.extras.message}`);
  }
  if (selectedBank) {
    orderNoteParts.push(`BankTransfer:${selectedBank.id} - ${selectedBank.bankName} - ${selectedBank.accountNumber}`);
  }

  const orderTotals = {
    subtotal: totals.subtotal,
    shipping: totals.shipping,
    discount: totals.voucherDiscount + totals.rewardDiscount + totals.shippingDiscount,
    total: totals.total
  };
  const result = window.OrderService.createOrder(
    { fullName: selectedAddress.fullName, phone: selectedAddress.phone, email: selectedAddress.email },
    {
      province: selectedAddress.provinceName || selectedAddress.province,
      district: selectedAddress.district || "",
      ward: selectedAddress.wardName || selectedAddress.ward,
      address: selectedAddress.address,
      note: orderNoteParts.join(" | ")
    },
    checkoutState.payment,
    orderTotals
  );

  if (result.success) {
    placedOrderId = result.orderId;
    placedOrderTotal = totals.total;
    placedDeliveryText = (SHIPPING_METHODS[checkoutState.shipping.method] || SHIPPING_METHODS.standard).desc;
    closeCheckoutModal();
    showCheckoutToast("Order Placed Successfully", "success");
    if (window.updateHeaderState) window.updateHeaderState();
    renderCheckoutPage();
  } else {
    showCheckoutToast(result.message, "error");
  }
};

function renderSuccessScreen(root) {
  const order = window.OrderService ? window.OrderService.getOrderById(placedOrderId) : null;
  const total = order ? order.total : placedOrderTotal;
  root.innerHTML = `
    <main class="modern-checkout-page">
      <div class="modern-success-card container">
        <div class="modern-success-icon">${icon("check")}</div>
        <h1>Order Placed Successfully</h1>
        <p>Thank you for choosing Tứ Quý Garden. Your order is pending confirmation.</p>
        <div class="modern-success-details">
          <div><span>Order ID</span><strong>#${placedOrderId || "TQG1024"}</strong></div>
          <div><span>Trạng thái</span><strong>Pending</strong></div>
          <div><span>Total cost</span><strong>${formatCurrency(total)}</strong></div>
          <div><span>Expected Delivery</span><strong>${placedDeliveryText}</strong></div>
        </div>
        <div class="modern-success-actions"><a href="profile.html" class="modern-secondary-btn">View Orders</a><a href="products.html" class="modern-primary-btn">Continue Shopping</a></div>
      </div>
    </main>
  `;
}

function formatPhone(phone) {
  const compact = String(phone || "").replace(/\s/g, "");
  if (/^0\d{9}$/.test(compact)) return `${compact.slice(0, 4)} ${compact.slice(4, 7)} ${compact.slice(7)}`;
  return escapeHTML(phone);
}

function showCheckoutToast(message, type = "success") {
  let container = document.getElementById("checkout-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "checkout-toast-container";
    container.className = "modern-checkout-toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `modern-checkout-toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function translatePayment(method) {
  return (PAYMENT_METHODS[method] || PAYMENT_METHODS.COD).title;
}

window.handleProvinceChange = function() {};
window.handleDistrictChange = function() {};
window.handlePlaceOrder = function(e) {
  e.preventDefault();
  openConfirmOrderModal();
};
