// components/Header.js — Standard site header (Home page as source of truth)
window.Components = window.Components || {};

window.Components.renderSiteHeader = function (activePage) {
  const active = activePage || "";
  const isActive = function (key) {
    if (Array.isArray(key)) return key.indexOf(active) !== -1 ? " active" : "";
    return active === key ? " active" : "";
  };
  const contactHref = "contact.html";

  return (
    '<header class="main-header">' +
    '<div class="header-container container">' +
    '<a href="index.html" class="logo">' +
    '<img src="images/logo/logo-ngang-cropped.png" alt="Tứ Quý Garden Logo" class="logo-img">' +
    "</a>" +
    '<button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle Navigation">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="3" y1="12" x2="21" y2="12"></line>' +
    '<line x1="3" y1="6" x2="21" y2="6"></line>' +
    '<line x1="3" y1="18" x2="21" y2="18"></line>' +
    "</svg></button>" +
    '<nav class="main-nav" id="main-nav">' +
    '<ul class="nav-list">' +
    '<li><a href="index.html" class="nav-link' +
    isActive("home") +
    '"><span class="lang-vi">Trang chủ</span><span class="lang-en">Home</span></a></li>' +
    '<li><a href="about.html" class="nav-link' +
    isActive("about") +
    '"><span class="lang-vi">Về chúng tôi</span><span class="lang-en">About Us</span></a></li>' +
    '<li class="dropdown">' +
    '<a href="products.html" class="nav-link dropdown-toggle' +
    isActive(["products", "detail"]) +
    '"><span class="lang-vi">Sản phẩm</span><span class="lang-en">Products</span>' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-chevron">' +
    '<polyline points="6 9 12 15 18 9"></polyline></svg></a>' +
    '<ul class="dropdown-menu">' +
    '<li><a href="products.html?category=all"><span class="lang-vi">Tất cả sản phẩm</span><span class="lang-en">All Products</span></a></li>' +
    '<li><a href="products.html?category=Fruits"><span class="lang-vi">Trái cây tươi</span><span class="lang-en">Fresh Fruits</span></a></li>' +
    '<li><a href="products.html?category=Nutritional Seeds"><span class="lang-vi">Hạt dinh dưỡng</span><span class="lang-en">Nutritional Seeds</span></a></li>' +
    '<li><a href="products.html?category=Granola"><span class="lang-vi">Granola ngũ cốc</span><span class="lang-en">Granola</span></a></li>' +
    '<li><a href="products.html?category=Combo Healthy"><span class="lang-vi">Combo sống khỏe</span><span class="lang-en">Combo Healthy</span></a></li>' +
    "</ul></li>" +
    '<li><a href="' +
    contactHref +
    '" class="nav-link' +
    isActive("contact") +
    '"><span class="lang-vi">Liên hệ</span><span class="lang-en">Contact</span></a></li>' +
    '<li><a href="nutrition.html" class="nav-link' +
    isActive("nutrition") +
    '"><span class="lang-vi">Dinh dưỡng cá nhân</span><span class="lang-en">Nutrition Plan</span></a></li>' +
    '<li><a href="traceability.html" class="nav-link' +
    isActive("traceability") +
    '"><span class="lang-vi">Truy xuất nguồn gốc</span><span class="lang-en">Traceability</span></a></li>' +
    "</ul></nav>" +
    '<div class="header-actions">' +
    '<div class="search-bar">' +
    '<input type="text" placeholder="Search products..." id="header-search-input">' +
    '<button class="search-btn" id="header-search-btn" aria-label="Search">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button></div>' +
    '<button class="lang-switch-btn" id="lang-toggle-btn" title="Toggle Language">' +
    '<span class="lang-vi">EN</span><span class="lang-en">VI</span></button>' +
    '<a href="login.html" class="action-icon-btn profile-btn" id="header-profile-btn" title="Tài khoản">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' +
    '<span class="btn-text"><span class="lang-vi" id="header-profile-txt-vi">Tài khoản</span><span class="lang-en" id="header-profile-txt-en">Account</span></span></a>' +
    '<a href="cart.html" class="action-icon-btn cart-btn" title="Giỏ hàng">' +
    '<div class="cart-icon-wrapper">' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>' +
    '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' +
    '<span class="cart-badge" id="header-cart-badge" style="display:none;">0</span></div>' +
    '<span class="btn-text"><span class="lang-vi">Giỏ hàng</span><span class="lang-en">Cart</span></span></a>' +
    "</div></div></header>"
  );
};
