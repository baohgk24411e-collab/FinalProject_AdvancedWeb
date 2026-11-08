import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { MOCK_PRODUCTS } from '../data/products.data';
import { MOCK_CATEGORIES } from '../data/categories.data';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/products';
  private categoriesUrl = '/api/categories';
  private products: Product[] = [];
  private categories: Category[] = MOCK_CATEGORIES;

  constructor(private http: HttpClient) {
    this.initProducts();
  }

  private initProducts() {
    const saved = localStorage.getItem('tqg_products');
    if (saved) {
      try {
        this.products = JSON.parse(saved);
      } catch (e) {
        this.products = [...MOCK_PRODUCTS];
      }
    } else {
      this.products = [...MOCK_PRODUCTS];
      this.saveProducts();
    }
  }

  private saveProducts() {
    localStorage.setItem('tqg_products', JSON.stringify(this.products));
  }

  // READ ALL: GET /api/products
  getProducts(category?: string, search?: string): Observable<Product[]> {
    let url = this.apiUrl;
    const params: string[] = [];
    if (category && category !== 'all') params.push(`category=${encodeURIComponent(category)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<Product[]>(url).pipe(
      tap(data => {
        if (data && data.length > 0) {
          this.products = data;
          this.saveProducts();
        }
      }),
      catchError(err => {
        console.warn('[ProductService] Backend not reachable, using local data:', err.message);
        let list = this.products;
        if (category && category !== 'all') list = list.filter(p => p.category === category);
        if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        return of(list);
      })
    );
  }

  // READ ONE: GET /api/products/:id
  getProductById(id: number | string): Observable<Product | undefined> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const product = this.products.find(p => p.id == id || (p as any)._id == id);
        return of(product);
      })
    );
  }

  // READ CATEGORIES: GET /api/categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl).pipe(
      tap(cats => {
        if (cats && cats.length > 0) this.categories = cats;
      }),
      catchError(() => of(this.categories))
    );
  }

  getFeaturedProducts(): Observable<Product[]> {
    const featuredIds = [4, 7, 6, 45, 47, 48];
    return this.getProducts().pipe(
      map(all => {
        const featured = featuredIds
          .map(id => all.find(p => p.id === id))
          .filter((p): p is Product => !!p);
        return featured.length > 0 ? featured : all.slice(0, 6);
      })
    );
  }

  // CREATE: POST /api/products
  addProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      tap(newProd => {
        this.products.unshift(newProd);
        this.saveProducts();
      }),
      catchError(() => {
        const newProd = {
          ...product,
          id: product.id || Math.max(...this.products.map(p => p.id || 0), 0) + 1
        } as Product;
        this.products.unshift(newProd);
        this.saveProducts();
        return of(newProd);
      })
    );
  }

  // UPDATE: PUT /api/products/:id
  updateProduct(id: number | string, updatedData: Partial<Product>): Observable<Product | null> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, updatedData).pipe(
      tap(updated => {
        const index = this.products.findIndex(p => p.id == id || (p as any)._id == id);
        if (index !== -1 && updated) {
          this.products[index] = { ...this.products[index], ...updated };
          this.saveProducts();
        }
      }),
      catchError(() => {
        const index = this.products.findIndex(p => p.id == id || (p as any)._id == id);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updatedData };
          this.saveProducts();
          return of(this.products[index]);
        }
        return of(null);
      })
    );
  }

  // DELETE: DELETE /api/products/:id
  deleteProduct(id: number | string): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      map(res => !!(res && res.success)),
      tap(() => {
        this.products = this.products.filter(p => p.id != id && (p as any)._id != id);
        this.saveProducts();
      }),
      catchError(() => {
        const prevLength = this.products.length;
        this.products = this.products.filter(p => p.id != id && (p as any)._id != id);
        this.saveProducts();
        return of(this.products.length !== prevLength);
      })
    );
  }

  // RE-SEED MONGODB DATABASE
  seedDatabase(): Observable<any> {
    return this.http.post('/api/seed', {});
  }
}
