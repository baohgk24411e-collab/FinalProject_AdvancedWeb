import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true, imports: [CommonModule, RouterModule],
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  addedAlert: boolean = false;
  isWishlisted: boolean = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.product && this.authService) {
      const user = this.authService.getCurrentUser();
      if (user && user.wishlist) {
        this.isWishlisted = user.wishlist.includes(this.product.id);
      }
    }
  }

  get discountPercent(): number {
    if (this.product && (this.product.originalPrice || this.product['oldPrice']) && (this.product.originalPrice || this.product['oldPrice']) > this.product.price) {
      return Math.round((((this.product.originalPrice || this.product['oldPrice']) - this.product.price) / (this.product.originalPrice || this.product['oldPrice'])) * 100);
    }
    return 0;
  }

  async toggleWishlist(event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    if (!this.product) return;
    const result = await this.authService.toggleWishlist(this.product.id);
    if (result.success) this.isWishlisted = result.isAdded;
    else alert(result.message);
    this.cdr.markForCheck();
  }

  async addToCart(event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    if (!this.product) return;
    const res = await this.cartService.addToCart(this.product.id, 1);
    if (res.success) {
      this.addedAlert = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.addedAlert = false;
        this.cdr.markForCheck();
      }, 1500);
    } else {
      alert(res.message);
    }
  }

  getStarsArray(): { fill: boolean; half: boolean }[] {
    const rating = (this.product && this.product.rating) || 5;
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= full) {
        stars.push({ fill: true, half: false });
      } else if (i === full + 1 && hasHalf) {
        stars.push({ fill: false, half: true });
      } else {
        stars.push({ fill: false, half: false });
      }
    }
    return stars;
  }
}
