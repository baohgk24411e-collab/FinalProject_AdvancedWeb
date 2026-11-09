import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { LanguageService } from '../../services/language.service';
import { User } from '../../models/user.model';

@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  cartCount: number = 0;
  mobileMenuOpen: boolean = false;
  searchModalOpen: boolean = false;
  searchKeyword: string = '';
  userMenuOpen: boolean = false;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    public langService: LanguageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.cdr.markForCheck();
    });

    this.cartService.cartItems$.subscribe(() => {
      this.cartCount = this.cartService.getCartCount();
      this.cdr.markForCheck();
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleLanguage(): void {
    this.langService.toggleLanguage();
  }

  openSearch(): void {
    this.searchModalOpen = true;
  }

  closeSearch(): void {
    this.searchModalOpen = false;
    this.searchKeyword = '';
  }

  performSearch(): void {
    if (this.searchKeyword.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.searchKeyword.trim() } });
      this.closeSearch();
    }
  }

  async logout(): Promise<void> {
    const result = await this.authService.logout();
    if (!result.success) { alert(result.message); return; }
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }
}
