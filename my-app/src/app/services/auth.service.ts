import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { MOCK_USERS } from '../data/users.data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initUsers();
    const savedUser = localStorage.getItem('tqg_current_user');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        this.currentUserSubject.next(null);
      }
    }
  }

  private initUsers() {
    if (!localStorage.getItem('tqg_users')) {
      localStorage.setItem('tqg_users', JSON.stringify(MOCK_USERS));
    }
  }

  getUsers(): User[] {
    const users = localStorage.getItem('tqg_users');
    return users ? JSON.parse(users) : MOCK_USERS;
  }

  saveUsers(users: User[]) {
    localStorage.setItem('tqg_users', JSON.stringify(users));
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem('tqg_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tqg_current_user');
    }
    this.currentUserSubject.next(user);
  }

  login(identifier: string, password: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const user = users.find(u =>
      (u.email.toLowerCase() === cleanId || (u.phone && u.phone.trim() === cleanId)) &&
      u.password === cleanPass
    );

    if (user) {
      this.setCurrentUser(user);
      return { success: true, message: 'Đăng nhập thành công!', user };
    }

    return { success: false, message: 'Email/Số điện thoại hoặc mật khẩu không chính xác.' };
  }

  register(name: string, email: string, phone: string, password: string, healthGoal: string = 'Eat Clean'): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email này đã được đăng ký.' };
    }

    const newUser: User = {
      id: 'u_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password,
      healthGoal,
      isAdmin: false,
      wishlist: [],
      isNewUser: true,
      surveyCompleted: false
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, message: 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.', user: newUser };
  }

  logout() {
    this.setCurrentUser(null);
  }

  updateProfile(updatedData: Partial<User>): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập.' };

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedData };
      this.saveUsers(users);
      this.setCurrentUser(users[index]);
      return { success: true, message: 'Cập nhật thông tin thành công!' };
    }

    return { success: false, message: 'Không tìm thấy người dùng.' };
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.isAdmin);
  }

  isInWishlist(productId: number): boolean {
    const user = this.getCurrentUser();
    return !!(user && user.wishlist && user.wishlist.includes(productId));
  }

  toggleWishlist(productId: number): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    user.wishlist = user.wishlist || [];
    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }
    this.updateProfile({ wishlist: user.wishlist });
    return user.wishlist.includes(productId);
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}

