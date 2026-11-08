// components/ProductCard.js

window.Components = window.Components || {};

window.Components.ProductCard = function (product) {
  const isWishlisted = window.AuthService ? window.AuthService.isInWishlist(product.id) : false;
  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  let badgeHTML = "";

  if (product.isBestSeller) {
    badgeHTML += `
      <span class="card-badge bestseller-badge">
        <span class="badge-icon">🔥</span>
        <span class="lang-vi">Bán chạy</span>
        <span class="lang-en">Bestseller</span>
      </span>
    `;
  } else if (product.isSeasonal) {
    badgeHTML += `
      <span class="card-badge seasonal-badge">
        <span class="badge-icon">🍃</span>
        <span class="lang-vi">Theo mùa</span>
        <span class="lang-en">Seasonal</span>
      </span>
    `;
  }

  if (discountPercent > 0) {
    badgeHTML += `<span class="discount-badge">-${discountPercent}%</span>`;
  }

  if (badgeHTML) {
    badgeHTML = `<div class="card-badges-row">${badgeHTML}</div>`;
  }

  let starsHTML = "";
  const fullStars = Math.floor(product.rating);
  const hasHalf = product.rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      starsHTML += `<span class="star fill">&#9733;</span>`;
    } else if (i === fullStars + 1 && hasHalf) {
      starsHTML += `<span class="star half">&#9733;</span>`;
    } else {
      starsHTML += `<span class="star">&#9733;</span>`;
    }
  }

  const currentLang = localStorage.getItem("tqg_lang") || "en";
  const nameToUse = currentLang === "en" ? (product.nameEn || product.name) : product.name;
  const descToUse = currentLang === "en" ? (product.descriptionEn || product.description) : product.description;
  const reviewCount = product.reviews ? product.reviews.length : 0;
  const shortDesc = descToUse
    ? descToUse.substring(0, 68) + (descToUse.length > 68 ? "..." : "")
    : (currentLang === "en" ? "Natural product, clear origin." : "Sản phẩm tự nhiên, nguồn gốc rõ ràng.");

  const wishlistTitle = isWishlisted 
    ? (currentLang === "en" ? "Remove from wishlist" : "Bỏ yêu thích") 
    : (currentLang === "en" ? "Add to wishlist" : "Yêu thích");
  const cartTitle = currentLang === "en" ? "Add to cart" : "Thêm giỏ hàng";

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="card-img-wrapper">
        ${badgeHTML}

        <button class="wishlist-toggle-btn ${isWishlisted ? "active" : ""}"
          onclick="event.preventDefault(); event.stopPropagation(); window.handleCardWishlistToggle(${product.id})"
          title="${wishlistTitle}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            viewBox="0 0 24 24"
            fill="${isWishlisted ? "currentColor" : "none"}"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <a href="detail.html?id=${product.id}" class="card-link">
          <img src="${product.image}" alt="${nameToUse}" class="product-img" loading="lazy"
            onerror="this.onerror=null; this.src='https://placehold.co/420x300?text=${encodeURIComponent(nameToUse)}'">
        </a>

        <button class="quick-view-btn"
          onclick="event.preventDefault(); event.stopPropagation(); window.openQuickView(${product.id})">
          <span class="lang-vi">Xem nhanh</span>
          <span class="lang-en">Quick view</span>
        </button>
      </div>

      <div class="card-body">
        <h3 class="card-title">
          <a href="detail.html?id=${product.id}">${nameToUse}</a>
        </h3>

        <p class="card-short-desc">${shortDesc}</p>

        <div class="card-rating-row">
          <div class="card-stars">${starsHTML}</div>
          <span class="card-rating-num">${product.rating.toFixed(1)} (${reviewCount || Math.floor(product.rating * 50)})</span>
        </div>

        <div class="card-bottom-row">
          <div class="card-price-box">
            <span class="current-price">${product.price.toLocaleString("vi-VN")}đ</span>
            ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString("vi-VN")}đ</span>` : ""}
          </div>

          <button class="circle-cart-btn"
            onclick="event.preventDefault(); event.stopPropagation(); window.handleCardAddToCart(${product.id})"
            title="${cartTitle}">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
};

function translateCategory(cat) {
  const currentLang = localStorage.getItem("tqg_lang") || "vi";

  if (currentLang === "en") {
    const trans = {
      "Fruits": "Fruits",
      "Nutritional Seeds": "Seeds",
      "Granola": "Granola",
      "Combo Healthy": "Healthy Combos"
    };
    return trans[cat] || cat;
  }

  const trans = {
    "Fruits": "Trái cây",
    "Nutritional Seeds": "Hạt dinh dưỡng",
    "Granola": "Granola ngũ cốc",
    "Combo Healthy": "Combo sống khỏe"
  };

  return trans[cat] || cat;
}

window.handleCardAddToCart = function (productId) {
  if (!window.CartService) return;

  const result = window.CartService.addToCart(productId, 1);
  const isEn = (localStorage.getItem("tqg_lang") || "en") === "en";

  if (result.success) {
    window.showToast(result.message || (isEn ? "Added to cart successfully!" : "Đã thêm vào giỏ hàng!"), "success");

    const badge = document.getElementById("header-cart-badge");
    if (badge) {
      const count = window.CartService.getCartCount();
      badge.style.display = "flex";
      badge.innerText = count;
    }
  } else {
    window.showToast(result.message || (isEn ? "Could not add product to cart." : "Không thể thêm sản phẩm."), "error");
  }
};

window.handleCardWishlistToggle = function (productId) {
  if (!window.AuthService) return;

  const result = window.AuthService.toggleWishlist(productId);
  const isEn = (localStorage.getItem("tqg_lang") || "en") === "en";

  if (result.success) {
    window.showToast(result.message || (isEn ? "Wishlist updated!" : "Đã cập nhật yêu thích!"), "success");

    if (window.location.pathname.includes("profile.html")) {
      window.location.reload();
    }
  } else {
    window.showToast(result.message || (isEn ? "Please login first." : "Vui lòng đăng nhập trước."), "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 600);
  }
};

window.openQuickView = function (productId) {
  const product = window.MOCK_PRODUCTS.find(item => item.id === productId);
  if (!product) return;

  const discountPercent = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const modalHTML = `
    <div class="quick-view-modal">
      <div class="quick-view-img">
        <img src="${product.image}" alt="${product.name}">
      </div>

      <div class="quick-view-content">
        <span class="card-category-tag">${translateCategory(product.category)}</span>

        <h2 class="font-serif">${product.name}</h2>

        <p>${product.description || "Sản phẩm được tuyển chọn từ nguồn nguyên liệu chất lượng cao, phù hợp với lối sống lành mạnh."}</p>

        <div class="quick-view-meta">
          <span>🌿 100% tự nhiên</span>
          <span>🔎 Truy xuất QR</span>
          <span>🚚 Giao nhanh</span>
          <span>🎁 Đóng gói đẹp</span>
        </div>

        <div class="quick-view-price">
          <strong>${product.price.toLocaleString("vi-VN")}đ</strong>
          ${product.oldPrice ? `<del>${product.oldPrice.toLocaleString("vi-VN")}đ</del>` : ""}
          ${discountPercent > 0 ? `<span class="price-discount">-${discountPercent}%</span>` : ""}
        </div>

        <div class="quick-view-actions">
          <button class="btn btn-outline" onclick="window.handleCardAddToCart(${product.id})">
            Thêm vào giỏ
          </button>

          <a class="btn btn-primary" href="detail.html?id=${product.id}">
            Xem chi tiết
          </a>
        </div>
      </div>
    </div>
  `;

  if (window.openCustomModal) {
    window.openCustomModal(modalHTML);
  } else {
    alert(product.name);
  }
};
