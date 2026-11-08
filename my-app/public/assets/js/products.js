// js/products.js

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("products-catalog-grid");
  if (grid && window.showProductSkeleton) window.showProductSkeleton(grid, 12);

  const healthGoalParam = getUrlParam("healthGoal") || "";
  const promoParam = getUrlParam("promo") || "";

  const state = {
    search: getUrlParam("search") || "",
    category: getUrlParam("category") || "all",
    season: getUrlParam("season") || "all",
    healthGoals: healthGoalParam ? healthGoalParam.split(",") : [],
    priceRange: getUrlParam("priceRange") || "all",
    productCategories: [],
    promos: promoParam ? promoParam.split(",") : [],
    sort: getUrlParam("sort") || "newest",
    view: localStorage.getItem("tqg_view_mode") || "grid"
  };

  if (state.category !== "all") {
    state.productCategories = [state.category];
  }

  syncStateToDOM(state);
  updateFilterCounts();
  applyViewMode(state);

  // Small delay so the skeleton shimmer is actually perceivable instead of
  // flashing for 0ms (the local catalog filters instantly otherwise).
  window.setTimeout(() => {
    filterAndRender(state);
    renderActiveFilterChips(state);
  }, 280);

  bindFilterEvents(state);
});

function applyViewMode(state) {
  const grid = document.getElementById("products-catalog-grid");
  if (grid) grid.classList.toggle("is-list-view", state.view === "list");
  document.querySelectorAll(".view-toggle-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === state.view);
  });
}

function filterLabel(type, value) {
  const seasonLabels = { "seasonal": "Đặc sản theo mùa", "Mùa hè": "Mùa hè", "Mùa đông": "Mùa đông", "Quanh năm": "Có quanh năm" };
  const categoryLabels = { "Fruits": "Trái cây theo mùa", "Nutritional Seeds": "Hạt dinh dưỡng", "Granola": "Granola & Healthy snacks", "Combo Healthy": "Eat Clean Box & Combo" };
  const priceLabels = { "under-50": "Dưới 50.000đ", "50-100": "50.000đ - 100.000đ", "100-200": "100.000đ - 200.000đ", "over-200": "Trên 200.000đ" };
  const promoLabels = { "bestseller": "Bán chạy", "sale": "Đang giảm giá", "seasonal": "Sản phẩm theo mùa" };

  if (type === "search") return `Tìm: "${value}"`;
  if (type === "season") return seasonLabels[value] || value;
  if (type === "healthGoal") return value;
  if (type === "priceRange") return priceLabels[value] || value;
  if (type === "category") return categoryLabels[value] || value;
  if (type === "promo") return promoLabels[value] || value;
  return value;
}

// Renders the row of removable pills summarizing every filter currently
// applied, so people don't have to scroll back up the sidebar to see (or
// undo) what's active.
function renderActiveFilterChips(state) {
  const bar = document.getElementById("active-filters-bar");
  if (!bar) return;

  const chips = [];
  if (state.search) chips.push({ type: "search", value: state.search });
  if (state.season !== "all") chips.push({ type: "season", value: state.season });
  state.healthGoals.forEach(g => chips.push({ type: "healthGoal", value: g }));
  if (state.priceRange !== "all") chips.push({ type: "priceRange", value: state.priceRange });
  state.productCategories.forEach(c => chips.push({ type: "category", value: c }));
  state.promos.forEach(p => chips.push({ type: "promo", value: p }));

  if (chips.length === 0) {
    bar.innerHTML = "";
    return;
  }

  bar.innerHTML = chips.map(chip => `
    <span class="filter-chip">
      ${filterLabel(chip.type, chip.value)}
      <button type="button" data-remove-type="${chip.type}" data-remove-value="${chip.value}" aria-label="Bỏ lọc">&times;</button>
    </span>
  `).join("") + `<button type="button" class="filter-chip-clear-all" id="chip-clear-all">Xóa tất cả</button>`;

  bar.querySelectorAll("[data-remove-type]").forEach(btn => {
    btn.addEventListener("click", () => removeFilterChip(state, btn.dataset.removeType, btn.dataset.removeValue));
  });
  const clearAllBtn = document.getElementById("chip-clear-all");
  if (clearAllBtn) clearAllBtn.addEventListener("click", () => document.getElementById("reset-filters-btn")?.click());
}

function removeFilterChip(state, type, value) {
  if (type === "search") {
    state.search = "";
    const headerInput = document.getElementById("header-search-input");
    if (headerInput) headerInput.value = "";
    const searchBadge = document.getElementById("search-badge");
    if (searchBadge) searchBadge.style.display = "none";
  } else if (type === "season") {
    state.season = "all";
  } else if (type === "healthGoal") {
    state.healthGoals = state.healthGoals.filter(g => g !== value);
  } else if (type === "priceRange") {
    state.priceRange = "all";
  } else if (type === "category") {
    state.productCategories = state.productCategories.filter(c => c !== value);
    state.category = state.productCategories.length === 1 ? state.productCategories[0] : "all";
  } else if (type === "promo") {
    state.promos = state.promos.filter(p => p !== value);
  }

  syncStateToDOM(state);
  updateURL(state);
  filterAndRender(state);
  renderActiveFilterChips(state);
}

function syncStateToDOM(state) {
  const headerInput = document.getElementById("header-search-input");
  if (headerInput && state.search) {
    headerInput.value = state.search;
  }

  document.querySelectorAll('input[name="season"]').forEach(radio => {
    radio.checked = radio.value === state.season;
  });

  document.querySelectorAll('input[name="healthGoal"]').forEach(cb => {
    cb.checked = state.healthGoals.includes(cb.value);
  });

  document.querySelectorAll('input[name="priceRange"]').forEach(radio => {
    radio.checked = radio.value === state.priceRange;
  });

  document.querySelectorAll('input[name="productCategory"]').forEach(cb => {
    cb.checked = state.productCategories.includes(cb.value);
  });

  document.querySelectorAll('input[name="promo"]').forEach(cb => {
    cb.checked = state.promos.includes(cb.value);
  });

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.value = state.sort;
  }

  const searchBadge = document.getElementById("search-badge");
  const keywordVi = document.getElementById("search-keyword-vi");
  const keywordEn = document.getElementById("search-keyword-en");
  if (searchBadge && state.search) {
    searchBadge.style.display = "flex";
    if (keywordVi) keywordVi.innerText = state.search;
    if (keywordEn) keywordEn.innerText = state.search;
  } else if (searchBadge) {
    searchBadge.style.display = "none";
  }
}

function updateFilterCounts() {
  const products = window.MOCK_PRODUCTS || [];
  const setCount = (selector, count) => {
    const el = document.querySelector(`[data-filter="${selector}"]`);
    if (el) el.textContent = `(${count})`;
  };

  setCount("season-all", products.length);
  setCount("season-seasonal", products.filter(p => p.isSeasonal).length);
  setCount("season-Mùa hè", products.filter(p => p.season === "Mùa hè").length);
  setCount("season-Mùa đông", products.filter(p => p.season === "Mùa đông").length);
  setCount("season-Quanh năm", products.filter(p => p.season === "Quanh năm").length);

  ["Eat Clean", "Tăng cơ", "Giảm cân", "Bổ sung năng lượng", "Gia đình", "Snack lành mạnh"].forEach(goal => {
    setCount(`goal-${goal}`, products.filter(p => p.healthGoals && p.healthGoals.includes(goal)).length);
  });

  setCount("price-under-50", products.filter(p => p.price < 50000).length);
  setCount("price-50-100", products.filter(p => p.price >= 50000 && p.price <= 100000).length);
  setCount("price-100-200", products.filter(p => p.price > 100000 && p.price <= 200000).length);
  setCount("price-over-200", products.filter(p => p.price > 200000).length);

  ["Fruits", "Nutritional Seeds", "Granola", "Combo Healthy"].forEach(cat => {
    setCount(`cat-${cat}`, products.filter(p => p.category === cat).length);
  });

  setCount("promo-bestseller", products.filter(p => p.isBestSeller).length);
  setCount("promo-sale", products.filter(p => p.oldPrice).length);
  setCount("promo-seasonal", products.filter(p => p.isSeasonal).length);
}

function filterAndRender(state) {
  let result = [...window.MOCK_PRODUCTS];

  if (state.search) {
    const q = state.search.toLowerCase().trim();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (state.productCategories.length > 0) {
    result = result.filter(p => state.productCategories.includes(p.category));
  } else if (state.category !== "all") {
    result = result.filter(p => p.category === state.category);
  }

  if (state.season !== "all") {
    if (state.season === "seasonal") {
      result = result.filter(p => p.isSeasonal);
    } else {
      result = result.filter(p => p.season === state.season);
    }
  }

  if (state.healthGoals.length > 0) {
    result = result.filter(p =>
      state.healthGoals.some(goal => p.healthGoals && p.healthGoals.includes(goal))
    );
  }

  if (state.priceRange !== "all") {
    if (state.priceRange === "under-50") {
      result = result.filter(p => p.price < 50000);
    } else if (state.priceRange === "50-100") {
      result = result.filter(p => p.price >= 50000 && p.price <= 100000);
    } else if (state.priceRange === "100-200") {
      result = result.filter(p => p.price > 100000 && p.price <= 200000);
    } else if (state.priceRange === "over-200") {
      result = result.filter(p => p.price > 200000);
    }
  }

  if (state.promos.length > 0) {
    result = result.filter(p => {
      return state.promos.every(promo => {
        if (promo === "bestseller") return p.isBestSeller;
        if (promo === "sale") return !!p.oldPrice;
        if (promo === "seasonal") return p.isSeasonal;
        return true;
      });
    });
  }

  if (state.sort === "newest") {
    result.sort((a, b) => b.id - a.id);
  } else if (state.sort === "price-asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (state.sort === "price-desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (state.sort === "bestseller") {
    result.sort((a, b) => {
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      return b.rating - a.rating;
    });
  }

  const countVi = document.getElementById("product-count");
  const countEn = document.getElementById("product-count-en");
  if (countVi) countVi.innerText = result.length;
  if (countEn) countEn.innerText = result.length;

  const grid = document.getElementById("products-catalog-grid");
  const emptyState = document.getElementById("empty-state");

  if (result.length === 0) {
    if (grid) grid.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
  } else {
    if (emptyState) emptyState.style.display = "none";
    if (grid) {
      grid.style.display = "";
      grid.innerHTML = result.map(p => window.Components.ProductCard(p)).join("");
    }
  }
}

function bindFilterEvents(state) {
  document.querySelectorAll('input[name="season"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      state.season = e.target.value;
      updateURL(state);
      filterAndRender(state);
      renderActiveFilterChips(state);
    });
  });

  document.querySelectorAll('input[name="healthGoal"]').forEach(cb => {
    cb.addEventListener("change", () => {
      state.healthGoals = Array.from(
        document.querySelectorAll('input[name="healthGoal"]:checked')
      ).map(el => el.value);
      updateURL(state);
      filterAndRender(state);
      renderActiveFilterChips(state);
    });
  });

  document.querySelectorAll('input[name="priceRange"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      state.priceRange = e.target.value;
      updateURL(state);
      filterAndRender(state);
      renderActiveFilterChips(state);
    });
  });

  document.querySelectorAll('input[name="productCategory"]').forEach(cb => {
    cb.addEventListener("change", () => {
      state.productCategories = Array.from(
        document.querySelectorAll('input[name="productCategory"]:checked')
      ).map(el => el.value);
      state.category = state.productCategories.length === 1
        ? state.productCategories[0]
        : "all";
      updateURL(state);
      filterAndRender(state);
      renderActiveFilterChips(state);
    });
  });

  document.querySelectorAll('input[name="promo"]').forEach(cb => {
    cb.addEventListener("change", () => {
      state.promos = Array.from(
        document.querySelectorAll('input[name="promo"]:checked')
      ).map(el => el.value);
      updateURL(state);
      filterAndRender(state);
      renderActiveFilterChips(state);
    });
  });

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      state.sort = e.target.value;
      updateURL(state);
      filterAndRender(state);
    });
  }

  document.querySelectorAll(".view-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      localStorage.setItem("tqg_view_mode", state.view);
      applyViewMode(state);
    });
  });

  const clearSearchBtn = document.getElementById("clear-search-btn");
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      state.search = "";
      const headerInput = document.getElementById("header-search-input");
      if (headerInput) headerInput.value = "";
      document.getElementById("search-badge").style.display = "none";
      updateURL(state);
      filterAndRender(state);
      renderActiveFilterChips(state);
    });
  }

  const resetBtn = document.getElementById("reset-filters-btn");
  const resetEmptyBtn = document.getElementById("reset-empty-btn");

  const resetAll = () => {
    state.search = "";
    state.category = "all";
    state.season = "all";
    state.healthGoals = [];
    state.priceRange = "all";
    state.productCategories = [];
    state.promos = [];
    state.sort = "newest";

    const headerInput = document.getElementById("header-search-input");
    if (headerInput) headerInput.value = "";

    syncStateToDOM(state);
    updateURL(state);
    filterAndRender(state);
    renderActiveFilterChips(state);
  };

  if (resetBtn) resetBtn.addEventListener("click", resetAll);
  if (resetEmptyBtn) resetEmptyBtn.addEventListener("click", resetAll);

  const sidebarClearBtn = document.getElementById("sidebar-clear-filters");
  if (sidebarClearBtn) sidebarClearBtn.addEventListener("click", resetAll);

  const mobileFilterBtn = document.getElementById("mobile-filter-btn");
  const closeSidebarBtn = document.getElementById("close-sidebar-btn");
  const sidebar = document.getElementById("shop-sidebar");

  if (mobileFilterBtn && sidebar) {
    mobileFilterBtn.addEventListener("click", () => sidebar.classList.add("open"));
  }
  if (closeSidebarBtn && sidebar) {
    closeSidebarBtn.addEventListener("click", () => sidebar.classList.remove("open"));
  }
}

function updateURL(state) {
  const url = new URL(window.location);
  const simpleKeys = ["search", "season", "priceRange", "sort"];

  simpleKeys.forEach(key => {
    if (state[key] && state[key] !== "all") {
      url.searchParams.set(key, state[key]);
    } else {
      url.searchParams.delete(key);
    }
  });

  if (state.productCategories.length === 1) {
    url.searchParams.set("category", state.productCategories[0]);
  } else {
    url.searchParams.delete("category");
  }

  if (state.healthGoals.length) {
    url.searchParams.set("healthGoal", state.healthGoals.join(","));
  } else {
    url.searchParams.delete("healthGoal");
  }

  if (state.promos.length) {
    url.searchParams.set("promo", state.promos.join(","));
  } else {
    url.searchParams.delete("promo");
  }

  window.history.pushState({}, "", url);
}
