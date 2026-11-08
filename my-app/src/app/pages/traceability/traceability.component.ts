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
  selector: 'app-traceability',
  templateUrl: './traceability.component.html',
  styleUrls: ['./traceability.component.css']
})
export class TraceabilityComponent implements OnInit, AfterViewInit {

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
        document.dispatchEvent(new Event('DOMContentLoaded'));
      } catch (err) {
        console.warn('Script execution notice:', err);
      }
    };

    const existing = document.querySelector('script[src="js/traceability.js"], script[src="assets/js/traceability.js"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'js/traceability.js';
      script.async = false;
      script.onload = () => runScripts();
      document.body.appendChild(script);
    } else {
      setTimeout(() => runScripts(), 50);
    }
  }
}
