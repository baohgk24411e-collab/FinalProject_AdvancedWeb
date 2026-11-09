import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { CartItem } from '../models/cart-item.model';
@Injectable({ providedIn: 'root' })
export class CartService {
  private items = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.items.asObservable();
  private get bridge(): any { return (window as any).CartService; }
  constructor(private api: ApiService) { window.addEventListener('cartUpdated', () => this.items.next(this.getCart())); this.items.next(this.getCart()); }
  getCart(): CartItem[] { return this.bridge?.getCart() || []; }
  async addToCart(id: number, quantity = 1) {
    try {
      const product = await this.api.request('/api/products/' + id);
      const w = window as any;
      w.MOCK_PRODUCTS = [product, ...(w.MOCK_PRODUCTS || []).filter((p: any) => p.id !== id)];
      return this.bridge.addToCart(id, quantity);
    } catch(e: any) { return { success: false, message: e.message }; }
  }
  async updateQuantity(id: number, quantity: number) {
    try { const product = await this.api.request('/api/products/' + id); if (quantity > product.stock) throw new Error('Không đủ tồn kho'); return this.bridge.updateQuantity(id, quantity); }
    catch(e: any) { return { success: false, message: e.message }; }
  }
  removeFromCart(id: number) { return this.bridge.removeFromCart(id); }
  clearCart() { return this.bridge.clearCart(); }
  getCartCount() { return this.getCart().reduce((sum, p) => sum + p.quantity, 0); }
  getCartTotal() { return this.bridge.getCartSubtotal(); }
}
