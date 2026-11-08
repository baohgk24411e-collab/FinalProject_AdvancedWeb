// js/profile.js

document.addEventListener("DOMContentLoaded", () => {
  if (!window.AuthService) return;

  // 1. Seed Linh Ngô user and her 12 orders if not already done
  seedLinhNgoData();

  const currentUser = window.AuthService.getCurrentUser();
  if (!currentUser) {
    // If not logged in, redirect to login
    window.location.href = "login.html";
    return;
  }

  // Admin should be on dashboard
  if (currentUser.isAdmin) {
    window.location.href = "admin-dashboard.html";
    return;
  }

  // 2. Setup user displays
  updateUserInterface(currentUser);
  loadSavedAvatar();

  // 3. Prefill Form inputs
  prefillProfileForm(currentUser);

  // 4. Check hash or query param for tab
  const tab = window.getUrlParam ? window.getUrlParam("tab") : "";
  if (tab === "orders") {
    switchProfileTab("orders");
  } else if (tab === "wishlist") {
    switchProfileTab("wishlist");
  } else {
    switchProfileTab("info");
  }
});

// Seeding Default User and Orders
function seedLinhNgoData() {
  const users = window.AuthService.getUsers();
  let linhUser = users.find(u => u.id === "u_linh" || u.email === "ntthaolinhcv@gmail.com");

  if (!linhUser) {
    linhUser = {
      id: "u_linh",
      name: "Linh Ngô",
      email: "ntthaolinhcv@gmail.com",
      phone: "0911181438",
      healthGoal: "Eat Clean",
      password: "linh",
      isAdmin: false,
      wishlist: [49, 50] // Combo Gymmer Tăng Cơ Đốt Mỡ (49) & Combo Quà Tặng Gia Đình Tứ Quý (50)
    };
    users.push(linhUser);
    window.AuthService.saveUsers(users);
  }

  // Automatically log in Linh Ngô if no session exists
  const currentUser = window.AuthService.getCurrentUser();
  if (!currentUser) {
    localStorage.setItem("tqg_current_user", JSON.stringify(linhUser));
    window.dispatchEvent(new Event("authChanged"));
  }

  // Seed 12 orders for Linh Ngô
  if (window.OrderService) {
    const orders = window.OrderService.getOrders();
    const linhOrders = orders.filter(o => o.userId === "u_linh" || o.customerEmail === "ntthaolinhcv@gmail.com");

    if (linhOrders.length === 0) {
      const mockLinhOrders = [
        // 3 Chờ xác nhận
        {
          id: "TQG1024",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "COD",
          items: [
            { productId: 49, name: "Combo Gymmer Tăng Cơ Đốt Mỡ", price: 289000, quantity: 1, image: "images/Product_Images/03. Hình ảnh/combo/Gym Starter Box.png" }
          ],
          subtotal: 289000,
          shipping: 30000,
          discount: 0,
          total: 319000,
          status: "Chờ xác nhận",
          date: "2026-07-01T23:21:48.000Z",
          note: ""
        },
        {
          id: "TQG1023",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "COD",
          items: [
            { productId: 1, name: "Xoài cát Hòa Lộc", price: 95000, quantity: 2, image: "images/fruits/Xoài cát Hòa Lộc.png" }
          ],
          subtotal: 190000,
          shipping: 30000,
          discount: 0,
          total: 220000,
          status: "Chờ xác nhận",
          date: "2026-07-01T15:10:00.000Z",
          note: ""
        },
        {
          id: "TQG1022",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "COD",
          items: [
            { productId: 10, name: "Bưởi da xanh Bến Tre", price: 85000, quantity: 1, image: "images/fruits/Bưởi da xanh.png" }
          ],
          subtotal: 85000,
          shipping: 30000,
          discount: 0,
          total: 115000,
          status: "Chờ xác nhận",
          date: "2026-06-30T10:05:00.000Z",
          note: ""
        },
        // 4 Đang giao
        {
          id: "TQG1021",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "COD",
          items: [
            { productId: 3, name: "Ổi Ruby không hạt", price: 45000, quantity: 3, image: "images/fruits/Ổi Ruby.png" }
          ],
          subtotal: 135000,
          shipping: 30000,
          discount: 10000,
          total: 155000,
          status: "Đang giao",
          date: "2026-06-29T09:30:00.000Z",
          note: "Giao giờ hành chính"
        },
        {
          id: "TQG1020",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "E-wallet",
          items: [
            { productId: 47, name: "Granola hạt & trái cây tự nhiên", price: 129000, quantity: 1, image: "images/granola/Granola.png" }
          ],
          subtotal: 129000,
          shipping: 15000,
          discount: 0,
          total: 144000,
          status: "Đang giao",
          date: "2026-06-28T08:20:00.000Z",
          note: ""
        },
        {
          id: "TQG1019",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "COD",
          items: [
            { productId: 2, name: "Cam xoàn Lai Vung", price: 65000, quantity: 2, image: "images/fruits/Quýt đường.png" }
          ],
          subtotal: 130000,
          shipping: 30000,
          discount: 0,
          total: 160000,
          status: "Đang giao",
          date: "2026-06-28T14:40:00.000Z",
          note: ""
        },
        {
          id: "TQG1018",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "E-wallet",
          items: [
            { productId: 6, name: "Bơ sáp Đắk Lắk", price: 55000, quantity: 2, image: "images/fruits/Bơ.png" }
          ],
          subtotal: 110000,
          shipping: 20000,
          discount: 0,
          total: 130000,
          status: "Đang giao",
          date: "2026-06-27T11:15:00.000Z",
          note: ""
        },
        // 5 Hoàn thành
        {
          id: "TQG1017",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "COD",
          items: [
            { productId: 50, name: "Combo Quà Tặng Gia Đình Tứ Quý", price: 399000, quantity: 1, image: "images/Product_Images/03. Hình ảnh/combo/Healthy Gift Box.png" }
          ],
          subtotal: 399000,
          shipping: 30000,
          discount: 50000,
          total: 379000,
          status: "Hoàn thành",
          date: "2026-06-26T16:00:00.000Z",
          note: ""
        },
        {
          id: "TQG1016",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "E-wallet",
          items: [
            { productId: 14, name: "Sầu riêng Musang King", price: 250000, quantity: 1, image: "images/fruits/Sầu riêng Musang.png" }
          ],
          subtotal: 250000,
          shipping: 0,
          discount: 20000,
          total: 230000,
          status: "Hoàn thành",
          date: "2026-06-25T09:20:00.000Z",
          note: ""
        },
        {
          id: "TQG1015",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "COD",
          items: [
            { productId: 45, name: "Mix Hạt Dinh Dưỡng 5 loại cao cấp", price: 149000, quantity: 2, image: "images/granola/Mix hạt.png" }
          ],
          subtotal: 298000,
          shipping: 30000,
          discount: 0,
          total: 328000,
          status: "Hoàn thành",
          date: "2026-06-24T14:35:00.000Z",
          note: ""
        },
        {
          id: "TQG1014",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "COD",
          items: [
            { productId: 12, name: "Dừa xiêm xanh gọt trọc", price: 25000, quantity: 4, image: "images/fruits/Dừa xiêm.png" }
          ],
          subtotal: 100000,
          shipping: 30000,
          discount: 0,
          total: 130000,
          status: "Hoàn thành",
          date: "2026-06-23T10:10:00.000Z",
          note: ""
        },
        {
          id: "TQG1013",
          userId: "u_linh",
          customerName: "Linh Ngô",
          customerPhone: "0911181438",
          customerEmail: "ntthaolinhcv@gmail.com",
          address: "Số 12, Đường Hoa Sứ, Phường 7, Quận Phú Nhuận, TP. Hồ Chí Minh",
          paymentMethod: "COD",
          items: [
            { productId: 13, name: "Dứa mật MD2 cao cấp", price: 45000, quantity: 2, image: "images/fruits/Dứa mật.png" }
          ],
          subtotal: 90000,
          shipping: 30000,
          discount: 0,
          total: 120000,
          status: "Hoàn thành",
          date: "2026-06-22T15:30:00.000Z",
          note: ""
        }
      ];
      orders.unshift(...mockLinhOrders);
      window.OrderService.saveOrders(orders);
    }
  }
}

// Prefill form inputs
function prefillProfileForm(user) {
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const phoneInput = document.getElementById("profile-phone");
  const goalText = document.getElementById("profile-goal-text");
  const goalSelect = document.getElementById("profile-goal");

  if (nameInput) nameInput.value = user.name;
  if (emailInput) {
    emailInput.value = user.email;
    emailInput.dataset.originalEmail = user.email;
  }
  if (phoneInput) phoneInput.value = user.phone || "";
  
  const healthGoalVal = user.healthGoal || "Eat Clean";
  if (goalText) goalText.value = healthGoalVal;
  if (goalSelect) {
    goalSelect.value = healthGoalVal;
    goalSelect.disabled = true;
  }

  const displayBadge = document.getElementById("health-goal-badge-display");
  if (displayBadge) displayBadge.innerText = healthGoalVal;

  // Bind Submit handler
  const editForm = document.getElementById("profile-edit-form");
  if (editForm) {
    editForm.removeEventListener("submit", handleProfileSave);
    editForm.addEventListener("submit", handleProfileSave);
  }
}

// Update UI display
function updateUserInterface(user) {
  const sideName = document.getElementById("profile-sidebar-name");
  const sideEmail = document.getElementById("profile-sidebar-email");
  const avatarChar = document.getElementById("profile-avatar-char");

  if (sideName) sideName.innerText = user.name;
  if (sideEmail) sideEmail.innerText = user.email;
  if (avatarChar && !avatarChar.querySelector("img")) avatarChar.innerText = getUserInitial(user);
}

function getUserInitial(user) {
  return (user && user.name ? user.name.trim().charAt(0) : "U").toUpperCase();
}

function getAvatarStorageKey() {
  const currentUser = window.AuthService ? window.AuthService.getCurrentUser() : null;
  const userKey = currentUser && (currentUser.id || currentUser.email);
  return userKey ? `tqg_avatar_${userKey}` : "tqg_avatar_guest";
}

function renderAvatarImage(dataUrl) {
  const avatar = document.getElementById("profile-avatar-char");
  const wrapper = document.querySelector(".profile-avatar-wrapper");
  if (!avatar) return;

  avatar.innerHTML = "";
  if (dataUrl) {
    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "Ảnh đại diện";
    img.className = "avatar-preview-img";
    avatar.appendChild(img);
    if (wrapper) wrapper.classList.add("has-avatar");
    return;
  }

  avatar.innerText = getUserInitial(window.AuthService ? window.AuthService.getCurrentUser() : null);
  if (wrapper) wrapper.classList.remove("has-avatar");
}

window.loadSavedAvatar = function() {
  const savedAvatar = localStorage.getItem(getAvatarStorageKey());
  renderAvatarImage(savedAvatar);
};

window.triggerAvatarUpload = function() {
  const input = document.getElementById("avatar-upload-input") || document.getElementById("avatar-file-input");
  if (input) input.click();
};

window.handleAvatarUpload = function(event) {
  const input = event && event.target;
  const file = input && input.files ? input.files[0] : null;
  if (!file) return;

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    window.showToast("Vui lòng chọn file ảnh hợp lệ", "error");
    input.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    window.showToast("Ảnh đại diện không được vượt quá 2MB", "error");
    input.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    localStorage.setItem(getAvatarStorageKey(), dataUrl);
    renderAvatarImage(dataUrl);
    window.showToast("Đã cập nhật ảnh đại diện", "success");
    input.value = "";
  };
  reader.onerror = () => {
    window.showToast("Vui lòng chọn file ảnh hợp lệ", "error");
    input.value = "";
  };
  reader.readAsDataURL(file);
};

window.removeAvatar = function(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  localStorage.removeItem(getAvatarStorageKey());
  renderAvatarImage(null);
  window.showToast("Đã xóa ảnh đại diện", "success");
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

let pendingEmailChange = null;
let pendingProfileChange = null;

function updateCurrentUserEmail(newEmail) {
  if (!window.AuthService) return false;
  const currentUser = window.AuthService.getCurrentUser();
  if (!currentUser) return false;

  const users = window.AuthService.getUsers();
  const userIdx = users.findIndex(u => u.id === currentUser.id);
  if (userIdx === -1) return false;

  users[userIdx].email = newEmail;
  window.AuthService.saveUsers(users);
  localStorage.setItem("tqg_current_user", JSON.stringify(users[userIdx]));
  window.dispatchEvent(new Event("authChanged"));
  return true;
}

function saveProfileCore(name, phone, goal, successMessage) {
  if (!window.AuthService) return false;
  const result = window.AuthService.updateProfile(name, phone, goal);

  if (!result.success) {
    window.showToast(result.message, "error");
    return false;
  }

  const updatedUser = window.AuthService.getCurrentUser();
  updateUserInterface(updatedUser);
  prefillProfileForm(updatedUser);
  loadSavedAvatar();
  cancelEditMode();
  if (window.updateHeaderState) window.updateHeaderState();
  window.showToast(successMessage || result.message || "Lưu thông tin thành công", "success");
  return true;
}

window.openEmailOtpModal = function(newEmail) {
  pendingEmailChange = newEmail;
  const modal = document.getElementById("email-otp-modal");
  const input = document.getElementById("email-otp-input");
  const error = document.getElementById("email-otp-error");
  if (input) {
    input.value = "";
    input.classList.remove("error");
  }
  if (error) error.style.display = "none";
  if (modal) {
    modal.hidden = false;
    modal.style.display = "flex";
    setTimeout(() => input && input.focus(), 50);
  }
};

window.closeEmailOtpModal = function() {
  const modal = document.getElementById("email-otp-modal");
  if (modal) {
    modal.hidden = true;
    modal.style.display = "none";
  }
  pendingEmailChange = null;
};

function getRewardModalHtml() {
  return `
    <div class="profile-modal-card reward-modal-card" role="dialog" aria-modal="true" aria-labelledby="reward-modal-title">
      <button type="button" class="profile-modal-close" onclick="closeRewardModal()" aria-label="Đóng modal">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="reward-modal-header">
        <div class="reward-modal-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2f6b3f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <line x1="12" y1="22" x2="12" y2="7"></line>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
          </svg>
        </div>
        <div>
          <h3 class="profile-modal-title" id="reward-modal-title">Chi tiết điểm thưởng</h3>
          <p class="profile-modal-subtitle">Điểm thưởng của bạn tại Tứ Quý Garden</p>
        </div>
      </div>

      <div class="reward-modal-grid">
        <section class="reward-summary-box" aria-label="Tổng điểm hiện có">
          <div class="reward-modal-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b68118" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"></path>
              <path d="M5 20h14"></path>
            </svg>
          </div>
          <div>
            <p class="reward-section-title">Tổng điểm hiện có</p>
            <p class="reward-modal-points">1.250 <span style="font-size:16px;">điểm</span></p>
            <div class="reward-rank-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Hạng hiện tại: Khách hàng thân thiết</span>
            </div>
          </div>
        </section>

        <section class="reward-progress-box" aria-label="Tiến trình lên hạng">
          <div class="reward-progress-heading">
            <span>Tiến trình lên hạng Vàng</span>
            <span class="reward-progress-percent">62.5%</span>
          </div>
          <div class="reward-progress-bar-bg">
            <div class="reward-progress-bar-fill" style="width: 62.5%;"></div>
          </div>
          <div class="reward-progress-labels">
            <span><strong>1.250</strong> / 2.000 điểm</span>
            <span>2.000 điểm</span>
          </div>
          <div class="reward-next-rank-note">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="#f2c84b" stroke="#d49a18" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>Cần thêm 750 điểm để lên hạng Vàng</span>
          </div>
        </section>
      </div>

      <div class="reward-exchange-box">
        <p class="reward-section-title" style="margin-bottom:8px; color:#2f6b3f;">Quy đổi điểm</p>
        <strong>100 điểm = 10.000đ</strong>
      </div>

      <section class="reward-benefits-box" aria-label="Quyền lợi thành viên">
        <p class="reward-section-title">Quyền lợi thành viên</p>
        <ul class="reward-benefits-list">
          <li>Tích điểm mỗi đơn hàng</li>
          <li>Dùng điểm giảm giá khi thanh toán</li>
          <li>Voucher sinh nhật</li>
          <li>Ưu đãi combo theo mùa</li>
          <li>Ưu tiên tư vấn dinh dưỡng</li>
        </ul>
      </section>

      <a class="reward-modal-cta" href="checkout.html">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L21 6H6"></path>
        </svg>
        <span>Dùng điểm ở trang thanh toán</span>
      </a>
      <p class="reward-modal-helper">Điểm có thể dùng khi đơn hàng đủ điều kiện áp dụng ưu đãi.</p>
    </div>
  `;
}

window.openRewardModal = function() {
  let modal = document.getElementById("reward-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "reward-modal";
    modal.className = "profile-modal-overlay";
    modal.hidden = true;
    modal.style.display = "none";
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        window.closeRewardModal();
      }
    });
    document.body.appendChild(modal);
  }

  modal.innerHTML = getRewardModalHtml();
  modal.hidden = false;
  modal.style.display = "flex";
  document.addEventListener("keydown", handleRewardModalKeydown);

  const closeBtn = modal.querySelector(".profile-modal-close");
  setTimeout(() => closeBtn && closeBtn.focus(), 50);
};

window.closeRewardModal = function() {
  const modal = document.getElementById("reward-modal");
  if (modal) {
    modal.hidden = true;
    modal.style.display = "none";
    modal.innerHTML = "";
  }
  document.removeEventListener("keydown", handleRewardModalKeydown);
};

function handleRewardModalKeydown(event) {
  if (event.key === "Escape") {
    window.closeRewardModal();
  }
}

window.confirmEmailOtp = function() {
  const input = document.getElementById("email-otp-input");
  const error = document.getElementById("email-otp-error");
  const otp = input ? input.value.trim() : "";

  if (otp !== "123456") {
    if (input) input.classList.add("error");
    if (error) error.style.display = "block";
    window.showToast("Mã OTP không đúng", "error");
    return;
  }

  if (!pendingProfileChange || !pendingEmailChange) {
    closeEmailOtpModal();
    return;
  }

  if (!saveProfileCore(pendingProfileChange.name, pendingProfileChange.phone, pendingProfileChange.goal, "Lưu thông tin thành công")) {
    return;
  }

  if (updateCurrentUserEmail(pendingEmailChange)) {
    const updatedUser = window.AuthService.getCurrentUser();
    updateUserInterface(updatedUser);
    prefillProfileForm(updatedUser);
    closeEmailOtpModal();
    cancelEditMode();
    window.showToast("Đã cập nhật email thành công", "success");
  }

  pendingProfileChange = null;
  pendingEmailChange = null;
};

if (typeof window.showToast !== "function") {
  window.showToast = function(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "profile-toast-container";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `profile-toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };
}

// Profile Tab Switcher
window.switchProfileTab = function(tabName) {
  const tabs = ["info", "orders", "wishlist"];
  tabs.forEach(t => {
    const btn = document.getElementById(`menu-tab-${t}`);
    const panel = document.getElementById(`panel-${t}`);
    if (btn) btn.classList.remove("active");
    if (panel) panel.style.display = "none";
  });

  const activeBtn = document.getElementById(`menu-tab-${tabName}`);
  const activePanel = document.getElementById(`panel-${tabName}`);

  if (activeBtn) activeBtn.classList.add("active");
  if (activePanel) {
    activePanel.style.display = "block";
    
    if (tabName === "orders") {
      renderOrderHistory();
    } else if (tabName === "wishlist") {
      renderWishlist();
    }
  }
};

// Edit Mode toggles
let isEditModeActive = false;
window.toggleEditMode = function() {
  isEditModeActive = true;
  
  const nameInput = document.getElementById("profile-name");
  const phoneInput = document.getElementById("profile-phone");
  const emailInput = document.getElementById("profile-email");

  if (nameInput) nameInput.disabled = false;
  if (phoneInput) phoneInput.disabled = false;
  if (emailInput) emailInput.disabled = false;

  const emailHelper = document.getElementById("email-helper-text");
  if (emailHelper) emailHelper.classList.add("visible");
  
  // Switch Health Goal input to Select
  document.getElementById("profile-goal-text").style.display = "none";
  const goalSelect = document.getElementById("profile-goal");
  if (goalSelect) {
    goalSelect.style.display = "block";
    goalSelect.disabled = false;
    goalSelect.className = "profile-select-hidden";
  }
  
  // Hide Edit toggle, show actions
  document.getElementById("btn-edit-toggle").style.display = "none";
  document.getElementById("form-edit-actions").style.display = "flex";
};

window.cancelEditMode = function() {
  isEditModeActive = false;
  
  const currentUser = window.AuthService.getCurrentUser();
  prefillProfileForm(currentUser);
  
  const nameInput = document.getElementById("profile-name");
  const phoneInput = document.getElementById("profile-phone");
  const emailInput = document.getElementById("profile-email");

  if (nameInput) nameInput.disabled = true;
  if (phoneInput) phoneInput.disabled = true;
  if (emailInput) emailInput.disabled = true;

  const emailHelper = document.getElementById("email-helper-text");
  if (emailHelper) emailHelper.classList.remove("visible");
  
  // Switch Health Goal select back to text input
  document.getElementById("profile-goal-text").style.display = "block";
  const goalSelect = document.getElementById("profile-goal");
  if (goalSelect) {
    goalSelect.style.display = "none";
    goalSelect.disabled = true;
  }
  
  // Show Edit toggle, hide actions
  document.getElementById("btn-edit-toggle").style.display = "flex";
  document.getElementById("form-edit-actions").style.display = "none";
};

// Handle Profile Save
function handleProfileSave(e) {
  e.preventDefault();

  const name = document.getElementById("profile-name").value.trim();
  const emailInput = document.getElementById("profile-email");
  const email = emailInput ? emailInput.value.trim() : "";
  const oldEmail = emailInput ? (emailInput.dataset.originalEmail || "") : "";
  const phone = document.getElementById("profile-phone").value.trim();
  const goal = document.getElementById("profile-goal").value;

  if (!window.AuthService) return;

  if (!email || !isValidEmail(email)) {
    window.showToast("Email không hợp lệ", "error");
    if (emailInput) emailInput.focus();
    return;
  }

  pendingProfileChange = { name, phone, goal };

  if (email !== oldEmail) {
    openEmailOtpModal(email);
    return;
  }

  if (saveProfileCore(name, phone, goal, "Lưu thông tin thành công")) {
    pendingProfileChange = null;
  }
}

// Filter orders
let activeOrderFilter = "Tất cả";
let activeOrderSearch = "";

window.filterOrdersByStatus = function(status) {
  activeOrderFilter = status;
  
  // Update chip active styles
  const chipMap = {
    "Tất cả": "chip-filter-All",
    "Chờ xác nhận": "chip-filter-Pending",
    "Đang giao": "chip-filter-Shipping",
    "Hoàn thành": "chip-filter-Completed",
    "Đã hủy": "chip-filter-Cancelled"
  };
  Object.entries(chipMap).forEach(([s, id]) => {
    const chip = document.getElementById(id);
    if (chip) chip.classList.toggle("active", s === status);
  });

  renderOrderHistory();
};

// Search handler
window.handleOrderSearch = function(value) {
  activeOrderSearch = value.trim();
  const clearBtn = document.getElementById("btn-clear-search");
  if (clearBtn) clearBtn.classList.toggle("visible", activeOrderSearch.length > 0);
  renderOrderHistory();
};

window.clearOrderSearch = function() {
  activeOrderSearch = "";
  const input = document.getElementById("order-search-input");
  if (input) input.value = "";
  const clearBtn = document.getElementById("btn-clear-search");
  if (clearBtn) clearBtn.classList.remove("visible");
  renderOrderHistory();
};

// Re-purchase order items
window.buyOrderAgain = function(orderId) {
  if (!window.OrderService || !window.CartService) return;
  const order = window.OrderService.getOrderById(orderId);
  if (order) {
    order.items.forEach(item => {
      window.CartService.addToCart(item.productId, item.quantity);
    });
    window.showToast("Đã thêm các sản phẩm trong đơn hàng vào giỏ!", "success");
    if (window.updateHeaderState) window.updateHeaderState();
  }
};

// Render User Order History
function renderOrderHistory() {
  const filter = activeOrderFilter;
  const searchKeyword = activeOrderSearch.toLowerCase();

  const container = document.getElementById("order-history-container");
  if (!container || !window.OrderService || !window.AuthService) return;

  const currentUser = window.AuthService.getCurrentUser();
  const orders = window.OrderService.getUserOrders(currentUser.id);

  // Update Statistics (always based on full list)
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status === "Chờ xác nhận").length;
  const shippingCount = orders.filter(o => o.status === "Đang giao" || o.status === "Đang xử lý").length;
  const completedCount = orders.filter(o => o.status === "Hoàn thành").length;

  const totalEl = document.getElementById("summary-total-count");
  const pendingEl = document.getElementById("summary-pending-count");
  const shippingEl = document.getElementById("summary-shipping-count");
  const completedEl = document.getElementById("summary-completed-count");

  if (totalEl) totalEl.innerText = totalCount;
  if (pendingEl) pendingEl.innerText = pendingCount;
  if (shippingEl) shippingEl.innerText = shippingCount;
  if (completedEl) completedEl.innerText = completedCount;

  // Step 1: Filter by status
  let filteredOrders = orders;
  if (filter === "Chờ xác nhận") {
    filteredOrders = orders.filter(o => o.status === "Chờ xác nhận");
  } else if (filter === "Đang giao") {
    filteredOrders = orders.filter(o => o.status === "Đang giao" || o.status === "Đang xử lý");
  } else if (filter === "Hoàn thành") {
    filteredOrders = orders.filter(o => o.status === "Hoàn thành");
  } else if (filter === "Đã hủy") {
    filteredOrders = orders.filter(o => o.status === "Đã hủy" || o.status === "Trả hàng/Hoàn tiền");
  }

  // Step 2: Filter by search keyword (case-insensitive, diacritic-aware)
  if (searchKeyword) {
    filteredOrders = filteredOrders.filter(order =>
      order.items.some(item =>
        item.name.toLowerCase().includes(searchKeyword)
      )
    );
  }

  if (filteredOrders.length === 0) {
    const emptyMsg = searchKeyword
      ? `Không tìm thấy đơn hàng nào chứa sản phẩm "<strong>${activeOrderSearch}</strong>".`
      : "Không có đơn hàng nào ở trạng thái này.";
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 0; color: var(--color-text-light);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d0cbc3" stroke-width="1.5" style="margin-bottom:16px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        <p style="margin-bottom:12px;">${emptyMsg}</p>
        ${searchKeyword ? `<button onclick="clearOrderSearch()" style="background:#edf5ea; border:none; color:#2f6b3f; padding:8px 20px; border-radius:50px; font-size:13px; cursor:pointer; font-weight:600;">Xóa tìm kiếm</button>` : `<a href="products.html" class="btn btn-outline" style="margin-top: 15px; display:inline-block;">Mua sắm ngay</a>`}
      </div>
    `;
    return;
  }

  const isEn = document.body.classList.contains("lang-en");

  // Dynamically translate search bar placeholder based on current language
  const searchInput = document.getElementById("order-search-input");
  if (searchInput) {
    searchInput.placeholder = isEn ? "Search by product name..." : "Tìm kiếm theo tên sản phẩm...";
  }

  container.innerHTML = filteredOrders.map(order => {
    const itemsHTML = order.items.map(item => {
      const prod = window.MOCK_PRODUCTS ? window.MOCK_PRODUCTS.find(p => p.id === Number(item.productId)) : null;
      const imgPath = prod ? prod.image : item.image;
      return `
        <div class="order-item-row">
          <img src="${imgPath}" alt="${item.name}" class="order-item-thumb">
          <div style="flex:1;">
            <h5 style="margin:0; font-size:14px; font-weight:600; color:var(--color-text-dark);">${item.name}</h5>
            <span style="font-size:12px; color:var(--color-text-light);">${window.formatVND ? window.formatVND(item.price) : item.price + 'đ'} x ${item.quantity}</span>
          </div>
          <strong style="color:var(--color-text-dark); font-size:14px;">${window.formatVND ? window.formatVND(item.price * item.quantity) : (item.price * item.quantity) + 'đ'}</strong>
        </div>
      `;
    }).join("");

    // Setup class based on status
    let statusClass = "status-cho-xac-nhan";
    if (order.status === "Đang xử lý") statusClass = "status-dang-xu-ly";
    if (order.status === "Đang giao") statusClass = "status-dang-giao";
    if (order.status === "Hoàn thành") statusClass = "status-hoan-thanh";
    if (order.status === "Đã hủy") statusClass = "status-da-huy";
    if (order.status === "Trả hàng/Hoàn tiền") statusClass = "status-tra-hang-hoan-tien";

    // Translate status for EN
    let statusLabel = order.status;
    if (isEn) {
      const trans = {
        "Chờ xác nhận": "Pending",
        "Đang xử lý": "Processing",
        "Đang giao": "Shipping",
        "Hoàn thành": "Completed",
        "Đã hủy": "Cancelled",
        "Trả hàng/Hoàn tiền": "Returned/Refunded"
      };
      statusLabel = trans[order.status] || order.status;
    }

    // Progress bar width and active steps for timeline
    let timelineHTML = "";
    if (order.status === "Trả hàng/Hoàn tiền") {
      timelineHTML = `
        <div style="padding: 12px; text-align: center; color: #b45309; font-weight: 600; background: #fffbeb; border: 1px solid rgba(180, 83, 9, 0.15); border-radius: 8px; font-size:13px; margin: 15px 0;">
          ${isEn 
            ? "This order has been returned and refunded." 
            : "Đơn hàng này đã được trả hàng và hoàn tiền thành công."
          }
        </div>
      `;
    } else if (order.status !== "Đã hủy") {
      let progressWidth = "0%";
      let step1 = "completed", step2 = "", step3 = "", step4 = "";

      if (order.status === "Chờ xác nhận") {
        progressWidth = "0%";
        step1 = "active";
      } else if (order.status === "Đang xử lý") {
        progressWidth = "33.33%";
        step1 = "completed";
        step2 = "active";
      } else if (order.status === "Đang giao") {
        progressWidth = "66.66%";
        step1 = "completed";
        step2 = "completed";
        step3 = "active";
      } else if (order.status === "Hoàn thành") {
        progressWidth = "100%";
        step1 = "completed";
        step2 = "completed";
        step3 = "completed";
        step4 = "active"; // active means highlighted and final node
      }

      // Render step dates/times
      const orderDateStr = new Date(order.date).toLocaleDateString("vi-VN");
      const orderTimeStr = new Date(order.date).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });

      const step1Label = isEn ? "Pending" : "Chờ xác nhận";
      const step2Label = isEn ? "Preparing" : "Đang chuẩn bị";
      const step3Label = isEn ? "Shipping" : "Đang giao";
      const step4Label = isEn ? "Delivered" : "Đã giao";

      timelineHTML = `
        <div class="stepper-timeline">
          <div class="stepper-line"></div>
          <div class="stepper-progress" style="width: ${progressWidth};"></div>
          
          <div class="stepper-step ${step1}">
            <div class="step-circle">✓</div>
            <div class="step-label">${step1Label}</div>
            <div class="step-date">${orderTimeStr} ${orderDateStr}</div>
          </div>
          
          <div class="stepper-step ${step2 || (progressWidth === "100%" || progressWidth === "66.66%" ? "completed" : "")}">
            <div class="step-circle">📦</div>
            <div class="step-label">${step2Label}</div>
            <div class="step-date"></div>
          </div>
          
          <div class="stepper-step ${step3 || (progressWidth === "100%" ? "completed" : "")}">
            <div class="step-circle">🚚</div>
            <div class="step-label">${step3Label}</div>
            <div class="step-date"></div>
          </div>
          
          <div class="stepper-step ${step4}">
            <div class="step-circle">✓</div>
            <div class="step-label">${step4Label}</div>
            <div class="step-date"></div>
          </div>
        </div>
      `;
    } else {
      timelineHTML = `
        <div style="padding: 10px 0; text-align: center; color: var(--color-danger); font-weight: 500;">
          ${isEn ? "This order has been cancelled." : "Đơn hàng này đã bị hủy bỏ."}
        </div>
      `;
    }

    const orderFormattedDate = new Date(order.date).toLocaleDateString("vi-VN") + " " + new Date(order.date).toLocaleTimeString("vi-VN");

    const deliveryAddressLabel = isEn ? "Shipping Address" : "Địa chỉ giao hàng";
    const paymentMethodLabel = isEn ? "Payment Method" : "Phương thức thanh toán";
    const codText = isEn ? "Cash on Delivery (COD)" : "Thanh toán khi nhận hàng (COD)";
    const noteLabel = isEn ? "Note" : "Ghi chú";
    const noNoteText = isEn ? "No notes" : "Không có ghi chú";
    const paymentDetailsLabel = isEn ? "Payment Details" : "Chi tiết thanh toán";
    
    const subtotalLabel = isEn ? "Subtotal:" : "Tạm tính:";
    const shippingLabel = isEn ? "Shipping Fee:" : "Phí vận chuyển:";
    const discountLabel = isEn ? "Discount:" : "Giảm giá:";
    const totalLabel = isEn ? "Total:" : "Tổng cộng:";

    const viewDetailsLabel = isEn ? "View Details" : "Xem chi tiết";
    const buyAgainLabel = isEn ? "Reorder" : "Mua lại";
    const cancelOrderLabel = isEn ? "Cancel Order" : "Hủy đơn";
    const receivedGoodsLabel = isEn ? "Received Goods" : "Đã nhận được hàng";
    const requestRefundLabel = isEn ? "Request Return / Refund" : "Yêu cầu trả hàng / Hoàn tiền";

    // Action buttons based on current status
    let cancelBtnHTML = "";
    if (order.status === "Chờ xác nhận" || order.status === "Đang xử lý" || order.status === "Đang chuẩn bị") {
      cancelBtnHTML = `<button class="btn-cancel-order" onclick="cancelOrder('${order.id}')">${cancelOrderLabel}</button>`;
    }

    const receivedBtnHTML = order.status === "Đang giao"
      ? `<button class="btn-received-goods" onclick="markOrderReceived('${order.id}')">${receivedGoodsLabel}</button>`
      : "";

    let refundBtnHTML = "";
    if (order.status === "Hoàn thành") {
      if (order.refundRequest) {
        let reqStatusText = "";
        let color = "";
        if (order.refundRequest.status === "pending") {
          reqStatusText = isEn ? "Refund Pending" : "Đang chờ duyệt hoàn tiền";
          color = "#d97706";
        } else if (order.refundRequest.status === "approved") {
          reqStatusText = isEn ? "Refund Approved" : "Đã hoàn tiền";
          color = "#15803d";
        } else if (order.refundRequest.status === "rejected") {
          reqStatusText = isEn ? "Refund Rejected" : "Từ chối hoàn tiền";
          color = "#b91c1c";
        }
        refundBtnHTML = `<span style="font-size:12px; font-weight:700; color:${color}; padding:6px 12px; display:inline-block; border-radius:4px; background:rgba(0,0,0,0.03); border:1px solid rgba(0,0,0,0.05); margin-top:10px;">ℹ️ ${reqStatusText}</span>`;
      } else {
        refundBtnHTML = `<button class="btn-request-refund" onclick="requestOrderRefund('${order.id}')">${requestRefundLabel}</button>`;
      }
    }

    return `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <strong style="color:var(--color-primary); font-size:15px;">#${order.id}</strong>
            <span style="margin: 0 10px; color: #e8e2d7;">|</span>
            <span style="color:#7c776e;">${orderFormattedDate}</span>
          </div>
          <span class="order-status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="order-card-body">
          ${itemsHTML}
          
          ${timelineHTML}

          <div class="order-details-grid">
            <div>
              <h5 class="details-section-title">${deliveryAddressLabel}</h5>
              <div class="detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${order.address}</span>
              </div>
              
              <h5 class="details-section-title" style="margin-top: 15px;">${paymentMethodLabel}</h5>
              <div class="detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                <span>${order.paymentMethod === "COD" ? codText : order.paymentMethod}</span>
              </div>

              <h5 class="details-section-title" style="margin-top: 15px;">${noteLabel}</h5>
              <div class="detail-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>${order.note || noNoteText}</span>
              </div>
            </div>

            <div>
              <h5 class="details-section-title">${paymentDetailsLabel}</h5>
              <div class="totals-box">
                <div class="totals-row">
                  <span>${subtotalLabel}</span>
                  <strong>${window.formatVND ? window.formatVND(order.subtotal) : order.subtotal + 'đ'}</strong>
                </div>
                <div class="totals-row">
                  <span>${shippingLabel}</span>
                  <strong>${window.formatVND ? window.formatVND(order.shipping) : order.shipping + 'đ'}</strong>
                </div>
                ${order.discount ? `
                <div class="totals-row" style="color:var(--color-danger);">
                  <span>${discountLabel}</span>
                  <strong>-${window.formatVND ? window.formatVND(order.discount) : order.discount + 'đ'}</strong>
                </div>` : ''}
                <div class="totals-row grand-total">
                  <span>${totalLabel}</span>
                  <span>${window.formatVND ? window.formatVND(order.total) : order.total + 'đ'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="order-card-actions">
          <button class="btn-view-details" onclick="showOrderDetailsModal('${order.id}')">${viewDetailsLabel}</button>
          <button class="btn-buy-again" onclick="buyOrderAgain('${order.id}')">${buyAgainLabel}</button>
          ${cancelBtnHTML}
          ${receivedBtnHTML}
          ${refundBtnHTML}
        </div>
      </div>
    `;
  }).join("");
}

// Show Order Details Modal
window.showOrderDetailsModal = function(orderId) {
  if (!window.OrderService) return;
  const order = window.OrderService.getOrderById(orderId);
  if (!order) return;

  const isEn = document.body.classList.contains("lang-en");
  const dateStr = new Date(order.date).toLocaleString(isEn ? "en-US" : "vi-VN");
  const itemsHTML = order.items.map(item => {
    const priceText = isEn ? "Price:" : "Đơn giá:";
    const qtyText = isEn ? "Qty:" : "Số lượng:";
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #e8e2d7;">
        <div>
          <strong style="color:#143b24; font-size:13.5px;">${item.name}</strong>
          <div style="font-size:12px; color:#7c776e;">${priceText} ${window.formatVND(item.price)} x ${qtyText} ${item.quantity}</div>
        </div>
        <strong style="color:#143b24;">${window.formatVND(item.price * item.quantity)}</strong>
      </div>
    `;
  }).join("");

  const modalTitle = isEn ? `Order Details #${order.id}` : `Chi tiết đơn hàng #${order.id}`;
  const orderTimeLabel = isEn ? "Ordered at:" : "Thời gian đặt:";
  const purchasedLabel = isEn ? "Purchased products:" : "Sản phẩm đã mua:";
  const subtotalLabel = isEn ? "Subtotal:" : "Tạm tính:";
  const shippingLabel = isEn ? "Shipping Fee:" : "Phí giao hàng:";
  const discountLabel = isEn ? "Discount:" : "Giảm giá:";
  const totalLabel = isEn ? "Total Amount:" : "Tổng số tiền:";

  const recipientLabel = isEn ? "Recipient:" : "Người nhận:";
  const phoneLabel = isEn ? "Phone:" : "Số điện thoại:";
  const shippingAddrLabel = isEn ? "Shipping Address:" : "Địa chỉ nhận hàng:";
  const paymentMethodLabelModal = isEn ? "Payment Method:" : "Phương thức thanh toán:";
  const closeBtnText = isEn ? "Close" : "Đóng";

  const content = `
    <div style="padding: 10px;">
      <h3 style="color:#143b24; font-size:18px; border-bottom:2px solid #2f6b3f; padding-bottom:10px; margin-bottom:15px;">${modalTitle}</h3>
      <p style="font-size:13px; color:#7c776e;">${orderTimeLabel} ${dateStr}</p>
      
      <div style="margin:15px 0;">
        <h4 style="color:#143b24; font-size:14px; margin-bottom:5px;">${purchasedLabel}</h4>
        ${itemsHTML}
      </div>

      <div style="background:#fbfaf6; border:1px solid #e8e2d7; border-radius:10px; padding:12px; font-size:13px; margin:15px 0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>${subtotalLabel}</span><strong>${window.formatVND(order.subtotal)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>${shippingLabel}</span><strong>${window.formatVND(order.shipping)}</strong>
        </div>
        ${order.discount ? `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:var(--color-danger);">
          <span>${discountLabel}</span><strong>-${window.formatVND(order.discount)}</strong>
        </div>` : ''}
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:14.5px; border-top:1px dashed #e8e2d7; padding-top:8px; margin-top:8px; color:#2f6b3f;">
          <span>${totalLabel}</span><strong>${window.formatVND(order.total)}</strong>
        </div>
      </div>

      <div style="font-size:13px; color:#143b24; line-height:1.4;">
        <p><strong>${recipientLabel}</strong> ${order.customerName}</p>
        <p><strong>${phoneLabel}</strong> ${order.customerPhone}</p>
        <p><strong>${shippingAddrLabel}</strong> ${order.address}</p>
        <p><strong>${paymentMethodLabelModal}</strong> ${order.paymentMethod === "COD" ? (isEn ? "Cash on Delivery (COD)" : "Thanh toán khi nhận hàng (COD)") : order.paymentMethod}</p>
      </div>

      <div style="display:flex; justify-content:center; margin-top:20px;">
        <button class="btn btn-primary" onclick="window.closeCustomModal()" style="padding:8px 25px;">${closeBtnText}</button>
      </div>
    </div>
  `;

  if (window.showCustomModal) {
    window.showCustomModal(content);
  }
};

// Render User Wishlist
let activeWishlistSort = "newest";
window.sortWishlistItems = function() {
  const sortSelect = document.getElementById("wishlist-sort-select");
  if (sortSelect) {
    activeWishlistSort = sortSelect.value;
    renderWishlist();
  }
};

function renderWishlist() {
  const container = document.getElementById("wishlist-items-container");
  const countBadge = document.getElementById("wishlist-count-badge");
  
  if (!container || !window.AuthService || !window.Components.ProductCard) return;

  const wishlistIds = window.AuthService.getWishlist();

  if (countBadge) {
    countBadge.innerText = `${wishlistIds.length} sản phẩm yêu thích`;
  }

  if (wishlistIds.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 0; color: var(--color-text-light); grid-column: 1 / -1;">
        <p><span class="lang-vi">Chưa có sản phẩm yêu thích nào.</span><span class="lang-en">Your wishlist is empty.</span></p>
        <a href="products.html" class="btn btn-outline" style="margin-top: 15px; display:inline-block;"><span class="lang-vi">Khám phá sản phẩm</span><span class="lang-en">Browse Products</span></a>
      </div>
    `;
    return;
  }

  // Get matching products from MOCK_PRODUCTS
  let wishlistProducts = wishlistIds.map(id => window.MOCK_PRODUCTS.find(p => p.id === id)).filter(Boolean);

  // Apply Sorting
  if (activeWishlistSort === "price-asc") {
    wishlistProducts.sort((a, b) => a.price - b.price);
  } else if (activeWishlistSort === "price-desc") {
    wishlistProducts.sort((a, b) => b.price - a.price);
  } // newest is the default order (insertion order)

  container.innerHTML = wishlistProducts.map(p => window.Components.ProductCard(p)).join("");
}

// Log out click handler
window.handleLogoutClick = function() {
  if (!window.AuthService) return;

  const confirmMsg = document.body.classList.contains("lang-en") 
    ? "Are you sure you want to log out?" 
    : "Bạn có chắc chắn muốn đăng xuất tài khoản?";

  window.showConfirmModal(confirmMsg, () => {
    window.AuthService.logout();
    window.showToast(
      document.body.classList.contains("lang-en") ? "Logged out successfully" : "Đã đăng xuất tài khoản", 
      "success"
    );
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  });
};

// Cancel Order (for Chờ xác nhận, Đang xử lý, Đang chuẩn bị)
window.cancelOrder = function(orderId) {
  if (!window.OrderService) return;

  const isEn = document.body.classList.contains("lang-en");
  const confirmMsg = isEn
    ? "Are you sure you want to cancel this order? This action cannot be undone."
    : "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.";

  window.showConfirmModal(confirmMsg, () => {
    const orders = window.OrderService.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;

    const cancelableStatuses = ["Chờ xác nhận", "Đang xử lý", "Đang chuẩn bị"];
    if (!cancelableStatuses.includes(orders[idx].status)) {
      window.showToast(isEn ? "This order can no longer be cancelled." : "Đơn hàng này không thể hủy nữa.", "error");
      return;
    }

    orders[idx].status = "Đã hủy";
    window.OrderService.saveOrders(orders);
    window.showToast(
      isEn ? `Order #${orderId} has been cancelled successfully.` : `Đơn hàng #${orderId} đã được hủy thành công.`,
      "success"
    );
    renderOrderHistory();
  });
};

// Mark Order as Received (for Đang giao)
window.markOrderReceived = function(orderId) {
  if (!window.OrderService) return;

  const isEn = document.body.classList.contains("lang-en");
  const confirmMsg = isEn
    ? "Confirm that you have received this order?"
    : "Xác nhận bạn đã nhận được đơn hàng này?";

  window.showConfirmModal(confirmMsg, () => {
    const orders = window.OrderService.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;

    if (orders[idx].status !== "Đang giao") {
      window.showToast(isEn ? "Order status has already changed." : "Trạng thái đơn hàng đã thay đổi.", "error");
      return;
    }

    orders[idx].status = "Hoàn thành";
    window.OrderService.saveOrders(orders);
    window.showToast(
      isEn ? `Order #${orderId} confirmed as received. Thank you!` : `Đơn hàng #${orderId} đã được xác nhận hoàn thành. Cảm ơn bạn!`,
      "success"
    );
    renderOrderHistory();
  });
};

// Request Return / Refund (for Hoàn thành)
window.requestOrderRefund = function(orderId) {
  if (!window.OrderService) return;

  const isEn = document.body.classList.contains("lang-en");

  const content = `
    <div style="padding: 10px;">
      <h3 style="color:#143b24; font-size:18px; border-bottom:2px solid #2f6b3f; padding-bottom:10px; margin-bottom:15px;">
        ${isEn ? "Return / Refund Request" : "Yêu cầu trả hàng / Hoàn tiền"}
      </h3>
      <p style="font-size:13px; color:#7c776e; margin-bottom:15px;">
        ${isEn
          ? `Order <strong>#${orderId}</strong> — Please select a reason and submit. Our support team will contact you within 24 hours.`
          : `Đơn hàng <strong>#${orderId}</strong> — Vui lòng chọn lý do và gửi yêu cầu. Đội ngũ hỗ trợ sẽ liên hệ trong vòng 24 giờ.`
        }
      </p>
      <div style="margin-bottom:12px;">
        <label style="font-size:13px; font-weight:600; color:#143b24; display:block; margin-bottom:6px;">${isEn ? "Reason:" : "Lý do:"}</label>
        <select id="refund-reason-select" style="width:100%; border:1px solid #e8e2d7; border-radius:8px; padding:8px 12px; font-size:13px; background:#fbfaf6; outline:none; color:#143b24;">
          <option value="wrong-product">${isEn ? "Wrong product received" : "Nhận sai sản phẩm"}</option>
          <option value="damaged">${isEn ? "Product damaged / expired" : "Sản phẩm bị hỏng / hết hạn"}</option>
          <option value="not-as-described">${isEn ? "Not as described" : "Không đúng mô tả"}</option>
          <option value="changed-mind">${isEn ? "Changed mind" : "Thay đổi ý định"}</option>
          <option value="other">${isEn ? "Other" : "Khác"}</option>
        </select>
      </div>
      <div style="margin-bottom:18px;">
        <label style="font-size:13px; font-weight:600; color:#143b24; display:block; margin-bottom:6px;">${isEn ? "Additional notes:" : "Ghi chú thêm:"}</label>
        <textarea id="refund-note-input" rows="3" placeholder="${isEn ? 'Describe your issue...' : 'Mô tả vấn đề của bạn...'}" style="width:100%; border:1px solid #e8e2d7; border-radius:8px; padding:8px 12px; font-size:13px; background:#fbfaf6; outline:none; color:#143b24; box-sizing:border-box; resize:vertical;"></textarea>
      </div>
      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button onclick="window.closeCustomModal()" style="border:1px solid #e8e2d7; background:white; color:#7c776e; padding:8px 20px; border-radius:8px; font-size:13px; cursor:pointer; font-weight:600;">${isEn ? "Cancel" : "Đóng"}</button>
        <button onclick="window.submitRefundRequest('${orderId}')" style="background:linear-gradient(135deg,#2f6b3f,#4D7C2F); border:none; color:white; padding:8px 20px; border-radius:8px; font-size:13px; cursor:pointer; font-weight:700; box-shadow:0 4px 10px rgba(47,107,63,0.25);">${isEn ? "Submit Request" : "Gửi yêu cầu"}</button>
      </div>
    </div>
  `;

  if (window.showCustomModal) {
    window.showCustomModal(content);
  }
};

window.submitRefundRequest = function(orderId) {
  const isEn = document.body.classList.contains("lang-en");
  const reasonEl = document.getElementById("refund-reason-select");
  const noteEl = document.getElementById("refund-note-input");
  const reason = reasonEl ? reasonEl.value : "other";
  const note = noteEl ? noteEl.value.trim() : "";

  // Save refund request metadata on the order
  if (window.OrderService) {
    const orders = window.OrderService.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].refundRequest = {
        status: "pending",
        reason,
        note,
        requestedAt: new Date().toISOString()
      };
      window.OrderService.saveOrders(orders);
    }
  }

  window.closeCustomModal();
  window.showToast(
    isEn
      ? `Return/refund request for order #${orderId} submitted. We'll contact you soon.`
      : `Đã gửi yêu cầu hoàn trả đơn hàng #${orderId}. Chúng tôi sẽ liên hệ sớm nhất.`,
    "success"
  );
  renderOrderHistory();
};
