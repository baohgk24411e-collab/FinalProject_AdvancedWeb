import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { ApiService } from './api.service';
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}
  getProducts(category?: string, search?: string): Observable<Product[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    return from(this.api.request<Product[]>('/api/products?' + params));
  }
  getProductById(id: number | string): Observable<Product> { return from(this.api.request<Product>('/api/products/' + encodeURIComponent(id))); }
  getCategories(): Observable<Category[]> { return from(this.api.request<Category[]>('/api/categories')); }
  getFeaturedProducts(): Observable<Product[]> { return this.getProducts().pipe(map(list => list.filter(p => p.isBestSeller).slice(0, 6))); }
  addProduct(product: Partial<Product>): Observable<Product> { return from(this.api.request<Product>('/api/products', 'POST', product)); }
  updateProduct(id: number | string, product: Partial<Product>): Observable<Product> { return from(this.api.request<Product>('/api/products/' + encodeURIComponent(id), 'PUT', product)); }
  deleteProduct(id: number | string): Observable<boolean> { return from(this.api.request<{success: boolean}>('/api/products/' + encodeURIComponent(id), 'DELETE')).pipe(map(r => r.success)); }
}
