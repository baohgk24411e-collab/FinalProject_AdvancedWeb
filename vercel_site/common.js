// js/common.js

// Shared initialization on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lang (Permanently forced to English)
  localStorage.setItem("tqg_lang", "en");
  const currentLang = "en";
  document.body.className = "lang-en";

  // 1b. Update search placeholder based on language
  const searchInput = document.getElementById("header-search-input");
  if (searchInput) {
    searchInput.placeholder = "Search products...";
  }

  // 2. Initialize database if not exists, or sync latest data.js additions & gallery updates
  const storedProds = localStorage.getItem("tqg_products");

  if (!storedProds) {
    if (window.MOCK_PRODUCTS) {
      localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
    }
  } else {
    try {
      const parsed = JSON.parse(storedProds);
      const oldTotalGalleries = parsed.reduce((sum, p) => sum + (p.gallery ? p.gallery.length : 0), 0);
      const newTotalGalleries = window.MOCK_PRODUCTS ? window.MOCK_PRODUCTS.reduce((sum, p) => sum + (p.gallery ? p.gallery.length : 0), 0) : 0;
      
      if (window.MOCK_PRODUCTS && (parsed.length < window.MOCK_PRODUCTS.length || oldTotalGalleries !== newTotalGalleries)) {
        localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
      } else {
        window.MOCK_PRODUCTS = parsed;
      }
    } catch (e) {
      window.MOCK_PRODUCTS = JSON.parse(storedProds);
    }
  }

  // 3. Initialize mock users if not exists
  if (!localStorage.getItem("tqg_users")) {
    if (window.MOCK_USERS) {
      localStorage.setItem("tqg_users", JSON.stringify(window.MOCK_USERS));
    }
  } else {
    window.MOCK_USERS = JSON.parse(localStorage.getItem("tqg_users"));
  }

  // 4. Setup roots
  setupCommonRoots();

  // 5. Update header dynamic displays (Cart, Account, active styles)
  updateHeaderState();

  // 6. Bind global event listeners
  bindCommonEvents();

  // 7. Check for personalization survey (for new users)
  if (typeof checkNewUserSurvey === "function") {
    checkNewUserSurvey();
  }
});

// Dynamic Header/Footer components fallbacks
window.Components = window.Components || {};

if (!window.Components.renderSiteHeader) {
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
      '</a>' +
      '<button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle Navigation">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="3" y1="12" x2="21" y2="12"></line>' +
      '<line x1="3" y1="6" x2="21" y2="6"></line>' +
      '<line x1="3" y1="18" x2="21" y2="18"></line>' +
      '</svg></button>' +
      '<nav class="main-nav" id="main-nav">' +
      '<ul class="nav-list">' +
      '<li><a href="index.html" class="nav-link' + isActive("home") + '"><span class="lang-vi">Trang chủ</span><span class="lang-en">Home</span></a></li>' +
      '<li><a href="about.html" class="nav-link' + isActive("about") + '"><span class="lang-vi">Về chúng tôi</span><span class="lang-en">About Us</span></a></li>' +
      '<li class="dropdown">' +
      '<a href="products.html" class="nav-link dropdown-toggle' + isActive(["products", "detail"]) + '"><span class="lang-vi">Sản phẩm</span><span class="lang-en">Products</span>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dropdown-chevron">' +
      '<polyline points="6 9 12 15 18 9"></polyline></svg></a>' +
      '<ul class="dropdown-menu">' +
      '<li><a href="products.html?category=all"><span class="lang-vi">Tất cả sản phẩm</span><span class="lang-en">All Products</span></a></li>' +
      '<li><a href="products.html?category=Fruits"><span class="lang-vi">Trái cây tươi</span><span class="lang-en">Fresh Fruits</span></a></li>' +
      '<li><a href="products.html?category=Nutritional Seeds"><span class="lang-vi">Hạt dinh dưỡng</span><span class="lang-en">Nutritional Seeds</span></a></li>' +
      '<li><a href="products.html?category=Granola"><span class="lang-vi">Granola ngũ cốc</span><span class="lang-en">Granola</span></a></li>' +
      '<li><a href="products.html?category=Combo Healthy"><span class="lang-vi">Combo sống khỏe</span><span class="lang-en">Combo Healthy</span></a></li>' +
      '</ul></li>' +
      '<li><a href="' + contactHref + '" class="nav-link' + isActive("contact") + '"><span class="lang-vi">Liên hệ</span><span class="lang-en">Contact</span></a></li>' +
      '<li><a href="nutrition.html" class="nav-link' + isActive("nutrition") + '"><span class="lang-vi">Dinh dưỡng cá nhân</span><span class="lang-en">Nutrition Plan</span></a></li>' +
      '<li><a href="traceability.html" class="nav-link' + isActive("traceability") + '"><span class="lang-vi">Truy xuất nguồn gốc</span><span class="lang-en">Traceability</span></a></li>' +
      '</ul></nav>' +
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
      '</div></div></header>'
    );
  };
}

if (!window.Components.renderSiteFooter) {
  window.Components.renderSiteFooter = function () {
    return (
      '<footer class="main-footer" id="footer-contact">' +
      '<div class="footer-top container">' +
      '<div class="footer-block brand-block">' +
      '<a href="index.html" class="footer-logo">' +
      '<img src="images/logo/logo-white-cropped.png" alt="Tứ Quý Garden Logo" class="footer-logo-img">' +
      '</a>' +
      '<p class="footer-tagline">“Fresh fruits seasonal, healthy seeds daily”</p>' +
      '<p class="footer-desc">' +
      '<span class="lang-vi">Tứ Quý Garden cam kết mang đến nông sản hữu cơ theo mùa tươi ngon, hạt dinh dưỡng chọn lọc và granola lành mạnh chăm sóc sức khỏe gia đình bạn mỗi ngày.</span>' +
      '<span class="lang-en">Tứ Quý Garden commits to bringing ripe seasonal organic produce, premium seeds, and clean healthy granola to nourish your family daily.</span>' +
      '</p>' +
      '<div class="social-links">' +
      '<a href="#" class="social-link" title="Facebook" aria-label="Facebook">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>' +
      '</a>' +
      '<a href="#" class="social-link" title="Instagram" aria-label="Instagram">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>' +
      '</a>' +
      '<a href="#" class="social-link" title="Zalo">' +
      '<span class="zalo-text-icon">Z</span>' +
      '</a>' +
      '</div>' +
      '</div>' +
      '<div class="footer-block">' +
      '<h3 class="footer-title">' +
      '<span class="lang-vi">Danh mục</span><span class="lang-en">Categories</span>' +
      '</h3>' +
      '<ul class="footer-links">' +
      '<li><a href="products.html?category=Fruits"><span class="lang-vi">Trái cây tươi ngon</span><span class="lang-en">Seasonal Fruits</span></a></li>' +
      '<li><a href="products.html?category=Nutritional Seeds"><span class="lang-vi">Hạt dinh dưỡng</span><span class="lang-en">Seeds</span></a></li>' +
      '<li><a href="products.html?category=Granola"><span class="lang-vi">Granola ngũ cốc</span><span class="lang-en">Granola</span></a></li>' +
      '<li><a href="products.html?category=Combo Healthy"><span class="lang-vi">Combo sống khỏe</span><span class="lang-en">Healthy Combos</span></a></li>' +
      '<li><a href="nutrition.html"><span class="lang-vi">Dinh dưỡng cá nhân</span><span class="lang-en">Nutrition Plan</span></a></li>' +
      '<li><a href="traceability.html"><span class="lang-vi">Tra cứu nguồn gốc</span><span class="lang-en">Traceability</span></a></li>' +
      '</ul>' +
      '</div>' +
      '<div class="footer-block">' +
      '<h3 class="footer-title">' +
      '<span class="lang-vi">Hỗ trợ khách hàng</span><span class="lang-en">Customer Service</span>' +
      '</h3>' +
      '<ul class="footer-links">' +
      '<li><a href="about.html"><span class="lang-vi">Giới thiệu cửa hàng</span><span class="lang-en">About Store</span></a></li>' +
      '<li><a href="about.html"><span class="lang-vi">Chính sách đổi trả</span><span class="lang-en">Exchange & Refund</span></a></li>' +
      '<li><a href="about.html"><span class="lang-vi">Chính sách giao hàng</span><span class="lang-en">Shipping Policies</span></a></li>' +
      '<li><a href="about.html"><span class="lang-vi">Câu hỏi thường gặp</span><span class="lang-en">FAQs</span></a></li>' +
      '</ul>' +
      '</div>' +
      '<div class="footer-block contact-block">' +
      '<h3 class="footer-title">' +
      '<span class="lang-vi">Kết nối với chúng tôi</span><span class="lang-en">Contact Info</span>' +
      '</h3>' +
      '<ul class="contact-info-list">' +
      '<li>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>' +
      '<span>Hotline: <strong>1900 633 123</strong></span>' +
      '</li>' +
      '<li>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>' +
      '<span>Email: <a href="mailto:info@tuquygarden.vn">info@tuquygarden.vn</a></span>' +
      '</li>' +
      '<li>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' +
      '<span>Address: Tu Quy Eco-Farm, Cai Be, Tien Giang</span>' +
      '</li>' +
      '</ul>' +
      '<div class="footer-newsletter">' +
      '<p class="newsletter-txt">' +
      '<span class="lang-vi">Đăng ký để nhận ưu đãi:</span>' +
      '<span class="lang-en">Subscribe to promotions:</span>' +
      '</p>' +
      '<form class="newsletter-form" id="footer-newsletter-form">' +
      '<input type="email" placeholder="Email..." required>' +
      '<button type="submit" class="btn btn-secondary">Ok</button>' +
      '</form>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
      '<div class="container footer-bottom-content">' +
      '<p class="copyright-txt">&copy; 2026 Tứ Quý Garden. All Rights Reserved.</p>' +
      '<div class="footer-bottom-links">' +
      '<a href="about.html"><span class="lang-vi">Điều khoản sử dụng</span><span class="lang-en">Terms of Use</span></a>' +
      '<span class="divider">|</span>' +
      '<a href="about.html"><span class="lang-vi">Chính sách bảo mật</span><span class="lang-en">Privacy Policy</span></a>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</footer>'
    );
  };
}

// Setup toast container & modal overlay dynamically
function setupCommonRoots() {
  let activeNav = "home";
  const path = window.location.pathname;
  if (path.includes("about.html")) activeNav = "about";
  else if (path.includes("products.html") || path.includes("detail.html")) activeNav = "products";
  else if (path.includes("nutrition.html")) activeNav = "nutrition";
  else if (path.includes("traceability.html")) activeNav = "traceability";
  else if (path.includes("contact.html")) activeNav = "contact";

  const headerEl = document.querySelector(".main-header");
  if (headerEl && window.Components && window.Components.renderSiteHeader) {
    const overrideNav = headerEl.getAttribute("data-active-nav");
    const active = overrideNav || activeNav;
    headerEl.outerHTML = window.Components.renderSiteHeader(active);
  }

  const footerEl = document.querySelector(".main-footer");
  if (footerEl && window.Components && window.Components.renderSiteFooter) {
    footerEl.outerHTML = window.Components.renderSiteFooter();
  }

  // Auto-inject breadcrumb bar only on pages that do not render their own.
  const hasInlineBreadcrumbPage = ["nutrition.html", "traceability.html", "detail.html", "cart.html"].some(function(page) {
    return path.includes(page);
  });
  if (!document.getElementById("auto-breadcrumb") && !hasInlineBreadcrumbPage && !path.includes("admin") && !path.includes("login.html") && !path.includes("profile.html")) {
    const breadcrumbMap = {
      "about.html":        [{ label: "Về chúng tôi", labelEn: "About Us" }],
      "contact.html":      [{ label: "Liên hệ", labelEn: "Contact Us" }],
      "products.html":     [{ label: "Cửa hàng", labelEn: "Shop" }],
      "detail.html":       [{ label: "Cửa hàng", labelEn: "Shop", href: "products.html" }, { label: "Chi tiết sản phẩm", labelEn: "Product Detail" }],
      "cart.html":         [{ label: "Giỏ hàng", labelEn: "Cart" }],
      "checkout.html":     [{ label: "Giỏ hàng", labelEn: "Cart", href: "cart.html" }, { label: "Thanh toán", labelEn: "Checkout" }],
      "nutrition.html":    [{ label: "Dinh dưỡng cá nhân", labelEn: "Personal Nutrition" }],
      "traceability.html": [{ label: "Truy xuất nguồn gốc", labelEn: "Traceability" }],
    };

    const pageKey = Object.keys(breadcrumbMap).find(k => path.includes(k));
    if (pageKey) {
      const crumbs = breadcrumbMap[pageKey];
      const isEn = document.body.classList.contains("lang-en");
      let crumbHTML = `<a href="index.html" class="bc-item">${isEn ? "Home" : "Trang chủ"}</a>`;
      crumbs.forEach((crumb, i) => {
        crumbHTML += `<span class="bc-sep">›</span>`;
        if (crumb.href && i < crumbs.length - 1) {
          crumbHTML += `<a href="${crumb.href}" class="bc-item">${isEn ? crumb.labelEn : crumb.label}</a>`;
        } else {
          crumbHTML += `<span class="bc-item bc-active">${isEn ? crumb.labelEn : crumb.label}</span>`;
        }
      });

      const bar = document.createElement("div");
      bar.id = "auto-breadcrumb";
      bar.className = "auto-breadcrumb-bar";
      bar.innerHTML = `<div class="container">${crumbHTML}</div>`;

      // Insert right after header
      const header = document.querySelector(".main-header");
      if (header && header.nextSibling) {
        header.parentNode.insertBefore(bar, header.nextSibling);
      } else if (header) {
        header.parentNode.appendChild(bar);
      } else {
        document.body.prepend(bar);
      }

      // Hide any existing inline breadcrumb-hero to avoid duplicates
      document.querySelectorAll(".breadcrumb-hero").forEach(function(el) {
        el.style.display = "none";
      });
    }
  }

  if (!document.getElementById("toast-container")) {
    const toastCont = document.createElement("div");
    toastCont.id = "toast-container";
    toastCont.className = "toast-container";
    document.body.appendChild(toastCont);
  }

  if (!document.getElementById("modal-overlay")) {
    const modalOver = document.createElement("div");
    modalOver.id = "modal-overlay";
    modalOver.className = "modal-overlay";
    modalOver.innerHTML = `
      <div class="modal-content-card">
        <button class="modal-close-btn" onclick="window.closeCustomModal()">&times;</button>
        <div id="modal-body-content"></div>
      </div>
    `;
    modalOver.addEventListener("click", (e) => {
      if (e.target === modalOver) window.closeCustomModal();
    });
    document.body.appendChild(modalOver);
  }

  // Inject chatbot widget if not already present
  if (!document.getElementById("chatbotWidget")) {
    const chatWidget = document.createElement("div");
    chatWidget.id = "chatbotWidget";
    chatWidget.className = "chatbot-widget";
    chatWidget.innerHTML = `
      <button class="chatbot-toggle" id="chatbotToggle" title="AI Hỗ trợ" aria-label="Mở hộp thoại hỗ trợ">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chatbot-icon-chat"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chatbot-icon-close" style="display:none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        <span class="chatbot-badge">AI</span>
      </button>
      <div class="chatbot-panel" id="chatbotPanel">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">🌿</div>
            <div>
              <div class="chatbot-name">Tứ Quý Assistant</div>
              <div class="chatbot-status"><span class="chatbot-status-dot"></span> Đang hoạt động</div>
            </div>
          </div>
          <button class="chatbot-close-btn" id="chatbotClose" aria-label="Đóng">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="chatbot-body" id="chatbotBody"></div>
        <div class="chatbot-footer">
          <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Nhập câu hỏi của bạn...">
          <button class="chatbot-send" id="chatbotSend" aria-label="Gửi">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(chatWidget);

    // Dynamically load chatbot.js if not already loaded
    if (!document.querySelector('script[src*="chatbot.js"]')) {
      const scriptBase = (function() {
        const scripts = document.querySelectorAll('script[src*="common.js"]');
        if (scripts.length > 0) {
          const src = scripts[0].getAttribute('src');
          return src.replace('js/common.js', '').replace('common.js', '');
        }
        return '';
      })();
      const s = document.createElement('script');
      s.src = scriptBase + 'js/chatbot.js';
      document.body.appendChild(s);
    }
  }
}

// Update header cart badge and user profile links
function updateHeaderState() {
  const currentUser = window.AuthService ? window.AuthService.getCurrentUser() : null;

  // Hide cart button if admin is logged in
  const cartBtn = document.querySelector(".header-actions .cart-btn");
  if (cartBtn) {
    if (currentUser && currentUser.isAdmin) {
      cartBtn.style.display = "none";
    } else {
      cartBtn.style.display = "";
    }
  }

  // Update cart badge
  const cartBadge = document.getElementById("header-cart-badge");
  if (cartBadge && window.CartService) {
    const count = window.CartService.getCartCount();
    if (count > 0) {
      cartBadge.style.display = "flex";
      cartBadge.innerText = count;
    } else {
      cartBadge.style.display = "none";
    }
  }

  // Update profile button
  const profileBtn = document.getElementById("header-profile-btn");
  const profileTxtVi = document.getElementById("header-profile-txt-vi");
  const profileTxtEn = document.getElementById("header-profile-txt-en");
  
  if (profileBtn && window.AuthService) {
    if (currentUser) {
      if (currentUser.isAdmin) {
        profileBtn.setAttribute("href", "admin-dashboard.html");
        if (profileTxtVi) profileTxtVi.innerText = "Quản trị";
        if (profileTxtEn) profileTxtEn.innerText = "Admin";
      } else {
        profileBtn.setAttribute("href", "profile.html");
        const firstName = currentUser.name.split(" ").pop();
        if (profileTxtVi) profileTxtVi.innerText = firstName;
        if (profileTxtEn) profileTxtEn.innerText = firstName;
      }
    } else {
      profileBtn.setAttribute("href", "login.html");
      if (profileTxtVi) profileTxtVi.innerText = "Tài khoản";
      if (profileTxtEn) profileTxtEn.innerText = "Account";
    }
  }
}

// Event listeners for static pages
function bindCommonEvents() {
  // Language switcher trigger
  const langToggle = document.getElementById("lang-toggle-btn");
  if (langToggle) {
    langToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const current = localStorage.getItem("tqg_lang") || "vi";
      const nextLang = current === "vi" ? "en" : "vi";
      localStorage.setItem("tqg_lang", nextLang);
      document.body.className = "lang-" + nextLang;
      window.location.reload();
    });
  }

  // Mobile menu drawer
  const mobileToggle = document.getElementById("mobile-toggle");
  const mainNav = document.getElementById("main-nav");
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
    });
  }

  // Header Search Input
  const searchInput = document.getElementById("header-search-input");
  const searchBtn = document.getElementById("header-search-btn");

  const executeSearch = () => {
    if (!searchInput) return;
    const q = searchInput.value.trim();
    if (q) {
      window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    }
  };

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") executeSearch();
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", executeSearch);
  }
}

// TOAST NOTIFICATIONS
window.showToast = function(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-primary);"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-danger);"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
};

// CUSTOM MODAL
window.showCustomModal = function(htmlContent) {
  const overlay = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-body-content");
  
  if (overlay && content) {
    content.innerHTML = htmlContent;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
};

window.closeCustomModal = function() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
};

// CUSTOM CONFIRMATION MODAL (Bypasses native alerts for custom look)
window.showConfirmModal = function(message, onConfirm) {
  const isEn = document.body.classList.contains("lang-en");
  const yesText = isEn ? "Confirm" : "Đồng ý";
  const noText = isEn ? "Cancel" : "Hủy bỏ";
  
  const content = `
    <div style="text-align: center; padding: 15px 10px;">
      <h3 style="margin-bottom: 15px; font-size: 16px; color: var(--color-text-dark); line-height: 1.5;">${message}</h3>
      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 25px;">
        <button class="btn btn-outline" onclick="window.closeCustomModal()" style="padding: 8px 20px; font-size: 13.5px;">${noText}</button>
        <button class="btn btn-primary" id="confirm-modal-yes-btn" style="padding: 8px 20px; font-size: 13.5px;">${yesText}</button>
      </div>
    </div>
  `;
  window.showCustomModal(content);
  
  const yesBtn = document.getElementById("confirm-modal-yes-btn");
  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      window.closeCustomModal();
      onConfirm();
    });
  }
};

// Parse URL search parameters helper
window.getUrlParam = function(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Global helper to format prices
window.formatVND = function(price) {
  return price.toLocaleString() + "đ";
};

// NEW USER PERSONALIZATION SURVEY POPUP
window.checkNewUserSurvey = function() {
  if (!window.AuthService) return;
  const user = window.AuthService.getCurrentUser();
  if (user && user.isNewUser && !user.surveyCompleted && !user.isAdmin) {
    const surveyHTML = `
      <div style="padding: 5px 10px; max-width: 480px; margin: 0 auto; text-align: left;">
        <div style="text-align: center; margin-bottom: 22px;">
          <span style="font-size: 36px; display: inline-block; animation: bounce 2s infinite;">🍒</span>
          <h3 style="font-size: 19px; font-weight: 800; color: var(--color-primary); margin-top: 10px; margin-bottom: 6px; letter-spacing: -0.5px;">Personalize Your Experience</h3>
          <p style="font-size: 13px; color: var(--color-text-light); line-height: 1.45; margin: 0;">Welcome to Tứ Quý Garden! Please share your preferences so we can recommend the best products tailored for you.</p>
        </div>
        <form id="tqg-survey-form" onsubmit="window.submitUserSurvey(event)">
          <div class="admin-form-group" style="margin-bottom: 16px;">
            <label style="font-size: 11px; font-weight: 800; color: var(--color-text-dark); letter-spacing: 0.5px;">1. Which product categories do you enjoy most? *</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
              <label class="admin-checkbox-label" style="font-size: 12px; font-weight: 700;">
                <input type="checkbox" name="survey-product" value="Fruits" checked style="width:16px; height:16px; accent-color:var(--color-primary);"> Seasonal Fresh Fruits
              </label>
              <label class="admin-checkbox-label" style="font-size: 12px; font-weight: 700;">
                <input type="checkbox" name="survey-product" value="Nutritional Seeds" style="width:16px; height:16px; accent-color:var(--color-primary);"> Nutritional Seeds
              </label>
              <label class="admin-checkbox-label" style="font-size: 12px; font-weight: 700;">
                <input type="checkbox" name="survey-product" value="Granola" style="width:16px; height:16px; accent-color:var(--color-primary);"> Granola & Cereals
              </label>
              <label class="admin-checkbox-label" style="font-size: 12px; font-weight: 700;">
                <input type="checkbox" name="survey-product" value="Combo Healthy" style="width:16px; height:16px; accent-color:var(--color-primary);"> Healthy Combos
              </label>
            </div>
          </div>
          
          <div class="admin-form-group" style="margin-bottom: 18px;">
            <label style="font-size: 11px; font-weight: 800; color: var(--color-text-dark); letter-spacing: 0.5px;">2. What taste or texture profiles do you prefer? *</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
              <label class="admin-checkbox-label" style="font-size: 12px; font-weight: 700;">
                <input type="checkbox" name="survey-flavor" value="ngọt" checked style="width:16px; height:16px; accent-color:var(--color-primary);"> Sweet & Rich
              </label>
              <label class="admin-checkbox-label" style="font-size: 12px; font-weight: 700;">
                <input type="checkbox" name="survey-flavor" value="chua" style="width:16px; height:16px; accent-color:var(--color-primary);"> Sour-Sweet
              </label>
              <label class="admin-checkbox-label" style="font-size: 12px; font-weight: 700;">
                <input type="checkbox" name="survey-flavor" value="giòn" style="width:16px; height:16px; accent-color:var(--color-primary);"> Crunchy & Roasted
              </label>
              <label class="admin-checkbox-label" style="font-size: 12px; font-weight: 700;">
                <input type="checkbox" name="survey-flavor" value="dẻo" style="width:16px; height:16px; accent-color:var(--color-primary);"> Chewy & Juicy
              </label>
            </div>
          </div>

          <div class="admin-form-group" style="margin-bottom: 22px;">
            <label style="font-size: 11px; font-weight: 800; color: var(--color-text-dark); letter-spacing: 0.5px;">3. What is your primary health goal?</label>
            <select id="survey-health-goal" class="admin-form-input" style="margin-top: 6px; height: 38px; padding: 6px 12px; font-size:13px; font-weight:700; color:var(--color-text-dark); border:1.5px solid var(--color-gray-border); border-radius:8px;">
              <option value="Eat Clean">Eat Clean (Healthy Lifestyle)</option>
              <option value="Tăng cơ">Muscle Build (Gym & Fitness)</option>
              <option value="Giảm cân">Weight Loss (Keto / Slimming)</option>
              <option value="Mẹ bầu">Mother & Baby Care</option>
              <option value="Gia đình">Family Health & Nutrition</option>
            </select>
          </div>

          <button type="submit" class="admin-btn admin-btn-primary" style="width: 100%; height: 42px; font-size: 13.5px; font-weight: 800; border-radius: 8px; border:none; box-shadow: 0 4px 10px rgba(77, 124, 47, 0.25);">Save Preferences & Explore Recommendations</button>
        </form>
      </div>
      <style>
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      </style>
    `;
    // Delay slightly to let the page settle before popping up
    setTimeout(() => {
      window.showCustomModal(surveyHTML);
    }, 800);
  }
};

window.submitUserSurvey = function(e) {
  e.preventDefault();
  const selectedProds = Array.from(document.querySelectorAll('input[name="survey-product"]:checked')).map(el => el.value);
  const selectedFlavors = Array.from(document.querySelectorAll('input[name="survey-flavor"]:checked')).map(el => el.value);
  const healthGoal = document.getElementById("survey-health-goal").value;
  
  if (!window.AuthService) return;
  const user = window.AuthService.getCurrentUser();
  if (user) {
    user.surveyCompleted = true;
    user.isNewUser = false;
    user.healthGoal = healthGoal;
    user.surveyData = {
      preferredCategories: selectedProds,
      preferredFlavors: selectedFlavors
    };
    
    // Save to registered users list in localStorage
    const users = window.AuthService.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...user };
      window.AuthService.saveUsers(users);
    }
    
    // Save to current active session
    localStorage.setItem("tqg_current_user", JSON.stringify(user));
    window.dispatchEvent(new Event("authChanged"));
    window.closeCustomModal();
    window.showToast("Preferences saved successfully! Customizing your recommendations...", "success");
    
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  }
};
