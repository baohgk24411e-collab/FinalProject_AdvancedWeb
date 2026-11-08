// js/detail.js

let activeProduct = null;
let activeImage = "";
let quantity = 1;
let activeTab = "description";

document.addEventListener("DOMContentLoaded", () => {
  const productId = parseInt(getUrlParam("id"));
  activeProduct = window.MOCK_PRODUCTS.find(p => p.id === productId);

  const root = document.getElementById("product-detail-root");
  if (!root) return;

  if (!activeProduct) {
    renderNotFound(root);
    return;
  }

  activeImage = activeProduct.image;
  quantity = 1;
  activeTab = "description";

  renderDetails(root);

  document.addEventListener("keydown", (e) => {
    const overlay = document.getElementById("lightbox-overlay");
    if (!overlay || !overlay.classList.contains("open")) return;
    if (e.key === "Escape") window.closeLightbox();
    if (e.key === "ArrowLeft") window.navigateLightbox(-1);
    if (e.key === "ArrowRight") window.navigateLightbox(1);
  });

  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "lightbox-overlay") {
      window.closeLightbox();
    }
  });
});

function translateCategory(cat) {
  const mapping = {
    "Fruits": "Fresh Fruits",
    "Nutritional Seeds": "Nutritional Seeds",
    "Granola": "Granola & Nuts",
    "Combo Healthy": "Healthy Combos"
  };
  return mapping[cat] || cat;
}

function getSoldCount(product) {
  return 800 + product.id * 97 + (product.reviews ? product.reviews.length * 23 : 0);
}

// Deterministic "N people viewing" number — derived from the product id so
// it stays stable across re-renders instead of jumping around randomly,
// which would look obviously fake.
function getViewerCount(product) {
  return 8 + ((product.id * 37) % 40);
}

function renderUrgencyRow(product) {
  const chips = [];
  if (typeof product.stock === "number" && product.stock > 0 && product.stock <= 20) {
    chips.push(`
      <span class="urgency-chip low-stock">
        <span class="pulse-dot"></span>
        Only ${product.stock} items left
      </span>
    `);
  }
  chips.push(`
    <span class="urgency-chip viewers">
      🔥 ${getViewerCount(product)} people are viewing this product
    </span>
  `);
  return `<div class="detail-urgency-row">${chips.join("")}</div>`;
}

function getGalleryImages(product) {
  // Return the product's actual gallery if specified, otherwise fallback to just the main product image.
  // We do not pad with unrelated mockup images like mangoes or gift boxes.
  return product.gallery && product.gallery.length ? [...product.gallery] : [product.image];
}

function renderNotFound(root) {
  root.innerHTML = `
    <div class="container text-center" style="padding: 100px 0;">
      <h2 class="font-serif">Product not found</h2>
      <p>The product you are looking for does not exist or is no longer available.</p>
      <a href="products.html" class="btn btn-primary" style="margin-top: 20px;">Back to store</a>
    </div>
  `;
}

function renderStarsHTML(rating) {
  let html = "";
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      html += `<span class="star fill">&#9733;</span>`;
    } else if (i === fullStars + 1 && hasHalf) {
      html += `<span class="star half">&#9733;</span>`;
    } else {
      html += `<span class="star">&#9733;</span>`;
    }
  }
  return html;
}

function renderDetails(root) {
  const p = activeProduct;
  const discountPercent = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  const isWishlisted = window.AuthService ? window.AuthService.isInWishlist(p.id) : false;
  const starsHTML = renderStarsHTML(p.rating);
  const soldCount = getSoldCount(p);
  const reviewCount = p.reviews.length || Math.floor(p.rating * 50);

  const related = window.MOCK_PRODUCTS
    .filter(item => item.category === p.category && item.id !== p.id)
    .slice(0, 8);

  const combos = window.MOCK_PRODUCTS
    .filter(item => item.category === "Combo Healthy" && item.id !== p.id)
    .slice(0, 8);

  const galleryImages = getGalleryImages(p);
  const currentImageIndex = galleryImages.indexOf(activeImage);
  const safeImageIndex = currentImageIndex >= 0 ? currentImageIndex : 0;

  const features = [
    { icon: "🌿", text: "100% natural, no preservatives" },
    { icon: "🥗", text: "Rich in fiber, vitamins & minerals" },
    { icon: "❤️", text: "Good for heart health, digestion, and skin" },
    { icon: "💪", text: "Suitable for Eat Clean, Keto, and healthy lifestyles" }
  ];

  root.innerHTML = `
    <div class="product-detail-container container">
      <ul class="breadcrumb">
        <li><a href="index.html"><span class="lang-vi">Trang chủ</span><span class="lang-en">Home</span></a></li>
        <li>/</li>
        <li><a href="products.html?category=${encodeURIComponent(p.category)}">${translateCategory(p.category)}</a></li>
        <li>/</li>
        <li>${p.name}</li>
      </ul>

      <div class="detail-layout-grid">
        <!-- Cột Trái: Gallery & Cam kết, QR -->
        <div class="gallery-wrapper" style="display: flex; flex-direction: column; gap: 30px;">
          <div>
            <div class="main-image-container" onclick="openLightbox()">
            ${p.isBestSeller || discountPercent > 0 ? `
              <div class="detail-badges-row">
                ${p.isBestSeller ? `
                  <span class="bestseller-badge-large">
                    <span class="badge-icon">🔥</span>
                    <span class="lang-vi">Bán chạy</span>
                    <span class="lang-en">Bestseller</span>
                  </span>` : ""}
                ${discountPercent > 0 ? `
                  <span class="discount-badge-large">
                    <span class="lang-vi">Giảm ${discountPercent}%</span>
                    <span class="lang-en">-${discountPercent}% OFF</span>
                  </span>` : ""}
              </div>
            ` : ""}
              ${galleryImages.length > 1 ? `
                <button class="gallery-nav-btn gallery-prev" onclick="event.stopPropagation(); navigateGallery(-1)" aria-label="Previous image">‹</button>
                <button class="gallery-nav-btn gallery-next" onclick="event.stopPropagation(); navigateGallery(1)" aria-label="Next image">›</button>
              ` : ""}
              <img src="${activeImage}" alt="${p.name}" id="main-product-img">
            </div>

            <div class="gallery-thumbnails">
              ${galleryImages.map((img, idx) => `
                <div class="thumb-img ${safeImageIndex === idx ? "active" : ""} ${idx === 0 ? "thumb-video" : ""}"
                  onclick="switchImage('${img}', ${idx})">
                  <img src="${img}" alt="${p.name} ${idx + 1}">
                  ${idx === 0 ? `<span class="thumb-play-icon">▶</span>` : ""}
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Cam kết & QR của Tứ Quý Garden -->
          <div class="trust-shipping-details">
            <div class="info-card">
              <div class="info-card-item">
                <div class="ic-icon">🚚</div>
                <div class="ic-text">
                  <h4>Shipping</h4>
                  <p>Fast nationwide delivery<br>Free shipping on orders from 499K</p>
                </div>
              </div>

              <div class="info-card-item">
                <div class="ic-icon">🎁</div>
                <div class="ic-text">
                  <h4>Free delivery</h4>
                  <p>For orders from 499,000đ</p>
                </div>
              </div>

              <a href="about.html" class="info-link">View shipping policy ›</a>
            </div>

            <div class="info-card">
              <div class="info-card-header">
                <span>🛡️</span>
                <h4>Our promise at Tứ Quý Garden</h4>
              </div>

              <ul class="commit-list">
                <li>100% natural products</li>
                <li>No preservatives</li>
                <li>Carefully selected ingredients</li>
                <li>Proudly produced and packaged in Vietnam</li>
              </ul>

              <a href="about.html" class="info-link">Learn more about our commitment ›</a>
            </div>

            <div class="qr-card">
              <div class="qr-content">
                <h4>Traceability</h4>
                <p>Scan the QR code to view the product journey and quality data</p>
                <button class="btn btn-primary btn-sm" onclick="switchTab('trace')">Scan QR</button>
              </div>

              <div class="qr-img-box">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=tuquygarden.vn/trace/${p.id}" alt="QR">
              </div>
            </div>
          </div>
        </div>

        <!-- Cột Phải: Thông tin mua hàng, mô tả, tính năng -->
        <div class="product-buy-details">
          <h1 class="detail-title font-serif">${p.name}</h1>

          <div class="detail-rating-row">
            <span class="brand-text">Brand: Tứ Quý Garden</span>
            <span class="divider">|</span>
            <div class="detail-stars">${starsHTML}</div>
            <span class="rating-score">${p.rating.toFixed(1)}</span>
            <span class="rating-num">(${reviewCount} reviews)</span>
            <span class="divider">|</span>
            <span class="sold-count">Sold ${soldCount.toLocaleString("vi-VN")}+</span>
          </div>

          <div class="detail-price-box">
            <span class="current-price">${p.price.toLocaleString("vi-VN")}đ</span>
            ${p.oldPrice ? `<span class="old-price">${p.oldPrice.toLocaleString("vi-VN")}đ</span>` : ""}
            ${discountPercent > 0 ? `<span class="price-discount">-${discountPercent}%</span>` : ""}
          </div>

          <div class="quantity-control-row" style="margin-top: 20px;">
            <span class="label">Quantity:</span>
            <div class="quantity-adjuster">
              <button onclick="adjustQuantity(-1)" aria-label="Decrease">−</button>
              <input type="number" id="detail-qty-input" value="${quantity}" min="1" max="${p.stock}" onchange="setQuantity(this.value)">
              <button onclick="adjustQuantity(1)" aria-label="Increase">+</button>
            </div>
          </div>

          <div class="buy-buttons-row">
            <button class="btn btn-outline cart-btn-large" onclick="addToCart()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span>Add to cart</span>
            </button>
            <button class="btn btn-primary buy-btn-large" onclick="buyNow()">
              <span>Buy now</span>
            </button>
          </div>

          <p class="detail-short-desc" style="margin-top: 24px;">${p.description}</p>

          ${renderUrgencyRow(p)}

          <div class="product-features-grid">
            ${features.map(f => `
              <div class="feat-item">
                <span class="feat-icon">${f.icon}</span>
                <span>${f.text}</span>
              </div>
            `).join("")}
          </div>

          <div class="detail-mini-benefits">
            <div class="detail-mini-benefit">
              <span class="mini-icon">🌿</span>
              <span>100% natural</span>
            </div>
            <div class="detail-mini-benefit">
              <span class="mini-icon">🔎</span>
              <span>Clear traceability</span>
            </div>
            <div class="detail-mini-benefit">
              <span class="mini-icon">🚚</span>
              <span>Fast delivery</span>
            </div>
            <div class="detail-mini-benefit">
              <span class="mini-icon">♻️</span>
              <span>7-day return</span>
            </div>
          </div>

          <div class="social-actions-row">
            <button class="text-action-btn ${isWishlisted ? "active" : ""}" onclick="toggleWishlist()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${isWishlisted ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Wishlist
            </button>
            <button class="text-action-btn" onclick="shareProduct()">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
          </div>
        </div>
      </div>

      <div class="detail-tabs-section">
        <div class="tabs-nav-header">
          <button class="tab-nav-btn ${activeTab === "description" ? "active" : ""}" onclick="switchTab('description')">Description</button>
          <button class="tab-nav-btn ${activeTab === "ingredients" ? "active" : ""}" onclick="switchTab('ingredients')">Ingredients</button>
          <button class="tab-nav-btn ${activeTab === "nutrition" ? "active" : ""}" onclick="switchTab('nutrition')">Nutrition</button>
          <button class="tab-nav-btn ${activeTab === "trace" ? "active" : ""}" onclick="switchTab('trace')">Traceability</button>
          <button class="tab-nav-btn ${activeTab === "reviews" ? "active" : ""}" onclick="switchTab('reviews')">Reviews (${reviewCount})</button>
        </div>

        <div class="tab-content-body">
          ${renderTabContent()}
        </div>
      </div>

      <div class="traceability-timeline-section">
        <h3 class="section-title text-center">A transparent journey of this product</h3>

        <div class="timeline-steps">
          <div class="step-item">
            <div class="step-icon">🌱</div>
            <h5>Source region</h5>
            <p>Certified and stable</p>
          </div>
          <div class="step-divider"></div>
          <div class="step-item">
            <div class="step-icon">✂️</div>
            <h5>Harvest & processing</h5>
            <p>At the right time</p>
          </div>
          <div class="step-divider"></div>
          <div class="step-item">
            <div class="step-icon">🔬</div>
            <h5>Selection & inspection</h5>
            <p>Using modern technology</p>
          </div>
          <div class="step-divider"></div>
          <div class="step-item">
            <div class="step-icon">📦</div>
            <h5>Packaging</h5>
            <p>Safe for food hygiene</p>
          </div>
          <div class="step-divider"></div>
          <div class="step-item">
            <div class="step-icon">🚚</div>
            <h5>Delivery</h5>
            <p>Fresh and complete</p>
          </div>
        </div>
      </div>

      ${related.length === 0 ? "" : `
        <div class="related-products-section mt-50">
          <div class="section-header-flex">
            <h2 class="section-title">Related products</h2>
            <div class="section-header-actions">
              <a href="products.html?category=${encodeURIComponent(p.category)}" class="view-all-link">View all ›</a>
              <button class="carousel-nav-btn" onclick="scrollCarousel('related-carousel', 1)" aria-label="Scroll next">›</button>
            </div>
          </div>
          <div class="products-carousel-track" id="related-carousel">
            ${related.map(item => window.Components.ProductCard(item)).join("")}
          </div>
        </div>
      `}

      ${combos.length === 0 ? "" : `
        <div class="related-products-section mt-50">
          <div class="section-header-flex">
            <h2 class="section-title">Combos for you</h2>
            <div class="section-header-actions">
              <a href="products.html?category=Combo Healthy" class="view-all-link">View all ›</a>
              <button class="carousel-nav-btn" onclick="scrollCarousel('combo-carousel', 1)" aria-label="Scroll next">›</button>
            </div>
          </div>
          <div class="products-carousel-track" id="combo-carousel">
            ${combos.map(item => window.Components.ProductCard(item)).join("")}
          </div>
        </div>
      `}
    </div>

    <!-- Sticky mobile buy bar: appears once the main buy box scrolls out of view -->
    <div class="sticky-buy-bar" id="sticky-buy-bar">
      <img src="${p.image}" alt="${p.name}">
      <div class="sticky-buy-bar-info">
        <strong>${p.name}</strong>
        <span>${p.price.toLocaleString("vi-VN")}đ</span>
      </div>
      <button class="btn btn-primary" onclick="buyNow()">Buy now</button>
    </div>

    <!-- Image lightbox -->
    <div class="lightbox-overlay" id="lightbox-overlay">
      <button class="lightbox-close-btn" onclick="closeLightbox()" aria-label="Close">&times;</button>
      <button class="lightbox-nav-btn lightbox-prev" onclick="navigateLightbox(-1)" aria-label="Previous image">‹</button>
      <img src="${activeImage}" alt="${p.name}" id="lightbox-img">
      <button class="lightbox-nav-btn lightbox-next" onclick="navigateLightbox(1)" aria-label="Next image">›</button>
    </div>
  `;

  initStickyBuyBar();
}

function renderTabContent() {
  const p = activeProduct;

  if (activeTab === "description") {
    return `
      <div class="tab-pane active-pane" style="animation: fadeIn 0.4s ease;">
        <div style="line-height: 1.8; color: #555; font-size: 15px;">
          <p style="margin-bottom: 16px;">
            The <strong style="color: var(--color-primary);">${p.name}</strong> product is carefully selected from premium agricultural produce sourced from the <strong style="color: #8b5e3c;">${p.region}</strong> region.
            Tứ Quý Garden guarantees a closed-loop harvesting process that preserves its natural flavor and the highest nutrient content.
          </p>
          <p style="margin-bottom: 20px;">
            This product is committed to being free from harmful preservatives, artificial ripening agents, and added fillers.
            It is suitable for Eat Clean eaters, athletes, office workers, and modern families embracing a greener lifestyle.
          </p>
          <div style="background: #fdfaf2; padding: 20px; border-radius: 12px; border-left: 4px solid var(--color-primary);">
            <h5 style="margin: 0 0 10px 0; color: var(--color-primary); font-weight: 700; font-size: 16px;">🌿 Storage & usage guide:</h5>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #6d5555;">
              <li>Store in a cool, dry, well-ventilated place away from direct sunlight.</li>
              <li>Seal the container or bag after use to preserve its natural crispness and aroma.</li>
              <li>Enjoy directly or pair with yogurt, smoothies, or salads.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === "ingredients") {
    return `
      <div class="tab-pane active-pane" style="animation: fadeIn 0.4s ease;">
        <div style="line-height: 1.8; color: #555; font-size: 15px;">
          <h4 style="color: var(--color-text-dark); margin-bottom: 15px; font-weight: 700;">Clean, wholesome ingredients:</h4>
          <ul style="padding-left: 20px; line-height: 2; margin: 0; color: #555;">
            ${p.category === "Fruits" ? `
              <li><strong>100% naturally ripened fruit</strong>, harvested directly from VietGAP-certified partner orchards.</li>
              <li><strong>No pesticide residue above regulated limits</strong>.</li>
              <li>No artificial wax coating is used to keep the fruit fresh.</li>
            ` : `
              <li><strong>Premium nutritional seeds</strong> (almonds, walnuts, macadamia, cashews...) are freeze-dried to preserve their natural oils.</li>
              <li>Natural wild honey and imported organic oats are used for Granola lines.</li>
              <li><strong>Completely free from refined sugar</strong> and artificial sweeteners.</li>
            `}
          </ul>
        </div>
      </div>
    `;
  }

  if (activeTab === "nutrition") {
    return `
      <div class="tab-pane active-pane" style="animation: fadeIn 0.4s ease;">
        <div style="max-width: 500px;">
          <h4 style="color: var(--color-text-dark); margin-bottom: 8px; font-weight: 700;">Nutrition information</h4>
          <p style="font-size: 13.5px; color: var(--color-text-light); margin-bottom: 20px;">* Average values per 100g of product</p>
          <div class="nutrition-table-simple" style="border: 1px solid rgba(0,0,0,0.06); border-radius: 12px; overflow: hidden; background: #fff;">
            <div class="nutri-row" style="display: flex; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(0,0,0,0.05); background: #faf9f6;">
              <span style="color: #666; font-weight: 500;">Energy</span>
              <strong style="color: var(--color-primary);">${p.nutrition.calories || "N/A"} kcal</strong>
            </div>
            <div class="nutri-row" style="display: flex; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(0,0,0,0.05);">
              <span style="color: #666; font-weight: 500;">Protein</span>
              <strong style="color: var(--color-text-dark);">${p.nutrition.protein || "N/A"}</strong>
            </div>
            <div class="nutri-row" style="display: flex; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(0,0,0,0.05); background: #faf9f6;">
              <span style="color: #666; font-weight: 500;">Carbohydrate</span>
              <strong style="color: var(--color-text-dark);">${p.nutrition.carbs || "N/A"}</strong>
            </div>
            <div class="nutri-row" style="display: flex; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(0,0,0,0.05);">
              <span style="color: #666; font-weight: 500;">Fat</span>
              <strong style="color: var(--color-text-dark);">${p.nutrition.fat || "N/A"}</strong>
            </div>
            <div class="nutri-row" style="display: flex; justify-content: space-between; padding: 14px 20px; background: #faf9f6;">
              <span style="color: #666; font-weight: 500;">Fiber</span>
              <strong style="color: var(--color-text-dark);">${p.nutrition.fiber || "N/A"}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === "trace") {
    return `
      <div class="tab-pane active-pane" style="animation: fadeIn 0.4s ease;">
        <div style="max-width: 600px;">
          <h4 style="color: var(--color-text-dark); margin-bottom: 18px; font-weight: 700;">Digital traceability profile</h4>
          <div class="trace-table-simple" style="display: flex; flex-direction: column; gap: 12px; background: #fcfcfc; padding: 25px; border-radius: 16px; border: 1px solid rgba(0,0,0,0.05);">
            <div class="trace-row" style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px dashed rgba(0,0,0,0.08);">
              <span style="color: #777;">Supplier:</span>
              <strong style="color: var(--color-text-dark);">${p.origin}</strong>
            </div>
            <div class="trace-row" style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px dashed rgba(0,0,0,0.08);">
              <span style="color: #777;">Certified growing region:</span>
              <strong style="color: var(--color-text-dark);">${p.region}</strong>
            </div>
            <div class="trace-row" style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px dashed rgba(0,0,0,0.08);">
              <span style="color: #777;">Harvest date:</span>
              <strong style="color: var(--color-text-dark);">${p.harvestDate}</strong>
            </div>
            <div class="trace-row" style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px dashed rgba(0,0,0,0.08);">
              <span style="color: #777;">Batch code:</span>
              <strong style="color: var(--color-primary); font-family: monospace; font-size: 15px;">#TQG-${p.slug.substring(0, 3).toUpperCase()}-${p.id}</strong>
            </div>
            <div class="trace-row" style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px;">
              <span style="color: #777;">Certification:</span>
              <div class="cert-tags" style="display: flex; gap: 8px;">
                ${p.certification.map(c => `<span style="background: rgba(72,128,48,0.1); color: var(--color-primary); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${c}</span>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === "reviews") {
    return `
      <div class="tab-pane active-pane" style="animation: fadeIn 0.4s ease;">
        <div class="reviews-list-container">
          ${p.reviews.length === 0 ? `
            <div style="text-align: center; padding: 40px 20px; color: #777;">
              <span style="font-size: 40px; display: block; margin-bottom: 15px;">⭐️</span>
              <p>This product has no customer reviews yet.</p>
              <p style="font-size: 13px; color: #999;">Be the first to try it and share your feedback!</p>
            </div>
          ` : p.reviews.map(r => `
            <div class="review-item" style="border-bottom: 1px solid rgba(0,0,0,0.05); padding: 20px 0; display: flex; flex-direction: column; gap: 8px;">
              <div class="review-head" style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--color-text-dark); font-size: 15px;">${r.name}</strong>
                <div class="review-stars" style="color: #ffb800; font-size: 15px;">
                  ${"&#9733;".repeat(r.rating)}${"&#9734;".repeat(5 - r.rating)}
                </div>
              </div>
              <p style="color: #555; line-height: 1.6; font-size: 14px; margin: 0;">${r.comment}</p>
            </div>
          `).join("")}

          <div style="margin-top: 30px; text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="showAddReviewModal()" style="border-radius: 6px; font-weight: 600;">Write your review</button>
          </div>
        </div>
      </div>
    `;
  }
}

window.switchImage = function (img, index) {
  activeImage = img;
  const mainImg = document.getElementById("main-product-img");
  if (mainImg) mainImg.src = img;

  const lightboxImg = document.getElementById("lightbox-img");
  if (lightboxImg) lightboxImg.src = img;

  const thumbs = document.querySelectorAll(".thumb-img");
  thumbs.forEach((t, idx) => {
    const isMatch = typeof index === "number"
      ? idx === index
      : t.querySelector("img").getAttribute("src") === img;
    t.classList.toggle("active", isMatch);
  });
};

window.openLightbox = function () {
  const overlay = document.getElementById("lightbox-overlay");
  if (overlay) {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
};

window.closeLightbox = function () {
  const overlay = document.getElementById("lightbox-overlay");
  if (overlay) {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
};

window.navigateLightbox = function (direction) {
  navigateGallery(direction);
};

// Sticky mobile buy bar — only visible once the real "Mua ngay" button has
// scrolled out of view, so it doesn't duplicate what's already on screen.
function initStickyBuyBar() {
  const bar = document.getElementById("sticky-buy-bar");
  const buyRow = document.querySelector(".buy-buttons-row");
  if (!bar || !buyRow || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        bar.classList.toggle("visible", !entry.isIntersecting && entry.boundingClientRect.top < 0);
      });
    },
    { threshold: 0 }
  );
  observer.observe(buyRow);
}

window.navigateGallery = function (direction) {
  if (!activeProduct) return;
  const galleryImages = getGalleryImages(activeProduct);
  const currentIndex = galleryImages.indexOf(activeImage);
  const nextIndex = (currentIndex + direction + galleryImages.length) % galleryImages.length;
  switchImage(galleryImages[nextIndex], nextIndex);
};

window.scrollCarousel = function (carouselId, direction) {
  const track = document.getElementById(carouselId);
  if (!track) return;
  const card = track.querySelector(".product-card");
  const scrollAmount = card ? card.offsetWidth + 22 : 300;
  track.scrollBy({ left: scrollAmount * direction, behavior: "smooth" });
};

window.switchTab = function (tabName) {
  activeTab = tabName;
  const root = document.getElementById("product-detail-root");
  if (root) renderDetails(root);
};

window.shareProduct = function () {
  if (navigator.share) {
    navigator.share({
      title: activeProduct.name,
      text: activeProduct.description,
      url: window.location.href
    }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    window.showToast("Product link copied!", "success");
  }
};

window.adjustQuantity = function (amount) {
  const nextVal = quantity + amount;

  if (nextVal >= 1 && nextVal <= activeProduct.stock) {
    quantity = nextVal;
    const input = document.getElementById("detail-qty-input");
    if (input) input.value = nextVal;
  }
};

window.setQuantity = function (val) {
  let intVal = parseInt(val) || 1;
  intVal = Math.max(1, Math.min(activeProduct.stock, intVal));
  quantity = intVal;

  const input = document.getElementById("detail-qty-input");
  if (input) input.value = intVal;
};

window.addToCart = function () {
  if (!window.CartService) return;

  const result = window.CartService.addToCart(activeProduct.id, quantity);

  if (result.success) {
    window.showToast(result.message, "success");
    if (window.updateHeaderState) window.updateHeaderState();
  } else {
    window.showToast(result.message, "error");
  }
};

window.buyNow = function () {
  if (!window.CartService) return;

  const result = window.CartService.addToCart(activeProduct.id, quantity);

  if (result.success) {
    window.location.href = "cart.html";
  } else {
    window.showToast(result.message, "error");
  }
};

window.toggleWishlist = function () {
  if (!window.AuthService) return;

  const result = window.AuthService.toggleWishlist(activeProduct.id);

  if (result.success) {
    window.showToast(result.message, "success");
    const root = document.getElementById("product-detail-root");
    if (root) renderDetails(root);
  } else {
    window.showToast(result.message, "error");
    window.location.href = "login.html";
  }
};

window.showAddReviewModal = function () {
  if (!window.AuthService) return;

  const currentUser = window.AuthService.getCurrentUser();

  if (!currentUser) {
    window.showToast("Please log in to submit a review.", "error");
    window.location.href = "login.html";
    return;
  }

  window.showReviewModal(({ comment, rating }) => {
    activeProduct.reviews.push({
      name: currentUser.name,
      rating,
      comment
    });

    localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
    window.showToast("Review submitted successfully!", "success");

    activeTab = "reviews";
    const root = document.getElementById("product-detail-root");
    if (root) renderDetails(root);
  });
};
