// services/authService.js
window.AuthService = {
  getUsers() {
    const users = localStorage.getItem("tqg_users");
    return users ? JSON.parse(users) : [
      {
        id: "admin",
        name: "Admin Quản trị viên",
        email: "admin@tuquygarden.vn",
        phone: "0901234567",
        password: "admin",
        healthGoal: "Gia đình",
        isAdmin: true
      }
    ];
  },

  saveUsers(users) {
    localStorage.setItem("tqg_users", JSON.stringify(users));
  },

  getCurrentUser() {
    const user = localStorage.getItem("tqg_current_user");
    return user ? JSON.parse(user) : null;
  },

  register(name, email, phone, password, healthGoal = "Eat Clean") {
    const users = this.getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, message: "Email này đã được đăng ký." };
    }

    const newUser = {
      id: "u_" + Date.now(),
      name,
      email,
      phone,
      password,
      healthGoal,
      isAdmin: false,
      wishlist: [],
      isNewUser: true,
      surveyCompleted: false
    };

    users.push(newUser);
    this.saveUsers(users);

    return { success: true, message: "Đăng ký tài khoản thành công! Vui lòng đăng nhập." };
  },

  loginOrRegisterGoogle(name, email) {
    const users = this.getUsers();
    let user = users.find(u => u.email === email);
    let isNew = false;
    
    if (!user) {
      user = {
        id: "u_" + Date.now(),
        name,
        email,
        phone: "Đăng nhập Google",
        password: "",
        healthGoal: "Eat Clean",
        isAdmin: false,
        wishlist: [],
        isNewUser: true,
        surveyCompleted: false
      };
      users.push(user);
      this.saveUsers(users);
      isNew = true;
    }
    
    // Set active session
    localStorage.setItem("tqg_current_user", JSON.stringify(user));
    
    if (user.isAdmin) {
      localStorage.removeItem("tqg_cart");
    }
    
    // Trigger login event
    window.dispatchEvent(new Event("authChanged"));
    return { success: true, message: `Chào mừng ${user.name} đăng nhập bằng Google thành công!`, user, isNew };
  },

  login(email, password, rememberMe = false) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return { success: false, message: "Email hoặc mật khẩu không chính xác." };
    }

    // Set active session
    localStorage.setItem("tqg_current_user", JSON.stringify(user));
    
    if (user.isAdmin) {
      localStorage.removeItem("tqg_cart");
    }

    // Trigger login event
    window.dispatchEvent(new Event("authChanged"));
    return { success: true, message: `Chào mừng ${user.name} quay trở lại!`, user };
  },

  logout() {
    localStorage.removeItem("tqg_current_user");
    window.dispatchEvent(new Event("authChanged"));
    return { success: true, message: "Đã đăng xuất tài khoản." };
  },

  updateProfile(name, phone, healthGoal) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: "Chưa đăng nhập." };

    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === currentUser.id);

    if (userIdx === -1) return { success: false, message: "Không tìm thấy người dùng." };

    users[userIdx].name = name;
    users[userIdx].phone = phone;
    users[userIdx].healthGoal = healthGoal;

    this.saveUsers(users);

    // Update session
    localStorage.setItem("tqg_current_user", JSON.stringify(users[userIdx]));
    window.dispatchEvent(new Event("authChanged"));

    return { success: true, message: "Cập nhật thông tin cá nhân thành công!" };
  },

  getWishlist() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];
    
    const users = this.getUsers();
    const user = users.find(u => u.id === currentUser.id);
    return user && user.wishlist ? user.wishlist : [];
  },

  toggleWishlist(productId) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: "Vui lòng đăng nhập để yêu thích sản phẩm." };

    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === currentUser.id);

    if (userIdx === -1) return { success: false, message: "Không tìm thấy người dùng." };

    if (!users[userIdx].wishlist) {
      users[userIdx].wishlist = [];
    }

    const itemIdx = users[userIdx].wishlist.indexOf(productId);
    let isAdded = false;

    if (itemIdx > -1) {
      users[userIdx].wishlist.splice(itemIdx, 1);
    } else {
      users[userIdx].wishlist.push(productId);
      isAdded = true;
    }

    this.saveUsers(users);
    
    // Update session
    localStorage.setItem("tqg_current_user", JSON.stringify(users[userIdx]));
    window.dispatchEvent(new Event("wishlistChanged"));

    return { 
      success: true, 
      message: isAdded ? "Đã thêm vào danh sách yêu thích." : "Đã xóa khỏi danh sách yêu thích.",
      isAdded
    };
  },

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  },

  changePassword(oldPassword, newPassword) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: "Chưa đăng nhập." };

    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === currentUser.id);

    if (userIdx === -1) return { success: false, message: "Không tìm thấy người dùng." };

    if (users[userIdx].password !== oldPassword) {
      return { success: false, message: "Mật khẩu cũ không chính xác." };
    }

    users[userIdx].password = newPassword;
    this.saveUsers(users);

    // Update session
    localStorage.setItem("tqg_current_user", JSON.stringify(users[userIdx]));

    return { success: true, message: "Đổi mật khẩu thành công!" };
  }
};

