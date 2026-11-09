import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private get bridge(): any { return (window as any).AuthService; }
  constructor(private api: ApiService) {
    window.addEventListener('authChanged', () => this.currentUserSubject.next(this.bridge.getCurrentUser()));
    (window as any).authReady?.then(() => this.currentUserSubject.next(this.bridge.getCurrentUser()));
  }
  async refresh() { await this.bridge.refresh(); }
  getCurrentUser(): User | null { return this.bridge.getCurrentUser(); }
  isAdmin() { return !!this.getCurrentUser()?.isAdmin; }
  isAuthenticated() { return !!this.getCurrentUser(); }
  login(email: string, password: string) { return this.bridge.login(email, password); }
  register(name: string, email: string, phone: string, password: string, healthGoal = 'Eat Clean') { return this.bridge.register(name, email, phone, password, healthGoal); }
  logout() { return this.bridge.logout(); }
  updateProfile(data: Partial<User>) { return this.bridge.saveProfile(data); }
  isInWishlist(id: number) { return this.bridge.isInWishlist(id); }
  toggleWishlist(id: number) { return this.bridge.toggleWishlist(id); }
}
