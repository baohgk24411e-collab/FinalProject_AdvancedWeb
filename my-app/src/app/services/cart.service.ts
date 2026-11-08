import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';
import { ProductService } from './product.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(
    private productService: ProductService,
    private authService: AuthService
  ) {
    this.loadCart();
  }

  private loadCart() {
    const user = this.authService.getCurrentUser();
    if (user && user.isAdmin) {
      this.cartItemsSubject.next([]);
      return;
    }
    const saved = localStorage.getItem('tqg_cart');
    if (saved) {
      try {
        const parsed: CartItem[] = JSON.parse(saved);
        this.cartItemsSubject.next(parsed);
      } catch (e) {
        this.cartItemsSubject.next([]);
      }
    } else {
      this.cartItemsSubject.next([]);
    }
  }

  private saveCart(items: CartItem[]) {
    localStorage.setItem('tqg_cart', JSON.stringify(items));
    this.cartItemsSubject.next([...items]);
  }

  getCart(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  addToCart(productId: number, quantity: number = 1): { success: boolean; message: string } {
    const user = this.authService.getCurrentUser();
    if (user && user.isAdmin) {
      return { success: false, message: 'Tài khoản quản trị viên không thể mua hàng.' };
    }

    let product: Product | undefined;
    this.productService.getProductById(productId).subscribe(p => product = p);
    if (!product) {
      return { success: false, message: 'Không tìm thấy sản phẩm.' };
    }

    const items = [...this.getCart()];
    const existing = items.find(i => i.productId === productId);

    if (existing) {
      if (existing.quantity + quantity > product.stock) {
        return { success: false, message: `Số lượng vượt quá tồn kho (Còn lại: ${product.stock}).` };
      }
      existing.quantity += quantity;
    } else {
      if (quantity > product.stock) {
        return { success: false, message: `Số lượng vượt quá tồn kho (Còn lại: ${product.stock}).` };
      }
      items.push({ productId, quantity, product });
    }

    this.saveCart(items);
    return { success: true, message: `Đã thêm "${product.name}" vào giỏ hàng!` };
  }

  updateQuantity(productId: number, quantity: number): { success: boolean; message: string } {
    const items = [...this.getCart()];
    const index = items.findIndex(i => i.productId === productId);
    if (index === -1) return { success: false, message: 'Sản phẩm không có trong giỏ hàng.' };

    if (quantity <= 0) {
      items.splice(index, 1);
      this.saveCart(items);
      return { success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng.' };
    }

    let product: Product | undefined;
    this.productService.getProductById(productId).subscribe(p => product = p);
    if (product && quantity > product.stock) {
      return { success: false, message: `Số lượng vượt quá tồn kho (Còn lại: ${product.stock}).` };
    }

    items[index].quantity = quantity;
    this.saveCart(items);
    return { success: true, message: 'Cập nhật số lượng thành công.' };
  }

  removeFromCart(productId: number) {
    const items = this.getCart().filter(i => i.productId !== productId);
    this.saveCart(items);
  }

  clearCart() {
    this.saveCart([]);
  }

  getCartCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartTotal(): number {
    let total = 0;
    const items = this.getCart();
    for (const item of items) {
      let product: Product | undefined;
      this.productService.getProductById(item.productId).subscribe(p => product = p);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return total;
  }
}

