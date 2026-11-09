// Server sessions are authoritative. Cached display data never grants access.
(() => {
  let currentUser = null;
  let users = [];
  const publish = user => {
    currentUser = user;
    localStorage.removeItem('tqg_users');
    localStorage.removeItem('tqg_current_user');
    window.dispatchEvent(new Event('authChanged'));
    return user;
  };
  const request = async (url, method = 'GET', body) => {
    if (window.angularApiRequest) return window.angularApiRequest(url, method, body);
    const response = await fetch(url, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'TuQuyGarden' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Không thể lưu dữ liệu');
    return data;
  };
  window.apiRequest = request;
  const action = async fn => {
    try { return await fn(); } catch (error) { return { success: false, message: error.message || 'Không kết nối được máy chủ' }; }
  };
  window.AuthService = {
    getCurrentUser: () => currentUser,
    getUsers: () => structuredClone(users),
    async refreshUsers() { users = await request('/api/users'); return users; },
    async refresh() {
      try { return publish(await request('/api/users/me')); }
      catch { return publish(null); }
    },
    register(name, email, phone, password, healthGoal = 'Eat Clean') {
      return action(() => request('/api/users/register', 'POST', { name, email, phone, password, healthGoal }));
    },
    login(email, password, rememberMe = false) {
      return action(async () => {
        const result = await request('/api/users/login', 'POST', { email, password, rememberMe });
        publish(result.user); return result;
      });
    },
    async logout() {
      const result = await action(() => request('/api/users/logout', 'POST', {}));
      if (result.success) { publish(null); window.OrderService?.clear(); }
      return result;
    },
    updateProfile(name, phone, healthGoal) { return this.saveProfile({ name, phone, healthGoal }); },
    saveProfile(data) {
      return action(async () => {
        const result = await request('/api/users/me', 'PUT', data);
        publish(result.user); return result;
      });
    },
    getWishlist: () => currentUser?.wishlist || [],
    isInWishlist(id) { return this.getWishlist().includes(id); },
    toggleWishlist(id) {
      return action(async () => {
        if (!currentUser) throw new Error('Vui lòng đăng nhập');
        const isAdded = !this.isInWishlist(id);
        const wishlist = isAdded ? [...this.getWishlist(), id] : this.getWishlist().filter(x => x !== id);
        const result = await this.saveProfile({ wishlist });
        if (result.success) window.dispatchEvent(new Event('wishlistChanged'));
        return { ...result, isAdded };
      });
    },
    changePassword(oldPassword, newPassword) { return action(() => request('/api/users/me/password', 'PUT', { oldPassword, newPassword })); },
    async deleteUser(id) { await request('/api/users/' + encodeURIComponent(id), 'DELETE'); await this.refreshUsers(); }
  };
  window.authReady = window.AuthService.refresh();
})();
