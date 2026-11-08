// js/admin.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Guard check: Must be Admin
  if (window.AuthService) {
    const user = window.AuthService.getCurrentUser();
    if (!user || !user.isAdmin) {
      window.location.href = "login.html";
      return;
    }
  }

  // 2. Dispatch to specific page controllers
  const pathname = window.location.pathname;

  if (pathname.includes("admin-dashboard") || pathname.includes("/admin/dashboard") || document.getElementById("admin-total-orders")) {
    initAdminDashboard();
  } else if (pathname.includes("admin-products") || pathname.includes("/admin/products") || document.getElementById("admin-products-table-body")) {
    initAdminProducts();
  } else if (pathname.includes("admin-orders") || pathname.includes("/admin/orders") || document.getElementById("admin-orders-table-body")) {
    initAdminOrders();
  }
});

window.initAdminDashboardPage = window.initAdminDashboard = initAdminDashboard;
window.initAdminProductsPage = window.initAdminProducts = initAdminProducts;
window.initAdminOrdersPage = window.initAdminOrders = initAdminOrders;

// Logout handler
window.handleAdminLogout = function() {
  if (window.AuthService) {
    window.AuthService.logout();
    window.showToast("Logged out successfully.", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  }
};

// Reset mockup data
window.resetAdminDataMockup = function() {
  window.showConfirmModal("Are you sure you want to restore all original product and order mockup data?", () => {
    localStorage.removeItem("tqg_products");
    localStorage.removeItem("tqg_orders");
    window.showToast("Restored original data successfully!", "success");
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  });
};

/* ==========================================================================
   ADMIN DASHBOARD SECTION
   ========================================================================== */
function initAdminDashboard() {
  if (!window.OrderService) return;

  const kpis = window.OrderService.getAdminKPIs();
  const allOrders = window.OrderService.getOrders();
  
  // Calculate pending orders count
  const pendingCount = allOrders.filter(o => o.status === "Chờ xác nhận").length;
  
  // Update KPI counters
  const rev = document.getElementById("kpi-revenue");
  const ords = document.getElementById("kpi-orders");
  const prods = document.getElementById("kpi-products");
  const pend = document.getElementById("kpi-pending");

  if (rev) rev.innerText = (window.formatVND ? window.formatVND(kpis.revenue) : kpis.revenue.toLocaleString() + "đ");
  if (ords) ords.innerText = kpis.totalOrders;
  if (prods) prods.innerText = kpis.totalProducts;
  if (pend) pend.innerText = pendingCount;

  // Update refund request KPI count in dashboard
  const refundReqCount = allOrders.filter(o => o.refundRequest && o.refundRequest.status === "pending").length;
  const refundEl = document.getElementById("kpi-refund-requests");
  if (refundEl) refundEl.innerText = refundReqCount;

  // Bind dynamic current calendar date
  const dateEl = document.getElementById("current-calendar-date");
  if (dateEl) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    dateEl.innerText = `${dd}/${mm}/${yyyy}`;
  }

  // Render bestsellers in dashboard
  const bestBody = document.getElementById("bestsellers-list-body");
  if (bestBody) {
    if (kpis.bestSellers.length === 0) {
      bestBody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:var(--color-text-light);">No data available</td></tr>`;
    } else {
      bestBody.innerHTML = kpis.bestSellers.slice(0, 5).map(p => `
        <tr>
          <td>
            <div style="display:flex; gap:10px; align-items:center;">
              <img src="${p.image}" alt="" style="width:32px; height:32px; object-fit:contain; background:white; border:1px solid var(--color-gray-border); border-radius:50%; padding:2px;">
              <strong>${p.name}</strong>
            </div>
          </td>
          <td style="text-align: right; font-weight:700; color:var(--color-primary);">${p.sales} <span class="lang-vi">đã bán</span><span class="lang-en">sold</span></td>
        </tr>
      `).join("");
    }
  }

  // Render recent orders in dashboard
  const recentBody = document.getElementById("recent-orders-list-body");
  if (recentBody) {
    const recents = allOrders.slice(0, 5);
    if (recents.length === 0) {
      recentBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--color-text-light);">No orders yet</td></tr>`;
    } else {
      recentBody.innerHTML = recents.map(o => {
        let statusClass = "status-cho-xac-nhan";
        if (o.status === "Đang xử lý") statusClass = "status-dang-xu-ly";
        if (o.status === "Đang giao") statusClass = "status-dang-giao";
        if (o.status === "Hoàn thành") statusClass = "status-hoan-thanh";
        if (o.status === "Đã hủy") statusClass = "status-da-huy";

        const isEn = document.body.classList.contains("lang-en");
        const statusText = isEn ? translateOrderStatus(o.status) : o.status;

        return `
          <tr>
            <td><strong>#${o.id}</strong></td>
            <td><strong>${o.customerName}</strong></td>
            <td style="font-weight:700; color:var(--color-primary);">${window.formatVND ? window.formatVND(o.total) : o.total.toLocaleString() + 'đ'}</td>
            <td style="text-align: center;"><span class="order-status-badge ${statusClass}">${statusText}</span></td>
          </tr>
        `;
      }).join("");
    }
  }

  // Render low stock alerts
  const lowBody = document.getElementById("lowstock-list-body");
  if (lowBody) {
    const lowStocks = (window.MOCK_PRODUCTS || []).filter(p => p.stock < 15);
    if (lowStocks.length === 0) {
      lowBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--color-success); font-weight:600; padding:15px 0;">All products have safe stock levels!</td></tr>`;
    } else {
      lowBody.innerHTML = lowStocks.slice(0, 5).map(p => `
        <tr>
          <td>#${p.id}</td>
          <td><img src="${p.image}" alt="" style="width:30px; height:30px; object-fit:contain; background:white; border:1px solid var(--color-gray-border); border-radius:4px;"></td>
          <td><strong>${p.name}</strong></td>
          <td style="text-align: right;" class="stock-critical">${p.stock}</td>
        </tr>
      `).join("");
    }
  }

  // Render Bezier Area spline chart
  renderRevenueSplineChart();

  // Render new dynamic charts
  renderOrderDistributionDonut();
  renderCategorySalesChart();
}

function translateOrderStatus(status) {
  const translations = {
    "Chờ xác nhận": "Pending",
    "Đang xử lý": "Processing",
    "Đang chuẩn bị": "Preparing",
    "Đang giao": "Shipping",
    "Hoàn thành": "Completed",
    "Đã hủy": "Cancelled",
    "Trả hàng/Hoàn tiền": "Returned/Refunded"
  };
  return translations[status] || status;
}

function getBezierPath(points) {
  if (points.length === 0) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0[0] + (p1[0] - p0[0]) / 2;
    const cpY1 = p0[1];
    const cpX2 = p0[0] + (p1[0] - p0[0]) / 2;
    const cpY2 = p1[1];
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1[0]} ${p1[1]}`;
  }
  return d;
}

function renderRevenueSplineChart() {
  // Baseline sales for 2026 months (T1 - T12)
  const monthlyRevenue = [500000, 600000, 700000, 600000, 1200000, 1400000, 1100000, 2000000, 1200000, 1300000, 1500000, 1200000];
  
  // Aggregate real mock orders for 2026
  if (window.OrderService) {
    const orders = window.OrderService.getOrders();
    orders.forEach(o => {
      if (o.status === "Hoàn thành") {
        const date = new Date(o.date);
        if (date.getFullYear() === 2026) {
          const monthIdx = date.getMonth();
          monthlyRevenue[monthIdx] += o.total;
        }
      }
    });
  }

  // Generate spline nodes mapping coordinate offsets (fitted to 560x160 viewBox)
  const maxVal = Math.max(2500000, ...monthlyRevenue);
  const points = [];
  for (let i = 0; i < 12; i++) {
    const x = 38 + i * 46;
    const y = 145 - (monthlyRevenue[i] / maxVal) * 125;
    points.push([x, y]);
  }

  // Line path
  const lineD = getBezierPath(points);
  const linePathEl = document.getElementById("spline-line-path");
  if (linePathEl) linePathEl.setAttribute("d", lineD);

  // Area path
  const areaD = `${lineD} L ${points[points.length - 1][0]} 145 L ${points[0][0]} 145 Z`;
  const areaPathEl = document.getElementById("spline-area-path");
  if (areaPathEl) areaPathEl.setAttribute("d", areaD);

  // Spark nodes inside SVG
  const dotsGroup = document.getElementById("spline-dots-group");
  if (dotsGroup) {
    dotsGroup.innerHTML = points.map((p, i) => {
      const valText = window.formatVND ? window.formatVND(monthlyRevenue[i]) : monthlyRevenue[i].toLocaleString() + "đ";
      return `
        <circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#FFFFFF" stroke="#4D7C2F" stroke-width="2.5" style="cursor: pointer; transition: all 0.2s;"
          onmouseover="window.showSplineTooltip(event, '${i + 1}', '${valText}', ${p[0]}, ${p[1]})"
          onmouseout="window.hideSplineTooltip()"
          onmouseenter="this.setAttribute('r', '7'); this.setAttribute('fill', '#4D7C2F');"
          onmouseleave="this.setAttribute('r', '5'); this.setAttribute('fill', '#FFFFFF');" />
      `;
    }).join("");
  }

  // Calculate summaries underneath chart
  const total2026Revenue = monthlyRevenue.reduce((a, b) => a + b, 0);
  const avgMonthly = Math.round(total2026Revenue / 12);
  const peakVal = Math.max(...monthlyRevenue);
  const peakMonthIdx = monthlyRevenue.indexOf(peakVal);

  const subTotal = document.getElementById("sub-revenue-total");
  const subAvg = document.getElementById("sub-revenue-avg");
  const subPeak = document.getElementById("sub-revenue-peak");

  const fmt = val => window.formatVND ? window.formatVND(val) : val.toLocaleString() + "đ";

  if (subTotal) subTotal.innerText = fmt(total2026Revenue);
  if (subAvg) subAvg.innerText = fmt(avgMonthly);
  if (subPeak) subPeak.innerText = `T${peakMonthIdx + 1} (${fmt(peakVal)})`;
}

function renderOrderDistributionDonut() {
  const allOrders = window.OrderService.getOrders();
  const counts = {
    pending: allOrders.filter(o => o.status === "Chờ xác nhận").length,
    processing: allOrders.filter(o => o.status === "Đang xử lý" || o.status === "Đang chuẩn bị").length,
    delivering: allOrders.filter(o => o.status === "Đang giao").length,
    completed: allOrders.filter(o => o.status === "Hoàn thành").length,
    cancelled: allOrders.filter(o => o.status === "Đã hủy").length
  };

  const total = allOrders.length || 1;
  const centerVal = document.getElementById("donut-center-value");
  if (centerVal) centerVal.textContent = allOrders.length;

  const data = [
    { label: "Chờ xác nhận", count: counts.pending, stroke: "#d97706" },
    { label: "Đang xử lý", count: counts.processing, stroke: "#0369a1" },
    { label: "Đang giao", count: counts.delivering, stroke: "#7e22ce" },
    { label: "Hoàn thành", count: counts.completed, stroke: "#15803d" },
    { label: "Đã hủy", count: counts.cancelled, stroke: "#b91c1c" }
  ];

  const slicesGroup = document.getElementById("donut-slices-group");
  const legend = document.getElementById("donut-legend");
  if (!slicesGroup || !legend) return;

  slicesGroup.innerHTML = "";
  legend.innerHTML = "";

  let currentAngle = -90; // start at top

  data.forEach(slice => {
    if (slice.count === 0) return;
    const percentage = slice.count / total;
    const angle = percentage * 360;

    const r = 55;
    const cx = 90;
    const cy = 90;
    
    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians)
      };
    };

    // Calculate arc path
    const start = polarToCartesian(cx, cy, r, currentAngle);
    const end = polarToCartesian(cx, cy, r, currentAngle + angle);
    const largeArcFlag = angle <= 180 ? "0" : "1";

    const pathData = [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");

    // For single full circle 100% donut
    let dAttr = pathData;
    if (percentage >= 0.999) {
      dAttr = `M 90,35 A 55,55 0 1,1 89.9,35 Z`;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", dAttr);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", slice.stroke);
    path.setAttribute("stroke-width", "18");
    path.setAttribute("style", "transition: stroke-width 0.2s; cursor: pointer;");
    path.addEventListener("mouseenter", () => path.setAttribute("stroke-width", "22"));
    path.addEventListener("mouseleave", () => path.setAttribute("stroke-width", "18"));
    
    slicesGroup.appendChild(path);
    currentAngle += angle;
  });

  const isEn = document.body.classList.contains("lang-en");
  legend.innerHTML = data.map(slice => {
    const label = isEn ? translateOrderStatus(slice.label) : slice.label;
    return `
      <div style="display:flex; align-items:center; gap:8px; font-size:11.5px; font-weight:700; color:var(--color-text-dark);">
        <span style="width:8px; height:8px; border-radius:50%; background-color:${slice.stroke}; display:inline-block;"></span>
        <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${label}</span>
        <span style="color:var(--color-text-light); font-weight:600; font-size:11px;">${slice.count}</span>
      </div>
    `;
  }).join("");
}

function renderCategorySalesChart() {
  const allOrders = window.OrderService ? window.OrderService.getOrders() : [];

  // Baseline mock sales so chart always has meaningful data (simulates historical sales)
  const baselines = {
    "Fruits": 3200000,
    "Nutritional Seeds": 2650000,
    "Granola": 1480000,
    "Combo Healthy": 890000
  };

  const categorySales = { ...baselines };

  // Add real order totals (all non-cancelled orders count toward pipeline revenue)
  allOrders.forEach(o => {
    if (o.status !== "Đã hủy" && Array.isArray(o.items)) {
      o.items.forEach(item => {
        const prod = (window.MOCK_PRODUCTS || []).find(p => p.id === item.id);
        if (prod && categorySales[prod.category] !== undefined) {
          categorySales[prod.category] += (item.price || 0) * (item.quantity || 1);
        }
      });
    }
  });

  const chartContainer = document.getElementById("category-bar-chart");
  if (!chartContainer) return;

  // Sort by value descending for better visual hierarchy
  const data = [
    { label: "Fruits", vi: "Trái cây theo mùa", color: "#4D7C2F", value: categorySales["Fruits"] },
    { label: "Nutritional Seeds", vi: "Hạt dinh dưỡng", color: "#d69818", value: categorySales["Nutritional Seeds"] },
    { label: "Granola", vi: "Granola ngũ cốc", color: "#0369a1", value: categorySales["Granola"] },
    { label: "Combo Healthy", vi: "Combo sống khỏe", color: "#7e22ce", value: categorySales["Combo Healthy"] }
  ].sort((a, b) => b.value - a.value);

  const maxVal = Math.max(1, ...data.map(d => d.value));
  const isEn = document.body.classList.contains("lang-en");
  const fmt = val => window.formatVND ? window.formatVND(val) : val.toLocaleString() + "đ";

  chartContainer.innerHTML = data.map(item => {
    const label = isEn ? item.label : item.vi;
    const percentage = (item.value / maxVal) * 100;
    return `
      <div style="margin-bottom: 6px;">
        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:var(--color-text-dark); margin-bottom:4px;">
          <span>${label}</span>
          <span style="color:${item.color}; font-weight:800;">${fmt(item.value)}</span>
        </div>
        <div style="width:100%; height:8px; background:var(--color-cream-light); border-radius:10px; overflow:hidden;">
          <div style="width:${percentage}%; height:100%; background:${item.color}; border-radius:10px; transition: width 0.9s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 1px 3px ${item.color}44;"></div>
        </div>
        <div style="font-size:9.5px; color:var(--color-text-light); margin-top:2px; font-weight:600;">${Math.round(percentage)}% of total</div>
      </div>
    `;
  }).join("");
}

window.showSplineTooltip = function(event, monthNum, valText, cx, cy) {
  const tooltip = document.getElementById("spline-chart-tooltip");
  if (!tooltip) return;
  tooltip.innerHTML = `<span class="lang-vi">Tháng ${monthNum}:</span><span class="lang-en">Month ${monthNum}:</span> <strong>${valText}</strong>`;
  tooltip.style.display = "block";
  tooltip.style.left = `${(cx / 560) * 100}%`;
  tooltip.style.top = `${(cy / 160) * 100}%`;
};

window.hideSplineTooltip = function() {
  const tooltip = document.getElementById("spline-chart-tooltip");
  if (tooltip) tooltip.style.display = "none";
};


// EXPORT TRANSACTIONS TO EXCEL/CSV FILE
window.exportToCSV = function() {
  const isEn = document.body.classList.contains("lang-en");
  if (!window.OrderService) {
    window.showToast(isEn ? "Order service not ready!" : "Dịch vụ đơn hàng chưa sẵn sàng!", "error");
    return;
  }
  const allOrders = window.OrderService.getOrders();
  if (!allOrders || allOrders.length === 0) {
    window.showToast(isEn ? "No order data to export!" : "Không có dữ liệu đơn hàng để xuất!", "warning");
    return;
  }

  // Load html2pdf from CDN dynamically if not loaded
  if (typeof html2pdf === 'undefined') {
    window.showToast(isEn ? "Initializing PDF converter..." : "Đang khởi tạo công cụ chuyển đổi PDF...", "info");
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      generateActualPDFReport(allOrders);
    };
    script.onerror = () => {
      window.showToast(isEn ? "Failed to initialize PDF library!" : "Không thể tải thư viện PDF!", "error");
    };
    document.head.appendChild(script);
  } else {
    generateActualPDFReport(allOrders);
  }
};

function generateActualPDFReport(allOrders) {
  const isEn = document.body.classList.contains("lang-en");
  const successfulOrders = allOrders.filter(o => o.status === "Hoàn thành");
  const pendingOrders = allOrders.filter(o => o.status === "Chờ xác nhận");
  const processingOrders = allOrders.filter(o => o.status === "Đang xử lý" || o.status === "Đang giao");
  const cancelledOrders = allOrders.filter(o => o.status === "Đã hủy");

  const totalSales = successfulOrders.reduce((sum, o) => sum + o.total, 0);
  const fmt = val => window.formatVND ? window.formatVND(val) : val.toLocaleString() + "đ";

  // Calculate Region sales
  const salesRegion = { "Cái Bè": 0, "Mộc Châu": 0, "Tây Nguyên": 0, "Bến Tre": 0 };
  allOrders.forEach(order => {
    if (order.status === "Hoàn thành") {
      order.items.forEach(item => {
        const prod = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
        if (prod) {
          if (prod.region.includes("Cái Bè") || prod.region.includes("Tiền Giang")) salesRegion["Cái Bè"] += item.price * item.quantity;
          else if (prod.region.includes("Mộc Châu") || prod.region.includes("Sơn La")) salesRegion["Mộc Châu"] += item.price * item.quantity;
          else if (prod.region.includes("Tây Nguyên") || prod.region.includes("Đắk Lắk") || prod.region.includes("Gia Lai")) salesRegion["Tây Nguyên"] += item.price * item.quantity;
          else if (prod.region.includes("Bến Tre")) salesRegion["Bến Tre"] += item.price * item.quantity;
        }
      });
    }
  });

  // Calculate Category sales
  const categorySales = { "Fruits": 0, "Nutritional Seeds": 0, "Granola": 0 };
  successfulOrders.forEach(o => {
    o.items.forEach(item => {
      const prod = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
      if (prod) {
        categorySales[prod.category] = (categorySales[prod.category] || 0) + (item.price * item.quantity);
      }
    });
  });

  // Generate transaction rows
  const txRows = allOrders.map(o => {
    const dateStr = new Date(o.date).toLocaleString(isEn ? "en-US" : "vi-VN");
    
    let pm = o.paymentMethod;
    if (!isEn) {
      if (o.paymentMethod === "Bank transfer") pm = "Chuyển khoản";
      else if (o.paymentMethod === "E-wallet") pm = "Ví điện tử";
      else pm = "COD";
    } else {
      if (o.paymentMethod === "Bank transfer") pm = "Bank Transfer";
      else if (o.paymentMethod === "E-wallet") pm = "E-Wallet";
      else pm = "COD";
    }
    
    let bg = "#fef3c7", fg = "#92400e";
    let statusLabel = isEn ? "Pending" : "Chờ xác nhận";
    if (o.status === "Hoàn thành") { 
      bg = "#d1fae5"; fg = "#065f46"; 
      statusLabel = isEn ? "Completed" : "Hoàn thành"; 
    }
    else if (o.status === "Đã hủy") { 
      bg = "#fee2e2"; fg = "#991b1b"; 
      statusLabel = isEn ? "Cancelled" : "Đã hủy"; 
    }
    else if (o.status === "Đang xử lý") { 
      bg = "#e0f2fe"; fg = "#075985"; 
      statusLabel = isEn ? "Processing" : "Đang xử lý"; 
    }
    else if (o.status === "Đang giao") { 
      bg = "#e0f2fe"; fg = "#075985"; 
      statusLabel = isEn ? "Shipping" : "Đang giao"; 
    }

    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #E2DDD5; font-weight:700;">#${o.id}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E2DDD5;">
          <strong>${o.customerName}</strong><br>
          <span style="font-size:10px; color:#5B6A56;">${o.customerPhone}</span>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #E2DDD5; font-size:11px;">${dateStr}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E2DDD5;">${pm}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E2DDD5; font-weight:700; color:#4D7C2F; text-align:right;">${fmt(o.total)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E2DDD5; text-align:center;">
          <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px; background:${bg}; color:${fg};">${statusLabel}</span>
        </td>
      </tr>
    `;
  }).join("");

  const todayStr = new Date().toLocaleString(isEn ? "en-US" : "vi-VN");

  const reportHTML = `
    <div style="font-family: Arial, sans-serif; color: #2E3A2B; line-height: 1.5; padding: 25px; background: #FFFFFF; width: 700px;">
      <!-- Title -->
      <table style="width: 100%; border-collapse: collapse; border-bottom: 3px solid #4D7C2F; padding-bottom: 12px; margin-bottom: 25px;">
        <tr>
          <td style="vertical-align: bottom;">
            <h2 style="color: #4D7C2F; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px; font-family: Arial, sans-serif;">TỨ QUÝ GARDEN</h2>
            <span style="font-size: 10px; color: #5B6A56; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; font-family: Arial, sans-serif;">${isEn ? 'Premium Green Organic Farming System' : 'Hệ thống Nông sản Hữu cơ Xanh Cao cấp'}</span>
          </td>
          <td style="text-align: right; vertical-align: bottom; font-family: Arial, sans-serif;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #2E3A2B;">${isEn ? 'BUSINESS PERFORMANCE REPORT' : 'BÁO CÁO KẾT QUẢ KINH DOANH'}</h3>
            <span style="font-size: 11px; color: #5B6A56;">${isEn ? 'Export Time' : 'Thời gian xuất'}: ${todayStr}</span>
          </td>
        </tr>
      </table>
      
      <!-- KPI Boxes Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-family: Arial, sans-serif;">
        <tr>
          <td style="width: 25%; padding-right: 8px;">
            <div style="background: #F4F9F0; border: 1px solid #D5E8C9; padding: 12px; border-radius: 8px; text-align: center;">
              <span style="font-size: 9px; color: #15803D; font-weight: 700; display: block; margin-bottom: 4px;">${isEn ? 'TOTAL REVENUE' : 'TỔNG DOANH THU'}</span>
              <strong style="font-size: 15px; color: #16A34A;">${fmt(totalSales)}</strong>
            </div>
          </td>
          <td style="width: 25%; padding: 0 4px;">
            <div style="background: #F0F9FF; border: 1px solid #E0F2FE; padding: 12px; border-radius: 8px; text-align: center;">
              <span style="font-size: 9px; color: #0369A1; font-weight: 700; display: block; margin-bottom: 4px;">${isEn ? 'COMPLETED ORDERS' : 'ĐƠN HOÀN THÀNH'}</span>
              <strong style="font-size: 15px; color: #0284C7;">${successfulOrders.length} ${isEn ? 'Orders' : 'Đơn'}</strong>
            </div>
          </td>
          <td style="width: 25%; padding: 0 4px;">
            <div style="background: #FFFBEB; border: 1px solid #FEF3C7; padding: 12px; border-radius: 8px; text-align: center;">
              <span style="font-size: 9px; color: #B45309; font-weight: 700; display: block; margin-bottom: 4px;">${isEn ? 'PROCESSING ORDERS' : 'ĐƠN ĐANG XỬ LÝ'}</span>
              <strong style="font-size: 15px; color: #D97706;">${pendingOrders.length + processingOrders.length} ${isEn ? 'Orders' : 'Đơn'}</strong>
            </div>
          </td>
          <td style="width: 25%; padding-left: 8px;">
            <div style="background: #FEF2F2; border: 1px solid #FEE2E2; padding: 12px; border-radius: 8px; text-align: center;">
              <span style="font-size: 9px; color: #B91C1C; font-weight: 700; display: block; margin-bottom: 4px;">${isEn ? 'CANCELLED ORDERS' : 'ĐƠN ĐÃ HỦY'}</span>
              <strong style="font-size: 15px; color: #DC2626;">${cancelledOrders.length} ${isEn ? 'Orders' : 'Đơn'}</strong>
            </div>
          </td>
        </tr>
      </table>

      <!-- Splits Grid Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-family: Arial, sans-serif;">
        <tr>
          <td style="width: 48%; vertical-align: top;">
            <div style="border: 1px solid #E2DDD5; border-radius: 10px; overflow: hidden;">
              <div style="background: #4D7C2F; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 8px 12px; text-transform: uppercase;">
                ${isEn ? '📍 Revenue Analysis by Region' : '📍 Phân tích Doanh thu theo Vùng'}
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                  <tr style="background: #F0EEE4; border-bottom: 1px solid #E2DDD5;">
                    <th style="padding: 8px; text-align: left; font-weight:700;">${isEn ? 'Product Region' : 'Vùng sản xuất'}</th>
                    <th style="padding: 8px; text-align: right; font-weight:700;">${isEn ? 'Revenue' : 'Doanh thu'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #E2DDD5;">${isEn ? 'Cai Be (Tien Giang)' : 'Cái Bè (Tiền Giang)'}</td><td style="padding: 8px; border-bottom: 1px solid #E2DDD5; text-align: right; font-weight: 700; color: #4D7C2F;">${fmt(salesRegion["Cái Bè"])}</td></tr>
                  <tr style="background: #F8F7F2;"><td style="padding: 8px; border-bottom: 1px solid #E2DDD5;">${isEn ? 'Moc Chau (Son La)' : 'Mộc Châu (Sơn La)'}</td><td style="padding: 8px; border-bottom: 1px solid #E2DDD5; text-align: right; font-weight: 700; color: #4D7C2F;">${fmt(salesRegion["Mộc Châu"])}</td></tr>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #E2DDD5;">${isEn ? 'Tay Nguyen (Dak Lak, Gia Lai)' : 'Tây Nguyên (Đắk Lắk, Gia Lai)'}</td><td style="padding: 8px; border-bottom: 1px solid #E2DDD5; text-align: right; font-weight: 700; color: #4D7C2F;">${fmt(salesRegion["Tây Nguyên"])}</td></tr>
                  <tr style="background: #F8F7F2;"><td style="padding: 8px;">Bến Tre</td><td style="padding: 8px; text-align: right; font-weight: 700; color: #4D7C2F;">${fmt(salesRegion["Bến Tre"])}</td></tr>
                </tbody>
              </table>
            </div>
          </td>
          <td style="width: 4%;"></td>
          <td style="width: 48%; vertical-align: top;">
            <div style="border: 1px solid #E2DDD5; border-radius: 10px; overflow: hidden;">
              <div style="background: #4D7C2F; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 8px 12px; text-transform: uppercase;">
                ${isEn ? '🏷️ Revenue by Category Group' : '🏷️ Doanh thu theo Nhóm sản phẩm'}
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                  <tr style="background: #F0EEE4; border-bottom: 1px solid #E2DDD5;">
                    <th style="padding: 8px; text-align: left; font-weight:700;">${isEn ? 'Category Group' : 'Nhóm sản phẩm'}</th>
                    <th style="padding: 8px; text-align: right; font-weight:700;">${isEn ? 'Revenue' : 'Doanh thu'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="padding: 8px; border-bottom: 1px solid #E2DDD5;">🍎 ${isEn ? 'Fresh Fruits' : 'Trái cây tươi'} (Fruits)</td><td style="padding: 8px; border-bottom: 1px solid #E2DDD5; text-align: right; font-weight: 700; color: #4D7C2F;">${fmt(categorySales["Fruits"] || 0)}</td></tr>
                  <tr style="background: #F8F7F2;"><td style="padding: 8px; border-bottom: 1px solid #E2DDD5;">🌰 ${isEn ? 'Nutritional Seeds' : 'Hạt dinh dưỡng'} (Nutritional Seeds)</td><td style="padding: 8px; border-bottom: 1px solid #E2DDD5; text-align: right; font-weight: 700; color: #4D7C2F;">${fmt(categorySales["Nutritional Seeds"] || 0)}</td></tr>
                  <tr><td style="padding: 8px;">🌾 ${isEn ? 'Healthy Granola' : 'Ngũ cốc Granola sạch'}</td><td style="padding: 8px; text-align: right; font-weight: 700; color: #4D7C2F;">${fmt(categorySales["Granola"] || 0)}</td></tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </table>

      <!-- Ledger Table -->
      <div style="border: 1px solid #E2DDD5; border-radius: 10px; overflow: hidden; margin-bottom: 25px; font-family: Arial, sans-serif;">
        <div style="background: #4D7C2F; color: #FFFFFF; font-weight: 800; font-size: 11px; padding: 8px 12px; text-transform: uppercase;">
          ${isEn ? '📝 Detailed Transaction List' : '📝 Danh sách Giao dịch Chi tiết'}
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background: #F0EEE4; border-bottom: 1px solid #E2DDD5;">
              <th style="padding: 8px; text-align: left; font-weight: 700;">${isEn ? 'Order ID' : 'Mã đơn hàng'}</th>
              <th style="padding: 8px; text-align: left; font-weight: 700;">${isEn ? 'Customer' : 'Khách hàng'}</th>
              <th style="padding: 8px; text-align: left; font-weight: 700;">${isEn ? 'Order Date' : 'Ngày đặt'}</th>
              <th style="padding: 8px; text-align: left; font-weight: 700;">${isEn ? 'Payment' : 'Thanh toán'}</th>
              <th style="padding: 8px; text-align: right; font-weight: 700;">${isEn ? 'Total' : 'Tổng cộng'}</th>
              <th style="padding: 8px; text-align: center; font-weight: 700;">${isEn ? 'Status' : 'Trạng thái'}</th>
            </tr>
          </thead>
          <tbody>
            ${txRows}
          </tbody>
        </table>
      </div>

      <!-- Signature Section Table -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 35px; padding: 0 15px; font-size: 11px; font-family: Arial, sans-serif;">
        <tr>
          <td style="text-align: center; width: 45%; vertical-align: top;">
            <strong>${isEn ? 'Prepared By' : 'Người lập báo cáo'}</strong><br>
            <span style="font-size: 9px; color: #5B6A56;">${isEn ? '(Signature & Full Name)' : '(Ký & ghi rõ họ tên)'}</span>
            <div style="height: 45px;"></div>
            <span style="font-weight: 700;">${isEn ? 'Automated System' : 'Hệ thống tự động'}</span>
          </td>
          <td style="width: 10%;"></td>
          <td style="text-align: center; width: 45%; vertical-align: top;">
            <strong>${isEn ? "Director's Approval" : 'Phê duyệt của Giám đốc'}</strong><br>
            <span style="font-size: 9px; color: #5B6A56;">${isEn ? '(Signature & Stamp)' : '(Ký tên & đóng dấu)'}</span>
            <div style="height: 45px;"></div>
            <strong style="color: #4D7C2F; font-size: 12px;">TỨ QUÝ GARDEN</strong>
          </td>
        </tr>
      </table>

      <div style="text-align: center; font-size: 9px; color: #5B6A56; margin-top: 35px; border-top: 1px dashed #E2DDD5; padding-top: 10px; font-family: Arial, sans-serif;">
        ${isEn ? 'Internal document of Tứ Quý Garden © 2026.' : 'Tài liệu lưu hành nội bộ của Tứ Quý Garden © 2026.'}
      </div>
    </div>
  `;

  const opt = {
    margin:       0.3,
    filename:     isEn ? 'Tu_Quy_Garden_Business_Report.pdf' : 'Bao_Cao_Doanh_Thu_Tu_Quy_Garden.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(reportHTML).set(opt).save().then(() => {
    window.showToast(isEn ? "PDF report successfully downloaded!" : "Đã tải xuống báo cáo PDF thành công!", "success");
  }).catch(err => {
    console.error("PDF generation error:", err);
    window.showToast(isEn ? "Error generating PDF!" : "Lỗi khi xuất báo cáo PDF!", "error");
  });
}

// FEATURE PLACEHOLDER ALERT
window.showFeatureAlert = function(event) {
  if (event) event.preventDefault();
  window.showToast("Feature under development!", "info");
};


/* ==========================================================================
   ADMIN PRODUCTS (CRUD) SECTION
   ========================================================================== */
let productSearchQuery = "";
let productCategoryFilter = "all";
let productStockFilter = "all";

function initAdminProducts() {
  if (typeof fetch === 'function') {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          window.MOCK_PRODUCTS = data;
          localStorage.setItem("tqg_products", JSON.stringify(data));
        }
        renderProductsList();
      })
      .catch(() => renderProductsList());
  } else {
    renderProductsList();
  }

  // Auto-open Add Product modal if action=add is in the query params
  if (window.getUrlParam && window.getUrlParam("action") === "add") {
    // Clean parameter to avoid double triggering on reload
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    setTimeout(() => {
      if (window.openAddProductModal) window.openAddProductModal();
    }, 200);
  }
}

window.filterProductsByStock = function(state) {
  productStockFilter = state;
  
  // Highlight selected card visually
  const cards = [
    { id: "stats-total-products", name: "all" },
    { id: "stats-instock-products", name: "instock" },
    { id: "stats-lowstock-products", name: "lowstock" },
    { id: "stats-outofstock-products", name: "outofstock" }
  ];
  cards.forEach(c => {
    const cardEl = document.getElementById(c.id)?.parentElement;
    if (cardEl) {
      if (c.name === state) {
        cardEl.style.boxShadow = "var(--admin-shadow-hover)";
        cardEl.style.borderColor = "var(--color-primary)";
        cardEl.style.backgroundColor = "var(--color-white)";
      } else {
        cardEl.style.boxShadow = "";
        cardEl.style.borderColor = "";
        cardEl.style.backgroundColor = "";
      }
    }
  });

  renderProductsList();
};

function renderProductsList() {
  const tbody = document.getElementById("inventory-table-body");
  const countTxt = document.getElementById("inventory-total-txt");
  if (!tbody) return;

  const allProds = window.MOCK_PRODUCTS || [];
  let products = [...allProds];

  // Update live stats summary strip
  const statTotal = document.getElementById("stats-total-products");
  const statInStock = document.getElementById("stats-instock-products");
  const statLowStock = document.getElementById("stats-lowstock-products");
  const statOutOfStock = document.getElementById("stats-outofstock-products");

  if (statTotal) statTotal.innerText = allProds.length;
  if (statInStock) statInStock.innerText = allProds.filter(p => p.stock >= 15).length;
  if (statLowStock) statLowStock.innerText = allProds.filter(p => p.stock > 0 && p.stock < 15).length;
  if (statOutOfStock) statOutOfStock.innerText = allProds.filter(p => p.stock === 0).length;

  // Apply search filtering
  if (productSearchQuery) {
    const q = productSearchQuery.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q));
  }

  // Apply category filtering
  if (productCategoryFilter !== "all") {
    products = products.filter(p => p.category === productCategoryFilter);
  }

  // Apply stock status filtering
  if (productStockFilter === "instock") {
    products = products.filter(p => p.stock >= 15);
  } else if (productStockFilter === "lowstock") {
    products = products.filter(p => p.stock > 0 && p.stock < 15);
  } else if (productStockFilter === "outofstock") {
    products = products.filter(p => p.stock === 0);
  }

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px 0; color:var(--color-text-light);">No products found matching the filters.</td></tr>`;
    if (countTxt) countTxt.innerText = "Showing 0 products";
    return;
  }

  const currentLang = localStorage.getItem("tqg_lang") || "en";

  tbody.innerHTML = products.map(p => {
    // Determine stock status badges
    let stockBadgeClass = "badge-instock";
    let stockBadgeText = "In Stock";
    if (p.stock === 0) {
      stockBadgeClass = "badge-outofstock";
      stockBadgeText = "Out Of Stock";
    } else if (p.stock < 15) {
      stockBadgeClass = "badge-lowstock";
      stockBadgeText = "Low Stock";
    }

    return `
      <tr id="prod-row-${p.id}">
        <td>#${p.id}</td>
        <td>
          <img src="${p.image}" alt="" class="prod-thumb" onerror="this.onerror=null; this.src='https://placehold.co/100x100?text=Fruit'">
        </td>
        <td>
          <strong>${p.nameEn || p.name}</strong><br>
          <span style="font-size:11px; color:var(--color-text-light);">${p.name}</span>
        </td>
        <td style="font-weight:500;">${translateCategoryName(p.category)}</td>
        <td style="font-weight:700; color:var(--color-primary);">${window.formatVND ? window.formatVND(p.price) : p.price + 'đ'}</td>
        <td style="text-align: center;">
          <span class="status-badge ${stockBadgeClass}">${stockBadgeText} (${p.stock})</span>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="action-btn btn-edit" onclick="openEditProductModal(${p.id})">Edit</button>
            <button class="action-btn btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  if (countTxt) {
    countTxt.innerText = `Showing ${products.length} of ${window.MOCK_PRODUCTS.length} products`;
  }
}

function translateCategoryName(cat) {
  const trans = {
    "Fruits": "Fruits",
    "Nutritional Seeds": "Nutritional Seeds",
    "Granola": "Granola",
    "Combo Healthy": "Combo Healthy"
  };
  return trans[cat] || cat;
}

window.handleInventorySearch = function(val) {
  productSearchQuery = val.trim();
  renderProductsList();
};

window.handleInventoryCategoryFilter = function(val) {
  productCategoryFilter = val;
  renderProductsList();
};

// OPEN ADD PRODUCT MODAL
window.openAddProductModal = function() {
  const formHTML = `
    <div class="admin-modal-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-primary);"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      <span>Add New Product</span>
    </div>
    <form id="add-product-form" onsubmit="saveNewProduct(event)">
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Product Name (Vietnamese) *</label>
          <input type="text" id="add-p-name-vi" class="admin-form-input" required placeholder="e.g., Dưa lưới Huỳnh Long">
        </div>
        <div class="admin-form-group">
          <label>Product Name (English) *</label>
          <input type="text" id="add-p-name-en" class="admin-form-input" required placeholder="e.g., Huynh Long Cantaloupe">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Category *</label>
          <select id="add-p-category" class="admin-form-select">
            <option value="Fruits">Fresh Fruits</option>
            <option value="Nutritional Seeds">Nutritional Seeds</option>
            <option value="Granola">Granola</option>
            <option value="Combo Healthy">Combo Healthy</option>
          </select>
        </div>
        <div class="admin-form-group">
          <label>Origin / Region *</label>
          <input type="text" id="add-p-region" class="admin-form-input" required placeholder="e.g., Dong Thap, Vietnam">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Price (VND) *</label>
          <input type="number" id="add-p-price" class="admin-form-input" required placeholder="85000">
        </div>
        <div class="admin-form-group">
          <label>Old Price (Optional)</label>
          <input type="number" id="add-p-oldprice" class="admin-form-input" placeholder="105000">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Stock Qty *</label>
          <input type="number" id="add-p-stock" class="admin-form-input" required placeholder="50">
        </div>
        <div class="admin-form-group">
          <label>Image File Path *</label>
          <input type="text" id="add-p-image" class="admin-form-input" required value="images/fruits/Mận.png" placeholder="images/fruits/fileName.png">
        </div>
      </div>

      <div class="admin-checkbox-row">
        <label class="admin-checkbox-label">
          <input type="checkbox" id="add-p-seasonal">
          <span>Seasonal Product</span>
        </label>
        <label class="admin-checkbox-label">
          <input type="checkbox" id="add-p-bestseller">
          <span>Bestseller Product</span>
        </label>
      </div>

      <div class="admin-form-group">
        <label>Detailed Description *</label>
        <textarea id="add-p-description" rows="3" class="admin-form-textarea" required placeholder="Huynh Long Cantaloupe grown with high technology, crispy gold flesh, sweet taste..."></textarea>
      </div>

      <div class="admin-modal-actions">
        <button type="button" class="admin-btn admin-btn-outline" onclick="window.closeCustomModal()">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Save Product</button>
      </div>
    </form>
  `;
  window.showCustomModal(formHTML);
};


// SAVE NEW PRODUCT
window.saveNewProduct = function(e) {
  e.preventDefault();

  const nameVi = document.getElementById("add-p-name-vi").value.trim();
  const nameEn = document.getElementById("add-p-name-en").value.trim();
  const category = document.getElementById("add-p-category").value;
  const region = document.getElementById("add-p-region").value.trim();
  const price = parseInt(document.getElementById("add-p-price").value);
  const oldPriceVal = document.getElementById("add-p-oldprice").value;
  const oldPrice = oldPriceVal ? parseInt(oldPriceVal) : null;
  const stock = parseInt(document.getElementById("add-p-stock").value);
  const image = document.getElementById("add-p-image").value.trim();
  const isSeasonal = document.getElementById("add-p-seasonal").checked;
  const isBestSeller = document.getElementById("add-p-bestseller").checked;
  const descriptionVi = document.getElementById("add-p-description").value.trim();

  // Create new product
  const nextId = window.MOCK_PRODUCTS.reduce((max, p) => p.id > max ? p.id : max, 0) + 1;

  const newProd = {
    id: nextId,
    name: nameVi,
    nameEn: nameEn,
    category,
    region,
    price,
    oldPrice,
    stock,
    image,
    isSeasonal,
    isBestSeller,
    rating: 4.8, // Default rating
    description: descriptionVi,
    storageVi: "Store in refrigerator cooler from 4°C - 8°C.",
    storageEn: "Keep refrigerated between 4°C - 8°C.",
    nutrition: {
      calories: "45 kcal",
      sugar: "9.8g",
      vitaminC: "15%",
      potassium: "5%"
    }
  };

  window.MOCK_PRODUCTS.push(newProd);
  localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
  if (typeof fetch === 'function') {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProd)
    }).then(r => r.json()).catch(err => console.warn('[Admin] Sync product to MongoDB notice:', err));
  }
  window.closeCustomModal();
  window.showToast("Product added successfully!", "success");
  renderProductsList();
};

// OPEN EDIT PRODUCT MODAL
window.openEditProductModal = function(id) {
  const p = window.MOCK_PRODUCTS.find(prod => prod.id === id);
  if (!p) return;

  const formHTML = `
    <div class="admin-modal-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-primary);"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      <span>Edit Product Details #${p.id}</span>
    </div>
    <form id="edit-product-form" onsubmit="saveEditedProduct(event, ${p.id})">
      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Product Name (Vietnamese) *</label>
          <input type="text" id="edit-p-name-vi" class="admin-form-input" required value="${p.name}">
        </div>
        <div class="admin-form-group">
          <label>Product Name (English) *</label>
          <input type="text" id="edit-p-name-en" class="admin-form-input" required value="${p.nameEn || p.name}">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Category *</label>
          <select id="edit-p-category" class="admin-form-select">
            <option value="Fruits" ${p.category === "Fruits" ? "selected" : ""}>Fresh Fruits</option>
            <option value="Nutritional Seeds" ${p.category === "Nutritional Seeds" ? "selected" : ""}>Nutritional Seeds</option>
            <option value="Granola" ${p.category === "Granola" ? "selected" : ""}>Granola</option>
            <option value="Combo Healthy" ${p.category === "Combo Healthy" ? "selected" : ""}>Combo Healthy</option>
          </select>
        </div>
        <div class="admin-form-group">
          <label>Origin / Region *</label>
          <input type="text" id="edit-p-region" class="admin-form-input" required value="${p.region}">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Price (VND) *</label>
          <input type="number" id="edit-p-price" class="admin-form-input" required value="${p.price}">
        </div>
        <div class="admin-form-group">
          <label>Old Price (Optional)</label>
          <input type="number" id="edit-p-oldprice" class="admin-form-input" value="${p.oldPrice || ""}">
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label>Stock Qty *</label>
          <input type="number" id="edit-p-stock" class="admin-form-input" required value="${p.stock}">
        </div>
        <div class="admin-form-group">
          <label>Image File Path *</label>
          <input type="text" id="edit-p-image" class="admin-form-input" required value="${p.image}">
        </div>
      </div>

      <div class="admin-checkbox-row">
        <label class="admin-checkbox-label">
          <input type="checkbox" id="edit-p-seasonal" ${p.isSeasonal ? "checked" : ""}>
          <span>Seasonal Product</span>
        </label>
        <label class="admin-checkbox-label">
          <input type="checkbox" id="edit-p-bestseller" ${p.isBestSeller ? "checked" : ""}>
          <span>Bestseller Product</span>
        </label>
      </div>

      <div class="admin-form-group">
        <label>Detailed Description *</label>
        <textarea id="edit-p-description" rows="3" class="admin-form-textarea" required>${p.description || ""}</textarea>
      </div>

      <div class="admin-modal-actions">
        <button type="button" class="admin-btn admin-btn-outline" onclick="window.closeCustomModal()">Cancel</button>
        <button type="submit" class="admin-btn admin-btn-primary">Update Product</button>
      </div>
    </form>
  `;
  window.showCustomModal(formHTML);
};


// SAVE EDITED PRODUCT
window.saveEditedProduct = function(e, id) {
  e.preventDefault();

  const idx = window.MOCK_PRODUCTS.findIndex(prod => prod.id === id);
  if (idx === -1) return;

  const nameVi = document.getElementById("edit-p-name-vi").value.trim();
  const nameEn = document.getElementById("edit-p-name-en").value.trim();
  const category = document.getElementById("edit-p-category").value;
  const region = document.getElementById("edit-p-region").value.trim();
  const price = parseInt(document.getElementById("edit-p-price").value);
  const oldPriceVal = document.getElementById("edit-p-oldprice").value;
  const oldPrice = oldPriceVal ? parseInt(oldPriceVal) : null;
  const stock = parseInt(document.getElementById("edit-p-stock").value);
  const image = document.getElementById("edit-p-image").value.trim();
  const isSeasonal = document.getElementById("edit-p-seasonal").checked;
  const isBestSeller = document.getElementById("edit-p-bestseller").checked;
  const descriptionVi = document.getElementById("edit-p-description").value.trim();

  // Update object
  window.MOCK_PRODUCTS[idx].name = nameVi;
  window.MOCK_PRODUCTS[idx].nameEn = nameEn;
  window.MOCK_PRODUCTS[idx].category = category;
  window.MOCK_PRODUCTS[idx].region = region;
  window.MOCK_PRODUCTS[idx].price = price;
  window.MOCK_PRODUCTS[idx].oldPrice = oldPrice;
  window.MOCK_PRODUCTS[idx].stock = stock;
  window.MOCK_PRODUCTS[idx].image = image;
  window.MOCK_PRODUCTS[idx].isSeasonal = isSeasonal;
  window.MOCK_PRODUCTS[idx].isBestSeller = isBestSeller;
  window.MOCK_PRODUCTS[idx].description = descriptionVi;

  localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
  if (typeof fetch === 'function') {
    fetch('/api/products/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(window.MOCK_PRODUCTS[idx])
    }).then(r => r.json()).catch(err => console.warn('[Admin] Update product on MongoDB notice:', err));
  }
  window.closeCustomModal();
  window.showToast("Product updated successfully!", "success");
  renderProductsList();
};

// DELETE PRODUCT
window.deleteProduct = function(id) {
  const p = window.MOCK_PRODUCTS.find(prod => prod.id === id);
  if (!p) return;

  window.showConfirmModal(`Are you sure you want to delete product "${p.name}"? This action cannot be undone.`, () => {
    window.MOCK_PRODUCTS = window.MOCK_PRODUCTS.filter(prod => prod.id !== id);
    localStorage.setItem("tqg_products", JSON.stringify(window.MOCK_PRODUCTS));
    if (typeof fetch === 'function') {
      fetch('/api/products/' + id, {
        method: 'DELETE'
      }).then(r => r.json()).catch(err => console.warn('[Admin] Delete product from MongoDB notice:', err));
    }
    window.showToast("Product removed from catalog.", "success");
    renderProductsList();
  });
};


/* ==========================================================================
   ADMIN ORDERS SECTION
   ========================================================================== */
let orderSearchQuery = "";
let orderStatusFilter = "all";

function initAdminOrders() {
  const filterParam = window.getUrlParam ? window.getUrlParam("filter") : null;
  if (filterParam) {
    orderStatusFilter = filterParam;
    
    // Update active tab styles
    const statuses = ["all", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy", "refund-requests", "Trả hàng/Hoàn tiền"];
    const ids = ["all", "pending", "processing", "shipping", "completed", "cancelled", "refund-requests", "refunded"];
    
    statuses.forEach((s, idx) => {
      const tabEl = document.getElementById(`tab-status-${ids[idx]}`);
      if (tabEl) {
        if (s === filterParam) tabEl.classList.add("active");
        else tabEl.classList.remove("active");
      }
    });
  }
  renderOrdersList();
}

function renderOrdersList() {
  const tbody = document.getElementById("orders-table-body");
  const countTxt = document.getElementById("orders-total-txt");
  if (!tbody) return;

  if (!window.OrderService) return;
  const allOrders = window.OrderService.getOrders();
  let orders = [...allOrders];

  // Update live summary stats
  const kpiTotal = document.getElementById("kpi-orders-total");
  const kpiPending = document.getElementById("kpi-orders-pending");
  const kpiProcessing = document.getElementById("kpi-orders-processing");
  const kpiCompleted = document.getElementById("kpi-orders-completed");

  if (kpiTotal) kpiTotal.innerText = allOrders.length;
  if (kpiPending) kpiPending.innerText = allOrders.filter(o => o.status === "Chờ xác nhận").length;
  if (kpiProcessing) kpiProcessing.innerText = allOrders.filter(o => o.status === "Đang xử lý" || o.status === "Đang giao").length;
  if (kpiCompleted) kpiCompleted.innerText = allOrders.filter(o => o.status === "Hoàn thành").length;
  
  const kpiRefundRequests = document.getElementById("kpi-orders-refund-requests");
  if (kpiRefundRequests) kpiRefundRequests.innerText = allOrders.filter(o => o.refundRequest && o.refundRequest.status === "pending").length;

  // Apply search query (ID, customer name, or ordered item name)
  if (orderSearchQuery) {
    const q = orderSearchQuery.toLowerCase();
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.customerName.toLowerCase().includes(q) ||
      o.items.some(item => item.name.toLowerCase().includes(q))
    );
  }

  // Apply status filter
  if (orderStatusFilter === "refund-requests") {
    orders = orders.filter(o => o.refundRequest && o.refundRequest.status === "pending");
  } else if (orderStatusFilter !== "all") {
    orders = orders.filter(o => o.status === orderStatusFilter);
  }

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px 0; color:var(--color-text-light);">No orders found.</td></tr>`;
    if (countTxt) countTxt.innerText = "Showing 0 orders";
    return;
  }

  tbody.innerHTML = orders.map(o => {
    // Select status select tag background
    let statusClass = "status-cho-xac-nhan";
    if (o.status === "Đang xử lý") statusClass = "status-dang-xu-ly";
    if (o.status === "Đang giao") statusClass = "status-dang-giao";
    if (o.status === "Hoàn thành") statusClass = "status-hoan-thanh";
    if (o.status === "Đã hủy") statusClass = "status-da-huy";
    if (o.status === "Trả hàng/Hoàn tiền") statusClass = "status-tra-hang-hoan-tien";

    const dateText = new Date(o.date).toLocaleString("en-US");
    
    let refundBadge = "";
    if (o.refundRequest && o.refundRequest.status === "pending") {
      const isEn = document.body.classList.contains("lang-en");
      refundBadge = `
        <br><span style="display:inline-block; font-size:10px; font-weight:700; background-color:#fff3cd; color:#856404; border:1px solid #ffeeba; padding:2px 6px; border-radius:4px; margin-top:4px;">
          ⚠️ ${isEn ? "Refund Req" : "Yêu cầu hoàn trả"}
        </span>
      `;
    }

    return `
      <tr>
        <td><strong>#${o.id}</strong>${refundBadge}</td>
        <td>
          <strong>${o.customerName}</strong><br>
          <span style="font-size:11px; color:var(--color-text-light);">${o.customerPhone}</span>
        </td>
        <td>${dateText}</td>
        <td>💵 ${translatePaymentMethod(o.paymentMethod)}</td>
        <td style="font-weight:700; color:var(--color-primary);">${window.formatVND ? window.formatVND(o.total) : o.total.toLocaleString() + 'đ'}</td>
        <td>
          <select class="status-select ${statusClass}" onchange="changeOrderStatus('${o.id}', this.value)">
            <option value="Chờ xác nhận" ${o.status === "Chờ xác nhận" ? "selected" : ""}>Pending</option>
            <option value="Đang xử lý" ${o.status === "Đang xử lý" ? "selected" : ""}>Processing</option>
            <option value="Đang giao" ${o.status === "Đang giao" ? "selected" : ""}>Shipping</option>
            <option value="Hoàn thành" ${o.status === "Hoàn thành" ? "selected" : ""}>Completed</option>
            <option value="Đã hủy" ${o.status === "Đã hủy" ? "selected" : ""}>Cancelled</option>
            <option value="Trả hàng/Hoàn tiền" ${o.status === "Trả hàng/Hoàn tiền" ? "selected" : ""}>Refunded</option>
          </select>
        </td>
        <td style="text-align: center;">
          <button class="action-btn btn-edit" onclick="openOrderDetailsModal('${o.id}')">Details</button>
        </td>
      </tr>
    `;
  }).join("");

  if (countTxt) {
    countTxt.innerText = `Showing ${orders.length} orders`;
  }
}

function translatePaymentMethod(p) {
  const trans = {
    "COD": "COD",
    "E-wallet": "E-Wallet",
    "Bank transfer": "Bank Transfer"
  };
  return trans[p] || p;
}

window.handleOrdersSearch = function(val) {
  orderSearchQuery = val.trim();
  renderOrdersList();
};

window.filterOrdersByStatus = function(val) {
  orderStatusFilter = val;
  
  // Update active tab styles
  const statuses = ["all", "Chờ xác nhận", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy", "refund-requests", "Trả hàng/Hoàn tiền"];
  const ids = ["all", "pending", "processing", "shipping", "completed", "cancelled", "refund-requests", "refunded"];
  
  statuses.forEach((s, idx) => {
    const tabEl = document.getElementById(`tab-status-${ids[idx]}`);
    if (tabEl) {
      if (s === val) tabEl.classList.add("active");
      else tabEl.classList.remove("active");
    }
  });

  renderOrdersList();
};

// CHANGE ORDER STATUS IN SELECT
window.changeOrderStatus = function(id, newStatus) {
  if (!window.OrderService) return;

  const result = window.OrderService.updateOrderStatus(id, newStatus);
  if (result.success) {
    window.showToast(result.message, "success");
    renderOrdersList();
  } else {
    window.showToast(result.message, "error");
  }
};

// VIEW DETAILED ORDER MODAL
window.openOrderDetailsModal = function(id) {
  if (!window.OrderService) return;
  const o = window.OrderService.getOrderById(id);
  if (!o) return;

  const itemsHTML = o.items.map(item => `
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #E2DDD5; padding:12px 0; font-size:13px;">
      <div style="display:flex; gap:12px; align-items:center;">
        <img src="${item.image}" alt="" style="width:45px; height:45px; object-fit:contain; border:1px solid #E2DDD5; border-radius:6px; background:white; padding:2px;">
        <div>
          <strong style="color:#2E3A2B; font-size:13.5px;">${item.name}</strong><br>
          <span style="font-size:11px; color:#5B6A56; font-weight: 500;">${window.formatVND ? window.formatVND(item.price) : item.price + 'đ'} &times; ${item.quantity}</span>
        </div>
      </div>
      <strong style="color:#2E3A2B;">${window.formatVND ? window.formatVND(item.price * item.quantity) : (item.price * item.quantity) + 'đ'}</strong>
    </div>
  `).join("");

  // Generate refund warning block if request metadata exists
  let refundRequestHTML = "";
  if (o.refundRequest) {
    const isEn = document.body.classList.contains("lang-en");
    const reasonMap = {
      "wrong-product": isEn ? "Wrong product received" : "Nhận sai sản phẩm",
      "damaged": isEn ? "Product damaged / expired" : "Sản phẩm bị hỏng / hết hạn",
      "not-as-described": isEn ? "Not as described" : "Không đúng mô tả",
      "changed-mind": isEn ? "Changed mind" : "Thay đổi ý định",
      "other": isEn ? "Other" : "Lý do khác"
    };
    const friendlyReason = reasonMap[o.refundRequest.reason] || o.refundRequest.reason;
    const requestStatus = o.refundRequest.status === "pending" 
      ? (isEn ? "Pending Review" : "Đang chờ duyệt")
      : o.refundRequest.status === "approved"
        ? (isEn ? "Approved" : "Đã chấp nhận hoàn trả")
        : (isEn ? "Rejected" : "Đã từ chối");
        
    let statusColor = "#d97706"; // amber
    if (o.refundRequest.status === "approved") statusColor = "#15803d"; // green
    if (o.refundRequest.status === "rejected") statusColor = "#b91c1c"; // red
    
    let actionButtons = "";
    if (o.refundRequest.status === "pending") {
      actionButtons = `
        <div style="margin-top:15px; display:flex; gap:10px;">
          <button onclick="handleRefundDecision('${o.id}', 'approved')" style="background:linear-gradient(135deg,#16a34a,#15803d); border:none; color:white; font-size:12px; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer; box-shadow:0 3px 8px rgba(22,163,74,0.2);">
            ${isEn ? "✓ Approve Refund" : "✓ Chấp nhận hoàn tiền"}
          </button>
          <button onclick="handleRefundDecision('${o.id}', 'rejected')" style="background:linear-gradient(135deg,#dc2626,#b91c1c); border:none; color:white; font-size:12px; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer; box-shadow:0 3px 8px rgba(220,38,38,0.2);">
            ${isEn ? "✗ Reject Request" : "✗ Từ chối yêu cầu"}
          </button>
        </div>
      `;
    }

    refundRequestHTML = `
      <div style="margin-bottom:20px; font-size:12.5px; line-height:1.6; background-color:rgba(220,38,38,0.03); padding:16px; border-radius:12px; border:1px solid rgba(220,38,38,0.12);">
        <h4 style="margin:0 0 10px 0; font-size:14px; color:#b91c1c; font-weight:800; border-bottom:1px solid rgba(220,38,38,0.12); padding-bottom:6px; display:flex; align-items:center; gap:6px;">
          <span>🚨</span> ${isEn ? "Return & Refund Request Info" : "Thông tin yêu cầu hoàn trả"}
        </h4>
        <div style="display:grid; grid-template-columns: 110px 1fr; gap:6px 12px; color:#2e3a2b;">
          <strong>${isEn ? "Status:" : "Trạng thái:"}</strong>
          <span style="font-weight:700; color:${statusColor};">${requestStatus}</span>
          
          <strong>${isEn ? "Reason:" : "Lý do:"}</strong>
          <span>${friendlyReason}</span>
          
          <strong>${isEn ? "Cust. Notes:" : "Khách ghi chú:"}</strong>
          <span style="font-style:italic; color:#5b6a56;">"${o.refundRequest.note || (isEn ? 'No notes' : 'Không có ghi chú')}"</span>
          
          <strong>${isEn ? "Time:" : "Thời gian yêu cầu:"}</strong>
          <span>${new Date(o.refundRequest.requestedAt).toLocaleString(isEn ? 'en-US' : 'vi-VN')}</span>
        </div>
        ${actionButtons}
      </div>
    `;
  }

  const detailsHTML = `
    <div style="border-bottom: 2px solid #F0EEE4; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <h3 style="font-size:20px; font-weight: 800; color:#4D7C2F; margin: 0;">Đơn hàng #${o.id}</h3>
      <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; background-color: #F0EEE4; color: #5B6A56;">
        ${new Date(o.date).toLocaleDateString()}
      </span>
    </div>
    <div style="max-height: 480px; overflow-y: auto; padding-right:8px;">
      
      ${refundRequestHTML}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div style="font-size:12.5px; line-height:1.6; background-color:rgba(77, 124, 47, 0.04); padding:16px; border-radius:12px; border:1px solid rgba(77, 124, 47, 0.1);">
          <h4 style="margin:0 0 10px 0; font-size:13px; color:#2E3A2B; font-weight: 800; border-bottom:1px solid rgba(77, 124, 47, 0.1); padding-bottom:6px;">Recipient Details</h4>
          <strong>Recipient:</strong> ${o.customerName}<br>
          <strong>Phone:</strong> ${o.customerPhone}<br>
          <strong>Email:</strong> ${o.customerEmail || 'Empty'}<br>
          <strong>Address:</strong> ${o.address}
        </div>
        <div style="font-size:12.5px; line-height:1.6; background-color:rgba(244, 185, 66, 0.04); padding:16px; border-radius:12px; border:1px solid rgba(244, 185, 66, 0.15);">
          <h4 style="margin:0 0 10px 0; font-size:13px; color:#2E3A2B; font-weight: 800; border-bottom:1px solid rgba(244, 185, 66, 0.15); padding-bottom:6px;">Payment Details</h4>
          <strong>Method:</strong> 💵 ${translatePaymentMethod(o.paymentMethod)}<br>
          <strong>Status:</strong> <span style="font-weight:700; color:#4D7C2F;">${o.status}</span><br>
          <strong>Notes:</strong> <span style="font-style: italic; color: #5B6A56;">"${o.note || 'No notes'}"</span>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 10px 0; font-size:14px; color:#2E3A2B; font-weight: 800; border-bottom:1px solid #E2DDD5; padding-bottom:6px;">Ordered Products</h4>
        ${itemsHTML}
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; font-size:13px; background-color: #FAF9F6; padding: 16px; border-radius: 12px; border: 1px solid #E2DDD5;">
        <div style="display:flex; justify-content:space-between; color: #5B6A56;">
          <span>Subtotal:</span>
          <span style="font-weight: 600;">${window.formatVND ? window.formatVND(o.subtotal) : o.subtotal + 'đ'}</span>
        </div>
        <div style="display:flex; justify-content:space-between; color: #5B6A56;">
          <span>Shipping:</span>
          <span style="font-weight: 600;">${o.shipping === 0 ? "Freeship" : (window.formatVND ? window.formatVND(o.shipping) : o.shipping + 'đ')}</span>
        </div>
        ${o.discount > 0 ? `
        <div style="display:flex; justify-content:space-between; color:#4D7C2F; font-weight:700;">
          <span>Discount:</span>
          <span>-${window.formatVND ? window.formatVND(o.discount) : o.discount + 'đ'}</span>
        </div>` : ""}
        <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:800; color:#4D7C2F; margin-top:8px; border-top:1px dashed #E2DDD5; padding-top:10px;">
          <span>Total payment:</span>
          <span>${window.formatVND ? window.formatVND(o.total) : o.total + 'đ'}</span>
        </div>
      </div>
    </div>
    <div style="display:flex; justify-content: flex-end; gap:10px; margin-top:20px; border-top:1px solid #E2DDD5; padding-top:15px;">
      <button class="btn btn-primary" onclick="window.closeCustomModal()" style="border-radius: 8px; font-size: 13.5px; font-weight: 700; padding: 8px 20px;">Close Window</button>
    </div>
  `;

  window.showCustomModal(detailsHTML);
};

// Global handler for refund decisions (approved / rejected)
window.handleRefundDecision = function(orderId, decision) {
  if (!window.OrderService) return;
  const orders = window.OrderService.getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return;

  const isEn = document.body.classList.contains("lang-en");
  orders[idx].refundRequest.status = decision;
  
  if (decision === "approved") {
    orders[idx].status = "Trả hàng/Hoàn tiền";
  } else if (decision === "rejected") {
    orders[idx].status = "Hoàn thành";
  }

  window.OrderService.saveOrders(orders);
  window.closeCustomModal();
  
  const msg = decision === "approved"
    ? (isEn ? "Refund request approved." : "Đã duyệt yêu cầu trả hàng / hoàn tiền.")
    : (isEn ? "Refund request rejected." : "Đã từ chối yêu cầu trả hàng / hoàn tiền.");
  window.showToast(msg, "success");
  
  if (typeof renderOrdersList === "function") {
    renderOrdersList();
  }
};

// ==========================================================================
// SPA IN-PANEL TAB RENDER SYSTEM
// ==========================================================================

// Highlight Active Sidebar Tab
window.highlightSidebarMenu = function(tabName) {
  document.querySelectorAll(".admin-menu-item").forEach(item => {
    item.classList.remove("active");
  });
  
  let selector = "";
  if (tabName === 'dashboard') selector = 'a[href="admin-dashboard.html"]';
  else if (tabName === 'products-crud' || tabName === 'products') selector = 'a[href="admin-products.html"]';
  else if (tabName === 'orders-crud') selector = 'a[href="admin-orders.html"]';
  else if (tabName === 'customers') selector = 'a[onclick*="showAdminCustomersModal"]';
  else if (tabName === 'categories') selector = 'a[onclick*="showAdminCategoriesModal"]';
  else if (tabName === 'promotions') selector = 'a[onclick*="showAdminPromotionsModal"]';
  else if (tabName === 'reports') selector = 'a[onclick*="showAdminReportsModal"]';
  else if (tabName === 'settings') selector = 'a[onclick*="showAdminSettingsModal"]';
  
  if (selector) {
    const el = document.querySelector(selector);
    if (el) el.classList.add("active");
  }
};

// 1. PRODUCTS ANALYTICS TAB
window.showAdminProductsModal = function(e) {
  if (e) e.preventDefault();
  window.highlightSidebarMenu('products');
  const products = window.MOCK_PRODUCTS || [];
  const totalItems = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 15).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const fmt = val => window.formatVND ? window.formatVND(val) : val.toLocaleString() + "đ";

  // Category counts
  const categories = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });

  const categoriesHTML = Object.entries(categories).map(([cat, count]) => `
    <div onclick="window.filterProductsByModalCategory('${cat}', event)" class="category-filter-pill" style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13.5px; font-weight:600; padding:10px 14px; border-radius:8px; background:var(--color-cream); cursor:pointer; transition:all 0.2s; color:var(--color-text-dark); border: 1px solid var(--color-gray-border);">
      <span>📂 ${cat}</span>
      <span style="background:var(--color-primary); color:white; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700;">${count} SP</span>
    </div>
  `).join("") + `
    <div onclick="window.filterProductsByModalCategory('all', event)" class="category-filter-pill" id="cat-filter-all" style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:13.5px; font-weight:600; padding:10px 14px; border-radius:8px; background:var(--color-primary); color:#FFFFFF; cursor:pointer; transition:all 0.2s; border: 1px solid var(--color-primary);">
      <span>🌐 All Regions</span>
      <span style="background:#5B6A56; color:white; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:700;">${totalItems} SP</span>
    </div>
  `;

  const rowsHTML = products.map(p => `
    <tr style="border-bottom: 1px solid var(--color-gray-border);">
      <td style="padding:12px 14px; text-align:center;"><img src="${p.image}" style="width:36px; height:36px; object-fit:contain; border-radius:6px; border:1px solid var(--color-gray-border); background:white; padding:2px;"></td>
      <td style="padding:12px 14px;"><strong>${p.name}</strong><br><span style="font-size:11.5px; color:var(--color-text-light);">${p.origin}</span></td>
      <td style="padding:12px 14px; color:var(--color-text-light); font-weight:600;">${p.category}</td>
      <td style="padding:12px 14px; font-weight:700; color:var(--color-primary);">${fmt(p.price)}</td>
      <td style="padding:12px 14px; font-weight:700; text-align:center; color:${p.stock === 0 ? 'red' : (p.stock < 15 ? 'orange' : 'var(--color-text-dark)')};">${p.stock}</td>
    </tr>
  `).join("");

  const content = `
    <div style="border-bottom: 2px solid #F0EEE4; padding-bottom: 15px; margin-bottom: 25px;">
      <h2 style="font-size:24px; font-weight: 800; color:#4D7C2F; margin: 0;">📦 Inventory Analysis</h2>
    </div>
    
    <!-- Stats summary -->
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom:30px;">
      <div style="background:var(--color-cream); border:1px solid var(--color-gray-border); padding:16px; border-radius:12px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <span style="font-size:11.5px; color:var(--color-text-light); display:block; margin-bottom:6px; font-weight:700;">TOTAL PRODUCTS</span>
        <strong style="font-size:22px; color:var(--color-text-dark);">${totalItems}</strong>
      </div>
      <div style="background:#fef6f5; border:1px solid #fce8e6; padding:16px; border-radius:12px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <span style="font-size:11.5px; color:#c2410c; display:block; margin-bottom:6px; font-weight:700;">OUT OF STOCK / LOW</span>
        <strong style="font-size:22px; color:#ea580c;">${outOfStock} / ${lowStock}</strong>
      </div>
      <div style="background:#f4f9f0; border:1px solid #e5f2dc; padding:16px; border-radius:12px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <span style="font-size:11.5px; color:#15803d; display:block; margin-bottom:6px; font-weight:700;">TOTAL WAREHOUSE VALUE</span>
        <strong style="font-size:20px; color:#16a34a;">${fmt(totalValue)}</strong>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 2.5fr; gap:25px; margin-bottom:20px;">
      <div>
        <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; border-bottom:2px solid var(--color-gray-border); padding-bottom:8px; color:var(--color-text-dark);">Category Distribution</h3>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${categoriesHTML}
        </div>
      </div>
      <div>
        <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; border-bottom:2px solid var(--color-gray-border); padding-bottom:8px; color:var(--color-text-dark);">Inventory Quicklist</h3>
        <div style="border:1px solid var(--color-gray-border); border-radius:12px; padding:10px; background:white; box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
            <thead>
              <tr style="border-bottom:2px solid var(--color-gray-border); color:var(--color-text-light); background:var(--color-cream-light);">
                <th style="padding:12px 14px; text-align:center;">Image</th>
                <th style="padding:12px 14px;">Product Name</th>
                <th style="padding:12px 14px;">Type</th>
                <th style="padding:12px 14px;">Price</th>
                <th style="padding:12px 14px; text-align:center;">Stock</th>
              </tr>
            </thead>
            <tbody id="modal-product-tbody">
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const panel = document.querySelector('.admin-content-panel');
  if (panel) panel.innerHTML = content;
};

window.filterProductsByModalCategory = function(catName, event) {
  const products = window.MOCK_PRODUCTS || [];
  const filtered = catName === 'all' || catName === 'Tất cả' ? products : products.filter(p => p.category === catName);

  document.querySelectorAll('.category-filter-pill').forEach(pill => {
    pill.style.background = 'var(--color-cream)';
    pill.style.color = 'var(--color-text-dark)';
    pill.style.borderColor = 'var(--color-gray-border)';
  });
  if (event && event.currentTarget) {
    event.currentTarget.style.background = 'var(--color-primary)';
    event.currentTarget.style.color = '#FFFFFF';
    event.currentTarget.style.borderColor = 'var(--color-primary)';
  }

  const fmt = val => window.formatVND ? window.formatVND(val) : val.toLocaleString() + "đ";
  const tbody = document.getElementById("modal-product-tbody");
  if (tbody) {
    tbody.innerHTML = filtered.map(p => `
      <tr style="border-bottom: 1px solid var(--color-gray-border);">
        <td style="padding:12px 14px; text-align:center;"><img src="${p.image}" style="width:36px; height:36px; object-fit:contain; border-radius:6px; border:1px solid var(--color-gray-border); background:white; padding:2px;"></td>
        <td style="padding:12px 14px;"><strong>${p.name}</strong><br><span style="font-size:11.5px; color:var(--color-text-light);">${p.origin}</span></td>
        <td style="padding:12px 14px; color:var(--color-text-light); font-weight:600;">${p.category}</td>
        <td style="padding:12px 14px; font-weight:700; color:var(--color-primary);">${fmt(p.price)}</td>
        <td style="padding:12px 14px; font-weight:700; text-align:center; color:${p.stock === 0 ? 'red' : (p.stock < 15 ? 'orange' : 'var(--color-text-dark)')};">${p.stock}</td>
      </tr>
    `).join("");
  }
};

// 2. CUSTOMERS MANAGEMENT TAB
window.showAdminCustomersModal = function(e) {
  if (e) e.preventDefault();
  window.highlightSidebarMenu('customers');
  renderCustomersModal();
};

function renderCustomersModal() {
  const users = window.AuthService ? (window.AuthService.getUsers() || []) : [];
  const rowsHTML = users.map(u => `
    <tr style="border-bottom: 1px solid var(--color-gray-border);">
      <td style="padding:14px 16px;"><strong>${u.name}</strong>${u.isAdmin ? ' <span style="font-size:10px; background:#4d7c2f; color:white; padding:2px 8px; border-radius:10px; font-weight:700;">Admin</span>' : ''}</td>
      <td style="padding:14px 16px;">${u.email}</td>
      <td style="padding:14px 16px;">${u.phone || 'N/A'}</td>
      <td style="padding:14px 16px; font-weight:600; color:var(--color-primary);">${u.healthGoal || 'N/A'}</td>
      <td style="padding:14px 16px; text-align:center;">
        ${u.isAdmin ? '' : `<button class="action-btn" onclick="deleteAdminCustomer('${u.id}')" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:bold;">Delete</button>`}
      </td>
    </tr>
  `).join("");

  const content = `
    <div style="border-bottom: 2px solid #F0EEE4; padding-bottom: 15px; margin-bottom: 25px;">
      <h2 style="font-size:24px; font-weight: 800; color:#4D7C2F; margin: 0;">👤 Customers Management</h2>
    </div>
    
    <!-- Users Table -->
    <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:var(--color-text-dark);">Customer Accounts List</h3>
    <div style="border:1px solid var(--color-gray-border); border-radius:12px; padding:10px; margin-bottom:30px; background:white; box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:13.5px; text-align:left;">
        <thead>
          <tr style="border-bottom:2px solid var(--color-gray-border); color:var(--color-text-light); font-weight:700; background:var(--color-cream-light);">
            <th style="padding:12px 16px;">Full Name</th>
            <th style="padding:12px 16px;">Email</th>
            <th style="padding:12px 16px;">Phone</th>
            <th style="padding:12px 16px;">Health Goal</th>
            <th style="padding:12px 16px; text-align:center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>

    <!-- Add New User Form -->
    <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:var(--color-text-dark);">Add New Customer</h3>
    <form id="add-customer-form" onsubmit="submitNewCustomer(event)" style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; background:white; padding:20px; border-radius:12px; border:1px solid var(--color-gray-border); box-shadow:0 2px 8px rgba(0,0,0,0.02);">
      <div>
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">FULL NAME</label>
        <input type="text" id="cust-name" required style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
      </div>
      <div>
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">EMAIL</label>
        <input type="email" id="cust-email" required style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
      </div>
      <div>
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">PHONE NUMBER</label>
        <input type="text" id="cust-phone" required style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
      </div>
      <div>
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">PASSWORD</label>
        <input type="password" id="cust-pass" required style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
      </div>
      <div style="grid-column: span 2;">
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">HEALTH GOAL</label>
        <select id="cust-goal" style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
          <option value="Eat Clean">Eat Clean (Healthy eating)</option>
          <option value="Giảm cân">Weight loss</option>
          <option value="Tăng cơ">Gym / Muscle gain</option>
          <option value="Snack lành mạnh">Healthy snacking</option>
        </select>
      </div>
      <div style="grid-column: span 2; display:flex; justify-content:flex-end; margin-top:8px;">
        <button type="submit" class="btn btn-primary" style="font-size:13px; font-weight: 700; padding:10px 24px; border-radius:8px;">Add Account</button>
      </div>
    </form>
  `;

  const panel = document.querySelector('.admin-content-panel');
  if (panel) panel.innerHTML = content;
}

window.submitNewCustomer = function(e) {
  e.preventDefault();
  const name = document.getElementById("cust-name").value;
  const email = document.getElementById("cust-email").value;
  const phone = document.getElementById("cust-phone").value;
  const pass = document.getElementById("cust-pass").value;
  const goal = document.getElementById("cust-goal").value;

  if (window.AuthService) {
    const res = window.AuthService.register(name, email, phone, pass, goal);
    if (res.success) {
      window.showToast("New customer created successfully!", "success");
      renderCustomersModal();
    } else {
      window.showToast(res.message, "error");
    }
  }
};

window.deleteAdminCustomer = function(userId) {
  window.showConfirmModal("Are you sure you want to delete this customer account?", () => {
    if (window.AuthService) {
      let users = window.AuthService.getUsers();
      users = users.filter(u => u.id !== userId);
      window.AuthService.saveUsers(users);
      window.showToast("Customer account deleted successfully!", "success");
      renderCustomersModal();
    }
  });
};

// 3. CATEGORIES MANAGEMENT TAB
window.showAdminCategoriesModal = function(e) {
  if (e) e.preventDefault();
  window.highlightSidebarMenu('categories');
  renderCategoriesModal();
};

function renderCategoriesModal() {
  const products = window.MOCK_PRODUCTS || [];
  
  // Base categories product counts
  const counts = { "Fruits": 0, "Nuts": 0, "Granola": 0 };
  products.forEach(p => {
    if (p.category in counts) counts[p.category]++;
    else counts[p.category] = (counts[p.category] || 0) + 1;
  });

  const custom = JSON.parse(localStorage.getItem("tqg_custom_categories") || "[]");
  custom.forEach(cat => {
    if (!(cat in counts)) counts[cat] = 0;
  });

  const rowsHTML = Object.entries(counts).map(([cat, count]) => {
    const isCustom = !["Fruits", "Nuts", "Granola"].includes(cat);
    return `
      <tr style="border-bottom: 1px solid var(--color-gray-border);">
        <td style="padding:14px 16px; font-weight:700;">📂 ${cat}</td>
        <td style="padding:14px 16px; text-align:center; font-weight:700; color:var(--color-primary);">${count} sản phẩm</td>
        <td style="padding:14px 16px; text-align:center;">
          ${isCustom ? `<button class="action-btn" onclick="deleteCustomCategory('${cat}')" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:bold;">Xóa</button>` : '<span style="color:var(--color-text-light); font-size:12px; font-weight:600;">Mặc định</span>'}
        </td>
      </tr>
    `;
  }).join("");

  const content = `
    <div style="border-bottom: 2px solid #F0EEE4; padding-bottom: 15px; margin-bottom: 25px;">
      <h2 style="font-size:24px; font-weight: 800; color:#4D7C2F; margin: 0;">📁 Category Management</h2>
    </div>
    
    <!-- Categories Table -->
    <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:var(--color-text-dark);">Product Categories</h3>
    <div style="border:1px solid var(--color-gray-border); border-radius:12px; padding:10px; margin-bottom:30px; background:white; box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; font-size:13.5px; text-align:left;">
        <thead>
          <tr style="border-bottom:2px solid var(--color-gray-border); color:var(--color-text-light); font-weight:700; background:var(--color-cream-light);">
            <th style="padding:12px 16px;">Category Name</th>
            <th style="padding:12px 16px; text-align:center;">Linked Products Count</th>
            <th style="padding:12px 16px; text-align:center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>

    <!-- Add Category Form -->
    <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:var(--color-text-dark);">Add New Category</h3>
    <form id="add-category-form" onsubmit="submitNewCategory(event)" style="display:flex; gap:16px; background:white; padding:20px; border-radius:12px; border:1px solid var(--color-gray-border); align-items:flex-end; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
      <div style="flex:1;">
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">NEW CATEGORY NAME</label>
        <input type="text" id="cat-name-input" required placeholder="e.g., Gift Combo, Dried Fruits..." style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
      </div>
      <button type="submit" class="btn btn-primary" style="font-size:13px; font-weight:700; padding:10px 24px; border-radius:8px; height: 42px;">Create Category</button>
    </form>
  `;

  const panel = document.querySelector('.admin-content-panel');
  if (panel) panel.innerHTML = content;
}

window.submitNewCategory = function(e) {
  e.preventDefault();
  const name = document.getElementById("cat-name-input").value.trim();
  if (!name) return;

  const custom = JSON.parse(localStorage.getItem("tqg_custom_categories") || "[]");
  if (["Fruits", "Nuts", "Granola"].includes(name) || custom.includes(name)) {
    window.showToast("Category already exists!", "warning");
    return;
  }

  custom.push(name);
  localStorage.setItem("tqg_custom_categories", JSON.stringify(custom));
  window.showToast(`Category "${name}" created successfully!`, "success");
  renderCategoriesModal();
};

window.deleteCustomCategory = function(catName) {
  window.showConfirmModal(`Are you sure you want to delete category "${catName}"?`, () => {
    let custom = JSON.parse(localStorage.getItem("tqg_custom_categories") || "[]");
    custom = custom.filter(c => c !== catName);
    localStorage.setItem("tqg_custom_categories", JSON.stringify(custom));
    window.showToast(`Category "${catName}" deleted!`, "success");
    renderCategoriesModal();
  });
};

// 4. PROMOTIONS MANAGER TAB
window.showAdminPromotionsModal = function(e) {
  if (e) e.preventDefault();
  window.highlightSidebarMenu('promotions');
  renderPromotionsModal();
};

function renderPromotionsModal() {
  const defaults = {
    "FREESHIP50": { type: "freeship", discountVal: 30000, minOrder: 500000, description: "Miễn phí vận chuyển (tối đa 30K) cho đơn từ 500K" },
    "TUQUYGARDEN10": { type: "percentage", discountVal: 10, minOrder: 0, description: "Giảm 10% tổng giá trị đơn hàng" },
    "HEALTYLIFESTYLE": { type: "fixed", discountVal: 50000, minOrder: 300000, description: "Giảm 50K cho đơn từ 300K" }
  };
  const custom = JSON.parse(localStorage.getItem("tqg_custom_vouchers") || "{}");
  const vouchers = { ...defaults, ...custom };

  const rowsHTML = Object.entries(vouchers).map(([code, v]) => {
    const isCustom = code in custom;
    const typeLabel = v.type === "percentage" ? "Phần trăm (%)" : (v.type === "fixed" ? "Số tiền cố định (đ)" : "Freeship vận chuyển");
    const valText = v.type === "percentage" ? `${v.discountVal}%` : `${v.discountVal.toLocaleString()}đ`;
    return `
      <tr style="border-bottom: 1px solid var(--color-gray-border); font-size:13px;">
        <td style="padding:14px 16px;"><strong>${code}</strong></td>
        <td style="padding:14px 16px; color:var(--color-primary); font-weight:700;">${typeLabel} (${valText})</td>
        <td style="padding:14px 16px; font-weight:600;">Từ ${v.minOrder.toLocaleString()}đ</td>
        <td style="padding:14px 16px; color:var(--color-text-light); font-size:12.5px;">${v.description}</td>
        <td style="padding:14px 16px; text-align:center;">
          ${isCustom ? `<button class="action-btn" onclick="deleteCustomVoucher('${code}')" style="background:#fee2e2; color:#ef4444; border:none; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:bold;">Xóa</button>` : '<span style="color:#5b6a56; font-size:12px; font-weight:600;">Hệ thống</span>'}
        </td>
      </tr>
    `;
  }).join("");

  const content = `
    <div style="border-bottom: 2px solid #F0EEE4; padding-bottom: 15px; margin-bottom: 25px;">
      <h2 style="font-size:24px; font-weight: 800; color:#4D7C2F; margin: 0;">🏷️ Promo Codes Management</h2>
    </div>
    
    <!-- Voucher table list -->
    <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:var(--color-text-dark);">Active Vouchers</h3>
    <div style="border:1px solid var(--color-gray-border); border-radius:12px; padding:10px; margin-bottom:30px; background:white; box-shadow:0 2px 8px rgba(0,0,0,0.02); overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13.5px;">
        <thead>
          <tr style="border-bottom:2px solid var(--color-gray-border); color:var(--color-text-light); font-weight:700; background:var(--color-cream-light);">
            <th style="padding:12px 16px;">Promo Code</th>
            <th style="padding:12px 16px;">Type / Value</th>
            <th style="padding:12px 16px;">Min Order</th>
            <th style="padding:12px 16px;">Description</th>
            <th style="padding:12px 16px; text-align:center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>

    <!-- Voucher Creation form -->
    <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:var(--color-text-dark);">Create New Promotion</h3>
    <form id="add-voucher-form" onsubmit="submitNewVoucher(event)" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; background:white; padding:20px; border-radius:12px; border:1px solid var(--color-gray-border); box-shadow:0 2px 8px rgba(0,0,0,0.02);">
      <div>
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">PROMO CODE (Uppercase)</label>
        <input type="text" id="v-code" required placeholder="e.g., TUQUYHE30" style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B; text-transform:uppercase;">
      </div>
      <div>
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">DISCOUNT TYPE</label>
        <select id="v-type" style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount (đ)</option>
          <option value="freeship">Free Shipping</option>
        </select>
      </div>
      <div>
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">DISCOUNT VALUE (% or đ)</label>
        <input type="number" id="v-val" required min="1" placeholder="e.g., 10 or 30000" style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
      </div>
      <div>
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">MINIMUM REQUIRED ORDER</label>
        <input type="number" id="v-min" required min="0" placeholder="e.g., 200000" style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
      </div>
      <div style="grid-column: span 2;">
        <label style="font-size:12px; font-weight:700; display:block; margin-bottom:6px; color:var(--color-text-dark);">DISPLAY DESCRIPTION</label>
        <input type="text" id="v-desc" required placeholder="e.g., Get 30K off for fruit orders from 200K..." style="width:100%; padding:10px; border:1px solid var(--color-gray-border); border-radius:8px; outline:none; background:white; color:#2E3A2B;">
      </div>
      <div style="grid-column: span 2; display:flex; justify-content:flex-end; margin-top:8px;">
        <button type="submit" class="btn btn-primary" style="font-size:13px; font-weight:700; padding:10px 24px; border-radius:8px;">Create Promotion</button>
      </div>
    </form>
  `;

  const panel = document.querySelector('.admin-content-panel');
  if (panel) panel.innerHTML = content;
}

window.submitNewVoucher = function(e) {
  e.preventDefault();
  const code = document.getElementById("v-code").value.trim().toUpperCase();
  const type = document.getElementById("v-type").value;
  const val = parseInt(document.getElementById("v-val").value);
  const min = parseInt(document.getElementById("v-min").value);
  const desc = document.getElementById("v-desc").value;

  const defaults = ["FREESHIP50", "TUQUYGARDEN10", "HEALTYLIFESTYLE"];
  if (defaults.includes(code)) {
    window.showToast("This is a system default voucher code, cannot be overwritten!", "warning");
    return;
  }

  const custom = JSON.parse(localStorage.getItem("tqg_custom_vouchers") || "{}");
  custom[code] = {
    type,
    discountVal: val,
    minOrder: min,
    description: desc
  };

  localStorage.setItem("tqg_custom_vouchers", JSON.stringify(custom));
  window.showToast(`Voucher code "${code}" saved successfully!`, "success");
  renderPromotionsModal();
};

window.deleteCustomVoucher = function(code) {
  window.showConfirmModal(`Are you sure you want to delete voucher code "${code}"?`, () => {
    const custom = JSON.parse(localStorage.getItem("tqg_custom_vouchers") || "{}");
    delete custom[code];
    localStorage.setItem("tqg_custom_vouchers", JSON.stringify(custom));
    window.showToast(`Voucher code "${code}" deleted!`, "success");
    renderPromotionsModal();
  });
};

// 5. SALES & METRICS REPORTS TAB
window.showAdminReportsModal = function(e) {
  if (e) e.preventDefault();
  window.highlightSidebarMenu('reports');
  if (!window.OrderService) return;

  const isEn = document.body.classList.contains("lang-en");
  const allOrders = window.OrderService.getOrders();
  const successfulOrders = allOrders.filter(o => o.status === "Hoàn thành");
  const pendingOrders = allOrders.filter(o => o.status === "Chờ xác nhận");
  const cancelledOrders = allOrders.filter(o => o.status === "Đã hủy");

  const totalSales = successfulOrders.reduce((sum, o) => sum + o.total, 0);
  const fmt = val => window.formatVND ? window.formatVND(val) : val.toLocaleString() + "đ";

  // Calculate category revenues
  const categorySales = { "Fruits": 0, "Nutritional Seeds": 0, "Granola": 0, "Combo Healthy": 0 };
  successfulOrders.forEach(o => {
    o.items.forEach(item => {
      const prod = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
      if (prod) {
        const cat = prod.category;
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
      }
    });
  });

  const getCatName = cat => {
    if (isEn) {
      if (cat === "Fruits") return "Fresh Fruits";
      if (cat === "Nutritional Seeds" || cat === "Nuts") return "Nutritional Seeds";
      if (cat === "Granola") return "Healthy Granola";
      if (cat === "Combo Healthy") return "Healthy Combos";
      return cat;
    } else {
      if (cat === "Fruits") return "Trái cây tươi";
      if (cat === "Nutritional Seeds" || cat === "Nuts") return "Hạt dinh dưỡng";
      if (cat === "Granola") return "Granola ngũ cốc";
      if (cat === "Combo Healthy") return "Combo sống khỏe";
      return cat;
    }
  };

  const catTotal = Object.values(categorySales).reduce((a, b) => a + b, 0) || 1;
  const categoriesHTML = Object.entries(categorySales).map(([cat, val]) => {
    const percent = Math.round((val / catTotal) * 100);
    return `
      <div onclick="window.showReportCategoryDetails('${cat}')" class="report-cat-bar-item" style="margin-bottom:16px; cursor:pointer; padding:10px 14px; border-radius:8px; border: 1px solid var(--color-gray-border); background: white; transition:all 0.2s;" onmouseenter="this.style.background='rgba(77,124,47,0.06)'; this.style.borderColor='var(--color-primary)';" onmouseleave="this.style.background='white'; this.style.borderColor='var(--color-gray-border)';">
        <div style="display:flex; justify-content:space-between; font-size:13.5px; font-weight:700; margin-bottom:6px; color:var(--color-text-dark);">
          <span>📂 ${getCatName(cat)} <span style="font-size:11px; color:var(--color-primary); font-weight:normal; font-style:italic;">(${isEn ? 'Click to view details' : 'Nhấp xem chi tiết'})</span></span>
          <span style="color:var(--color-primary);">${fmt(val)} (${percent}%)</span>
        </div>
        <div style="width:100%; height:10px; background:#e2ddd5; border-radius:6px; overflow:hidden;">
          <div style="width:${percent}%; height:100%; background:var(--color-primary); border-radius:6px;"></div>
        </div>
      </div>
    `;
  }).join("");

  const userSpend = {};
  successfulOrders.forEach(o => {
    const key = `${o.customerName} (${o.customerPhone})`;
    userSpend[key] = (userSpend[key] || 0) + o.total;
  });

  const topCustomersHTML = Object.entries(userSpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([user, spend], idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:white; border:1px solid var(--color-gray-border); padding:14px 16px; border-radius:8px; margin-bottom:10px; font-size:13.5px;">
        <span style="font-weight:700; color:var(--color-text-dark);">${idx + 1}. ${user}</span>
        <strong style="color:var(--color-primary); font-size:14.5px;">${fmt(spend)}</strong>
      </div>
    `).join("") || `<p style="text-align:center; color:var(--color-text-light); font-size:13px; padding:20px;">${isEn ? 'No transaction data' : 'Chưa có dữ liệu giao dịch'}</p>`;

  const content = `
    <div style="border-bottom: 2px solid #F0EEE4; padding-bottom: 15px; margin-bottom: 25px;">
      <h2 style="font-size:24px; font-weight: 800; color:#4D7C2F; margin: 0;">${isEn ? '📈 Transactions & Analytics Report' : '📈 Báo cáo Giao dịch & Phân tích'}</h2>
    </div>
    
    <!-- Financial highlight metrics -->
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; margin-bottom:30px;">
      <div style="background:#f4f9f0; border:1px solid #e5f2dc; padding:16px; border-radius:12px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <span style="font-size:11.5px; color:#15803d; display:block; margin-bottom:6px; font-weight:700;">${isEn ? 'ACTUAL REVENUE' : 'DOANH THU THỰC TẾ'}</span>
        <strong style="font-size:22px; color:#16a34a;">${fmt(totalSales)}</strong>
      </div>
      <div style="background:#fcf8f0; border:1px solid #faebd7; padding:16px; border-radius:12px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <span style="font-size:11.5px; color:#b45309; display:block; margin-bottom:6px; font-weight:700;">${isEn ? 'COMPLETED ORDERS' : 'ĐƠN HÀNG HOÀN THÀNH'}</span>
        <strong style="font-size:22px; color:#d97706;">${successfulOrders.length} / ${allOrders.length}</strong>
      </div>
      <div style="background:#fef5f5; border:1px solid #fde2e2; padding:16px; border-radius:12px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
        <span style="font-size:11.5px; color:#b91c1c; display:block; margin-bottom:6px; font-weight:700;">${isEn ? 'ORDER CANCEL RATE' : 'TỶ LỆ HỦY ĐƠN'}</span>
        <strong style="font-size:22px; color:#dc2626;">${allOrders.length > 0 ? Math.round((cancelledOrders.length / allOrders.length) * 100) : 0}%</strong>
      </div>
    </div>

    <!-- Categories & Client spend grid splits -->
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px; margin-bottom:25px;">
      <div>
        <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; border-bottom:2px solid var(--color-gray-border); padding-bottom:8px; color:var(--color-text-dark);">${isEn ? 'Revenue by Category' : 'Doanh thu theo Danh mục'}</h3>
        ${categoriesHTML}
      </div>
      <div>
        <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; border-bottom:2px solid var(--color-gray-border); padding-bottom:8px; color:var(--color-text-dark);">${isEn ? 'Top 3 Best Spending Customers' : 'Top 3 Khách hàng Chi tiêu Nhiều nhất'}</h3>
        ${topCustomersHTML}
      </div>
    </div>

    <!-- Click details list box -->
    <div id="report-category-details-box" style="margin-top:25px; display:none; background:white; border:1px solid var(--color-gray-border); padding:20px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.04); transition:all 0.3s;">
      <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; border-bottom:2px solid var(--color-gray-border); padding-bottom:8px; color:var(--color-text-dark); display:flex; justify-content:space-between; align-items:center;">
        <span id="report-details-title">${isEn ? 'Bestselling Products Details' : 'Chi tiết Sản phẩm Bán chạy'}</span>
        <button onclick="document.getElementById('report-category-details-box').style.display='none'" style="background:none; border:none; font-size:22px; cursor:pointer; color:var(--color-text-light); font-weight:700;">&times;</button>
      </h3>
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:13.5px; text-align:left;">
          <thead>
            <tr style="border-bottom:2px solid var(--color-gray-border); color:var(--color-text-light); font-weight:700; background:var(--color-cream-light);">
              <th style="padding:12px 14px;">${isEn ? 'Product Name' : 'Tên sản phẩm'}</th>
              <th style="padding:12px 14px; text-align:center;">${isEn ? 'Quantity Sold' : 'Số lượng đã bán'}</th>
              <th style="padding:12px 14px; text-align:right;">${isEn ? 'Revenue Earned' : 'Doanh thu đạt được'}</th>
            </tr>
          </thead>
          <tbody id="report-details-tbody">
            <!-- Dynamically populated -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  const panel = document.querySelector('.admin-content-panel');
  if (panel) panel.innerHTML = content;
};

window.showReportCategoryDetails = function(catName) {
  if (!window.OrderService) return;

  const isEn = document.body.classList.contains("lang-en");
  const allOrders = window.OrderService.getOrders();
  const successfulOrders = allOrders.filter(o => o.status === "Hoàn thành");
  const fmt = val => window.formatVND ? window.formatVND(val) : val.toLocaleString() + "đ";

  const productSales = {};
  successfulOrders.forEach(o => {
    o.items.forEach(item => {
      const prod = window.MOCK_PRODUCTS.find(p => p.id === item.productId);
      if (prod && prod.category === catName) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            image: prod.image
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      }
    });
  });

  const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity);

  const container = document.getElementById("report-category-details-box");
  const title = document.getElementById("report-details-title");
  const tbody = document.getElementById("report-details-tbody");

  const getCatName = cat => {
    if (isEn) {
      if (cat === "Fruits") return "Fresh Fruits";
      if (cat === "Nutritional Seeds" || cat === "Nuts") return "Nutritional Seeds";
      if (cat === "Granola") return "Healthy Granola";
      if (cat === "Combo Healthy") return "Healthy Combos";
      return cat;
    } else {
      if (cat === "Fruits") return "Trái cây tươi";
      if (cat === "Nutritional Seeds" || cat === "Nuts") return "Hạt dinh dưỡng";
      if (cat === "Granola") return "Granola ngũ cốc";
      if (cat === "Combo Healthy") return "Combo sống khỏe";
      return cat;
    }
  };

  if (container && title && tbody) {
    title.innerHTML = isEn
      ? `🔥 Category Sales Report: <span style="color:var(--color-primary); font-weight:800;">${getCatName(catName)}</span>`
      : `🔥 Báo cáo doanh số nhóm: <span style="color:var(--color-primary); font-weight:800;">${getCatName(catName)}</span>`;
    
    if (sorted.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:15px; color:var(--color-text-light);">${isEn ? 'No products sold in this category yet.' : 'Chưa có sản phẩm nào được bán trong nhóm này.'}</td></tr>`;
    } else {
      tbody.innerHTML = sorted.map(item => `
        <tr style="border-bottom:1px solid var(--color-gray-border);">
          <td style="padding:10px 14px; display:flex; align-items:center; gap:8px; color:var(--color-text-dark);">
            <img src="${item.image}" style="width:30px; height:30px; object-fit:contain; border-radius:4px; border:1px solid var(--color-gray-border); background:white; padding:2px;">
            <strong>${item.name}</strong>
          </td>
          <td style="padding:10px 14px; text-align:center; font-weight:700; color:var(--color-text-dark);">${item.quantity} ${isEn ? 'kg/box' : 'kg/hộp'}</td>
          <td style="padding:10px 14px; text-align:right; font-weight:800; color:var(--color-primary);">${fmt(item.revenue)}</td>
        </tr>
      `).join("");
    }
    
    container.style.display = "block";
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// 6. SYSTEM SETTINGS MANAGER TAB
window.showAdminSettingsModal = function(e) {
  if (e) e.preventDefault();
  window.highlightSidebarMenu('settings');
  
  const isDarkTheme = document.body.classList.contains("dark-mode-theme");
  const isEn = document.body.classList.contains("lang-en");

  const content = `
    <div style="border-bottom: 2px solid #F0EEE4; padding-bottom: 15px; margin-bottom: 25px;">
      <h2 style="font-size:24px; font-weight: 800; color:#4D7C2F; margin: 0;">⚙️ System Management Settings</h2>
    </div>
    
    <div style="font-size:14px; line-height:1.6;">
      <div style="background:white; border:1px solid var(--color-gray-border); padding:20px; border-radius:12px; margin-bottom:25px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
        <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:var(--color-text-dark); border-bottom:2px solid var(--color-gray-border); padding-bottom:8px;">Theme Settings</h3>
        
        <!-- Theme Toggle -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0;">
          <div>
            <strong style="color:var(--color-text-dark); font-size:14.5px;">Dark Mode</strong>
            <span style="font-size:12px; color:var(--color-text-light); display:block; margin-top:2px;">Switch interface to dark colors to protect eyes when working at night</span>
          </div>
          <div style="position:relative; display:inline-block; width:48px; height:24px;">
            <input type="checkbox" id="theme-toggle-chk" ${isDarkTheme ? 'checked' : ''} onchange="window.toggleAdminDashboardTheme(this.checked)" style="opacity:0; width:0; height:0;">
            <label for="theme-toggle-chk" style="position:absolute; cursor:pointer; top:0; left:0; right:0; bottom:0; background-color:#ccc; transition:.4s; border-radius:24px; border:1px solid var(--color-gray-border);">
              <span style="position:absolute; content:''; height:18px; width:18px; left:3px; bottom:2px; background-color:white; transition:.4s; border-radius:50%; transform:${isDarkTheme ? 'translateX(24px)' : 'none'}; box-shadow:0 1px 3px rgba(0,0,0,0.25);"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Account Security / Change Password -->
      <div style="background:white; border:1px solid var(--color-gray-border); padding:20px; border-radius:12px; margin-bottom:25px; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
        <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:var(--color-text-dark); border-bottom:2px solid var(--color-gray-border); padding-bottom:8px;">Account Security</h3>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:var(--color-text-dark); font-size:14.5px;">Change Password</strong>
            <span style="font-size:12px; color:var(--color-text-light); display:block; margin-top:2px;">Change your administrator login password</span>
          </div>
          <button class="btn btn-outline" onclick="window.showAdminChangePasswordModal(event)" style="padding:8px 16px; font-size:13px; font-weight:700; border-radius:8px; border-color:var(--color-gray-border); background:white; color:var(--color-text-dark); cursor:pointer;">
            🔑 Change Password
          </button>
        </div>
      </div>

      <!-- Core DB management utilities -->
      <div style="background:#fef5f5; border:1px solid #fde2e2; padding:20px; border-radius:12px; box-shadow:0 2px 8px rgba(185,28,28,0.02);">
        <h3 style="margin:0 0 15px 0; font-size:16px; font-weight:800; color:#b91c1c; border-bottom:2px solid rgba(185,28,28,0.1); padding-bottom:8px;">Advanced System Actions</h3>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:#b91c1c; font-size:14.5px;">Restore Default Database Mockup</strong>
            <span style="font-size:12px; color:#7f1d1d; display:block; margin-top:2px;">Clear local changes and restore database mockup to original state</span>
          </div>
          <button class="btn btn-outline" onclick="window.triggerAdminReset()" style="padding:10px 20px; font-size:13px; font-weight:700; border-radius:8px; color:#ef4444; border-color:#fca5a5; background:white; cursor:pointer;">
            🔄 Restore DB
          </button>
        </div>
      </div>
    </div>
  `;

  const panel = document.querySelector('.admin-content-panel');
  if (panel) panel.innerHTML = content;
};

window.toggleAdminDashboardTheme = function(isChecked) {
  const toggleDot = document.querySelector('label[for="theme-toggle-chk"] span');
  if (toggleDot) {
    toggleDot.style.transform = isChecked ? 'translateX(24px)' : 'none';
  }

  if (isChecked) {
    document.body.classList.add("dark-mode-theme");
    localStorage.setItem("tqg_admin_theme", "dark");
  } else {
    document.body.classList.remove("dark-mode-theme");
    localStorage.setItem("tqg_admin_theme", "light");
  }

  // Reload spline area if on dashboard page
  if (typeof renderRevenueSplineChart === 'function') {
    renderRevenueSplineChart();
  }
};

window.toggleLanguageSettings = function() {
  const isEn = document.body.classList.contains("lang-en");
  if (isEn) {
    document.body.classList.remove("lang-en");
    document.body.classList.add("lang-vi");
    localStorage.setItem("tqg_lang", "vi");
  } else {
    document.body.classList.remove("lang-vi");
    document.body.classList.add("lang-en");
    localStorage.setItem("tqg_lang", "en");
  }
  window.showToast("Display language updated!", "success");
  window.closeCustomModal();
  // Reload page to apply bilingual translations
  setTimeout(() => window.location.reload(), 800);
};

window.triggerAdminReset = function() {
  window.closeCustomModal();
  if (typeof resetAdminDataMockup === 'function') {
    resetAdminDataMockup();
  } else {
    localStorage.clear();
    window.showToast("Cache cleared and database restored!", "success");
    setTimeout(() => window.location.reload(), 1000);
  }
};

// Dynamic CSS Injection for Hoverable Sidebar Submenus
const submenuStyle = document.createElement("style");
submenuStyle.innerHTML = `
  .admin-menu-li {
    position: relative;
  }
  .admin-submenu {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    padding-left: 20px;
    list-style: none;
    margin: 0;
    border-left: 2px solid rgba(255, 255, 255, 0.15);
    margin-left: 15px;
  }
  .admin-menu-li:hover .admin-submenu {
    max-height: 200px;
    opacity: 1;
    margin-top: 6px;
    margin-bottom: 8px;
  }
  .admin-menu-li:hover .admin-menu-chevron {
    opacity: 0.8 !important;
    transform: rotate(90deg) !important;
  }
  .admin-submenu-item {
    padding: 6px 12px;
    color: rgba(255, 255, 255, 0.65);
    text-decoration: none;
    display: block;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s;
    border-radius: 6px;
    cursor: pointer;
  }
  .admin-submenu-item:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.08);
    padding-left: 15px;
  }
`;
document.head.appendChild(submenuStyle);

// Submenu helper navigation handlers
window.scrollToSection = function(selector) {
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

window.focusAddProductForm = function() {
  setTimeout(() => {
    const el = document.getElementById("p-name");
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 150);
};

window.focusAddCustomer = function() {
  setTimeout(() => {
    const el = document.getElementById("cust-name");
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 150);
};

window.focusAddCategory = function() {
  setTimeout(() => {
    const el = document.getElementById("cat-name-input");
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 150);
};

window.focusAddVoucher = function() {
  setTimeout(() => {
    const el = document.getElementById("v-code");
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 150);
};

window.handleCalendarDateChange = function(val) {
  if (!val) return;
  const parts = val.split('-');
  if (parts.length === 3) {
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    window.showToast(`Business stats filtered by date: ${formatted}`, "success");
    
    // Simulate real-time metrics fluctuation on calendar change to look alive
    const totalOrderText = document.querySelector('.widget-box:nth-child(2) strong');
    if (totalOrderText) {
      const orders = window.OrderService.getOrders();
      const count = Math.max(1, Math.round(orders.length * (0.6 + Math.random() * 0.5)));
      totalOrderText.innerText = count + " đơn";
    }
    
    if (typeof renderRevenueSplineChart === 'function') {
      renderRevenueSplineChart();
    }
    if (typeof renderOrderDistributionDonut === 'function') {
      renderOrderDistributionDonut();
    }
    if (typeof renderCategorySalesChart === 'function') {
      renderCategorySalesChart();
    }
  }
};

// Theme, avatar, and SPA preferences autoloader on DOM load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("tqg_admin_theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode-theme");
  }
  
  const savedAvatar = localStorage.getItem("tqg_admin_avatar");
  if (savedAvatar) {
    document.querySelectorAll(".admin-sidebar-avatar").forEach(img => {
      img.src = savedAvatar;
    });
  }

  // Set default date for interactive date picker element
  const dateInput = document.getElementById('current-calendar-date');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // Save the original page content for the dynamic tab switcher
  const panel = document.querySelector('.admin-content-panel');
  if (panel) {
    window.ORIGINAL_PANEL_HTML = panel.innerHTML;
  }

  // Auto-highlight sidebar active state based on current page url
  if (window.location.pathname.includes('admin-dashboard.html')) {
    window.highlightSidebarMenu('dashboard');
  } else if (window.location.pathname.includes('admin-products.html')) {
    window.highlightSidebarMenu('products-crud');
  } else if (window.location.pathname.includes('admin-orders.html')) {
    window.highlightSidebarMenu('orders-crud');
  }
});

// Change Admin Avatar Handler via File Upload
window.changeAdminAvatar = function(e) {
  if (e) e.preventDefault();
  
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  
  fileInput.onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Warn if file size is > 1.5MB to stay clean under localStorage quota limit (5MB)
    if (file.size > 1.5 * 1024 * 1024) {
      window.showToast("Image too large! Please choose an image under 1.5MB.", "warning");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(fileEvent) {
      const base64Data = fileEvent.target.result;
      localStorage.setItem("tqg_admin_avatar", base64Data);
      
      // Update all avatar imgs on current page layout
      document.querySelectorAll(".admin-sidebar-avatar").forEach(img => {
        img.src = base64Data;
      });
      window.showToast("Admin avatar updated successfully!", "success");
    };
    reader.readAsDataURL(file);
  };
  
  document.body.appendChild(fileInput);
  fileInput.click();
  document.body.removeChild(fileInput);
};

// CHANGE PASSWORD RENDERING & SUBMISSION HANDLERS
window.showAdminChangePasswordModal = function(e) {
  if (e) e.preventDefault();
  window.highlightSidebarMenu('settings');
  
  const content = `
    <div style="border-bottom: 2px solid #F0EEE4; padding-bottom: 15px; margin-bottom: 25px;">
      <h2 style="font-size:24px; font-weight: 800; color:#4D7C2F; margin: 0;">🔑 Change Admin Password</h2>
    </div>
    
    <div style="font-size:14px; line-height:1.6; max-width: 500px; margin: 30px auto;">
      <div style="background:white; border:1px solid var(--color-gray-border); padding:30px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
        <form id="admin-change-password-form" onsubmit="window.handleAdminChangePassword(event)">
          <div class="auth-form-group" style="margin-bottom:20px;">
            <label style="display:block; margin-bottom:8px; font-weight:700; color:var(--color-text-dark);">Current Password *</label>
            <input type="password" id="admin-old-password" class="auth-input" required placeholder="Enter current password" style="width:100%; box-sizing:border-box; padding: 10px; border: 1px solid var(--color-gray-border); border-radius: 8px;">
          </div>
          
          <div class="auth-form-group" style="margin-bottom:20px;">
            <label style="display:block; margin-bottom:8px; font-weight:700; color:var(--color-text-dark);">New Password *</label>
            <input type="password" id="admin-new-password" class="auth-input" required placeholder="Enter new password (min 6 characters)" style="width:100%; box-sizing:border-box; padding: 10px; border: 1px solid var(--color-gray-border); border-radius: 8px;">
          </div>
          
          <div class="auth-form-group" style="margin-bottom:25px;">
            <label style="display:block; margin-bottom:8px; font-weight:700; color:var(--color-text-dark);">Confirm New Password *</label>
            <input type="password" id="admin-confirm-password" class="auth-input" required placeholder="Re-enter new password" style="width:100%; box-sizing:border-box; padding: 10px; border: 1px solid var(--color-gray-border); border-radius: 8px;">
          </div>
          
          <div style="display:flex; justify-content: flex-end; gap:12px;">
            <button type="button" class="btn btn-outline" onclick="window.showAdminSettingsModal(event)" style="padding:10px 20px; font-weight:700; border-radius:8px;">Cancel</button>
            <button type="submit" class="btn btn-primary" style="padding:10px 20px; font-weight:700; border-radius:8px; background:var(--color-primary); color:white; border:none; cursor:pointer;">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const panel = document.querySelector('.admin-content-panel');
  if (panel) {
    panel.innerHTML = content;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

window.handleAdminChangePassword = function(e) {
  if (e) e.preventDefault();
  
  const oldPass = document.getElementById("admin-old-password").value;
  const newPass = document.getElementById("admin-new-password").value;
  const confirmPass = document.getElementById("admin-confirm-password").value;
  
  if (newPass.length < 6) {
    window.showToast("New password must be at least 6 characters.", "error");
    return;
  }
  
  if (newPass !== confirmPass) {
    window.showToast("New passwords do not match.", "error");
    return;
  }
  
  if (window.AuthService) {
    const result = window.AuthService.changePassword(oldPass, newPass);
    if (result.success) {
      window.showToast(result.message, "success");
      document.getElementById("admin-change-password-form").reset();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      window.showToast(result.message, "error");
    }
  } else {
    window.showToast("Authentication service not ready!", "error");
  }
};


