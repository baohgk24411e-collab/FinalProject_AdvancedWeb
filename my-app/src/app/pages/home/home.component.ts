import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { LanguageService } from '../../services/language.service';
import { Product } from '../../models/product.model';

declare var window: any;
declare var document: any;

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  featuredProducts: Product[] = [];
  personalizedProducts: Product[] = [];
  hasPersonalized: boolean = false;

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
    this.productService.getProducts().subscribe(products => {
      const featuredIds = [4, 7, 6, 45, 47, 48];
      const featured = featuredIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
      this.featuredProducts = featured.length > 0 ? featured : products.slice(0, 6);

      const user = this.authService.getCurrentUser();
      if (user && user.surveyCompleted && user.surveyData) {
        const prefCats = user.surveyData.preferredCategories || [];
        const prefFlavors = user.surveyData.preferredFlavors || [];
        const matched = products.filter(p => {
          if (!prefCats.includes(p.category)) return false;
          const desc = (p.description || '').toLowerCase();
          return prefFlavors.some(f => desc.includes(f));
        });
        this.personalizedProducts = matched.length > 0 ? matched.slice(0, 4) : products.filter(p => prefCats.includes(p.category)).slice(0, 4);
        this.hasPersonalized = this.personalizedProducts.length > 0;
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadPageScript();
  }

  private loadPageScript(): void {
    try {
      const track = document.getElementById('heroTrack');
      const dots = document.querySelectorAll('.hero-dot');
      if (track && dots.length > 0) {
        const total = 3;
        let current = 0;
        let autoTimer: any;

        const goTo = (index: number) => {
          current = (index + total) % total;
          track.style.transform = 'translateX(-' + (current * 100) + '%)';
          dots.forEach((d: any, i: number) => {
            d.classList.toggle('active', i === current);
          });
        };

        const startAuto = () => {
          clearInterval(autoTimer);
          autoTimer = setInterval(() => { goTo(current + 1); }, 5000);
        };

        const prevBtn = document.getElementById('heroPrev');
        const nextBtn = document.getElementById('heroNext');
        if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

        dots.forEach((d: any) => {
          d.addEventListener('click', function(this: any) {
            goTo(parseInt(this.dataset.slide));
            startAuto();
          });
        });

        startAuto();
      }
    } catch (err) {
      console.warn('Hero carousel init notice:', err);
    }
  }
}
