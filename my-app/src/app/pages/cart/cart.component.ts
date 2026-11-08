import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';

declare var window: any;
declare var document: any;

@Component({
  standalone: false,
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, AfterViewInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    public langService: LanguageService
  ) {}

  ngOnInit(): void {
    // Subscribe to query params if needed
    this.route.queryParams.subscribe(params => {
      // Handle dynamic filters or tabs
    });
  }

  ngAfterViewInit(): void {
    this.loadPageScript();
  }

  private loadPageScript(): void {
    const runScripts = () => {
      try {
        if (typeof window !== 'undefined' && window.renderCartPage) {
          window.renderCartPage();
        } else {
          document.dispatchEvent(new Event('DOMContentLoaded'));
        }
      } catch (err) {
        console.warn('Script execution notice:', err);
      }
    };

    const existing = document.querySelector('script[src="js/cart.js"], script[src="assets/js/cart.js"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'js/cart.js';
      script.async = false;
      script.onload = () => runScripts();
      document.body.appendChild(script);
    } else {
      setTimeout(() => runScripts(), 50);
    }
  }
}
