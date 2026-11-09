import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ChangeDetectorRef, Optional, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
@Component({ standalone: true, imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent], selector: 'app-products', templateUrl: './products.component.html', styleUrls: ['./products.component.css'] })
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = []; result: Product[] = []; loading = false; error = ''; view = 'grid'; sidebarOpen = false;
  state: any = { search: '', season: 'all', priceRange: 'all', sort: 'newest', healthGoal: [], productCategory: [], promo: [] };
  private subscription?: Subscription;
  constructor(private service: ProductService, private route: ActivatedRoute, private router: Router, @Optional() private cdr?: ChangeDetectorRef) {}
  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe(params => {
      for (const key of ['search','season','priceRange','sort']) this.state[key] = params.get(key) ?? (({search:'',sort:'newest'} as any)[key] ?? 'all');
      this.state.healthGoal = params.get('healthGoal')?.split(',') || [];
      this.state.productCategory = (params.get('categories') || params.get('category'))?.split(',').filter(v => v !== 'all') || [];
      this.state.promo = params.get('promo')?.split(',') || []; this.filter(); this.cdr?.markForCheck();
    });
    this.load();
  }
  ngOnDestroy() { this.subscription?.unsubscribe(); }
  async load() {
    this.loading = true; this.error = '';
    try { this.products = await firstValueFrom(this.service.getProducts()); (window as any).MOCK_PRODUCTS = this.products; this.filter(); }
    catch { this.error = 'Unable to load products. Please try again.'; }
    finally { this.loading = false; this.cdr?.markForCheck(); }
  }
  change(name: string, value: string, checked = true) {
    if (Array.isArray(this.state[name])) this.state[name] = checked ? [...new Set([...this.state[name], value])] : this.state[name].filter((v: string) => v !== value);
    else this.state[name] = value;
    this.filter(); this.syncUrl();
  }
  get hasActiveFilters(): boolean {
    return !!this.state.search.trim() || this.state.season !== 'all' || this.state.priceRange !== 'all'
      || ['healthGoal', 'productCategory', 'promo'].some(key => this.state[key].length > 0);
  }
  reset() { this.state = { search: '', season: 'all', priceRange: 'all', sort: this.state.sort, healthGoal: [], productCategory: [], promo: [] }; this.filter(); this.syncUrl(); }
  syncUrl() {
    this.router.navigate([], { relativeTo: this.route, queryParams: {
      search: this.state.search || null, season: this.state.season === 'all' ? null : this.state.season,
      priceRange: this.state.priceRange === 'all' ? null : this.state.priceRange, sort: this.state.sort,
      categories: this.state.productCategory.join(',') || null, healthGoal: this.state.healthGoal.join(',') || null, promo: this.state.promo.join(',') || null
    }, replaceUrl: true });
  }
  matches(p: Product, name: string, value: string) {
    if (value === 'all') return true;
    if (name === 'season') return value === 'seasonal' ? !!p.isSeasonal : p['season'] === value;
    if (name === 'healthGoal') return p['healthGoals']?.includes(value) || false;
    if (name === 'productCategory') return p.category === value;
    if (name === 'promo') return value === 'bestseller' ? !!p.isBestSeller : value === 'seasonal' ? !!p.isSeasonal : (p['oldPrice'] || p.originalPrice || 0) > p.price;
    if (name === 'priceRange') return value === 'under-50' ? p.price < 50000 : value === '50-100' ? p.price >= 50000 && p.price <= 100000 : value === '100-200' ? p.price > 100000 && p.price <= 200000 : p.price > 200000;
    return true;
  }
  count(name: string, value: string) { return this.products.filter(p => this.matches(p,name,value)).length; }
  filter() {
    const q = this.state.search.trim().toLocaleLowerCase();
    this.result = this.products.filter(p => {
      if (q && ![p.name,p['nameEn'],p.category,p['region'],p.description].some(v => String(v || '').toLocaleLowerCase().includes(q))) return false;
      if (!this.matches(p,'season',this.state.season) || !this.matches(p,'priceRange',this.state.priceRange)) return false;
      for (const key of ['productCategory','healthGoal']) if(this.state[key].length && !this.state[key].some((v: string) => this.matches(p,key,v))) return false;
      return this.state.promo.every((v: string) => this.matches(p,'promo',v));
    });
    this.result.sort((a,b) => this.state.sort === 'price-asc' ? a.price-b.price : this.state.sort === 'price-desc' ? b.price-a.price : this.state.sort === 'bestseller' ? Number(!!b.isBestSeller)-Number(!!a.isBestSeller) || (b.rating||0)-(a.rating||0) : b.id-a.id);
  }
}
