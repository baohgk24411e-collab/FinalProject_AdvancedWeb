import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Optional, Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
@Component({ standalone: true, imports: [CommonModule, FormsModule, RouterModule], selector: 'app-admin-products', templateUrl: './admin-products.component.html', styleUrls: ['./admin-products.component.css'] })
export class AdminProductsComponent implements OnInit {
  products: Product[] = []; categories: Category[] = [];
  query = ''; error = ''; message = ''; busy = false; loading = false;
  editing: number | null = null; formOpen = false;
  seasons = ['Quanh năm', 'Mùa hè', 'Mùa đông'];
  goals = ['Eat Clean', 'Tăng cơ', 'Giảm cân', 'Bổ sung năng lượng', 'Gia đình', 'Snack lành mạnh'];
  draft: any = {};
  constructor(private service: ProductService, @Optional() private cdr?: ChangeDetectorRef) {}
  ngOnInit() { this.load(); }
  async load() {
    this.loading = true; this.error = '';
    try { [this.products, this.categories] = await Promise.all([firstValueFrom(this.service.getProducts()), firstValueFrom(this.service.getCategories())]); }
    catch (e: any) { this.error = e.message; }
    finally { this.loading = false; this.cdr?.markForCheck(); }
  }
  get filtered() { const q = this.query.toLocaleLowerCase(); return this.products.filter(p => p.name.toLocaleLowerCase().includes(q) || p.category.toLocaleLowerCase().includes(q)); }
  open(product?: Product) {
    this.editing = product?.id ?? null;
    this.draft = product ? structuredClone(product) : { name: '', nameEn: '', category: this.categories[0]?.id || 'Fruits', price: 0, stock: 0, image: '', season: 'Quanh năm', healthGoals: [], isSeasonal: false, isBestSeller: false, description: '', region: '', oldPrice: null };
    this.draft.healthGoals ||= []; this.draft.season ||= 'Quanh năm';
    this.formOpen = true; this.error = ''; this.message = '';
  }
  toggleGoal(goal: string, checked: boolean) { this.draft.healthGoals = checked ? [...this.draft.healthGoals, goal] : this.draft.healthGoals.filter((x: string) => x !== goal); }
  async save() {
    if (this.busy) return; this.busy = true; this.error = '';
    try {
      const result = await firstValueFrom(this.editing === null ? this.service.addProduct(this.draft) : this.service.updateProduct(this.editing, this.draft));
      this.products = [result, ...this.products.filter(p => p.id !== result.id)];
      (window as any).MOCK_PRODUCTS = this.products;
      this.formOpen = false; this.message = 'Đã lưu sản phẩm vào cơ sở dữ liệu.';
    } catch (e: any) { this.error = e.message; }
    finally { this.busy = false; this.cdr?.markForCheck(); }
  }
  async remove(product: Product) {
    if (this.busy || !confirm('Xóa sản phẩm ' + product.name + '?')) return;
    this.busy = true; this.error = ''; this.message = '';
    try {
      await firstValueFrom(this.service.deleteProduct(product.id));
      this.products = this.products.filter(p => p.id !== product.id);
      (window as any).MOCK_PRODUCTS = this.products;
      this.message = 'Đã xóa sản phẩm khỏi cơ sở dữ liệu.';
    } catch (e: any) { this.error = e.message; }
    finally { this.busy = false; this.cdr?.markForCheck(); }
  }
}
