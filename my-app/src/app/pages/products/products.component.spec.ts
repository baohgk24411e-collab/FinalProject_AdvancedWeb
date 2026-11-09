import { describe, it, expect } from 'vitest';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { convertToParamMap } from '@angular/router';
import { ProductsComponent } from './products.component';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

const products: any[] = [
  { id: 1, name: 'Xoài', category: 'Fruits', season: 'Mùa hè', price: 95000, stock: 2, healthGoals: ['Eat Clean'] },
  { id: 2, name: 'Cam', category: 'Fruits', season: 'Mùa đông', price: 30000, stock: 2 },
  { id: 3, name: 'Hạt', category: 'Nutritional Seeds', season: 'Quanh năm', price: 180000, stock: 2 }
];
function setup(service: any = { getProducts: () => of(products) }) {
  const params = new BehaviorSubject(convertToParamMap({}));
  const component = new ProductsComponent(service, { queryParamMap: params } as any, { navigate: () => Promise.resolve(true) } as any);
  return { component, params };
}
describe('Angular catalog', () => {
  it('renders API data and filters through the actual Angular radio binding', async () => {
    TestBed.configureTestingModule({ imports: [ProductsComponent], providers: [
      provideRouter([]),
      { provide: ProductService, useValue: { getProducts: () => of(products) } },
      { provide: AuthService, useValue: { getCurrentUser: () => null } },
      { provide: CartService, useValue: {} }
    ] });
    const fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-product-card').length).toBe(3);
    const radio = fixture.nativeElement.querySelector('input[name="season"][value="Mùa hè"]');
    radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-product-card').length).toBe(1);
    expect(fixture.nativeElement.querySelector('#product-count').textContent.trim()).toBe('1');
    fixture.destroy(); TestBed.resetTestingModule();
  });
  it('combines season/category/price, sorts and resets', async () => {
    const { component: c } = setup();
    await c.load();
    c.change('season', 'Mùa hè'); c.change('productCategory', 'Fruits'); c.change('priceRange', '50-100');
    expect(c.result.map(p => p.id)).toEqual([1]);
    c.reset(); c.change('sort', 'price-asc');
    expect(c.result.map(p => p.id)).toEqual([2, 1, 3]);
    c.change('search', 'not found'); expect(c.result).toEqual([]);
  });
  it('updates from query parameters without recreating the component', async () => {
    const { component: c, params } = setup(); c.ngOnInit(); await c.load();
    params.next(convertToParamMap({ season: 'Mùa đông' })); expect(c.result.map(p => p.id)).toEqual([2]);
    params.next(convertToParamMap({ search: 'Hạt' })); expect(c.result.map(p => p.id)).toEqual([3]);
    c.ngOnDestroy();
  });
  it('shows API failure instead of silently replacing it with mock success', async () => {
    const { component: c } = setup({ getProducts: () => throwError(() => new Error('offline')) });
    await c.load(); expect(c.error).toBe('offline'); expect(c.loading).toBe(false); expect(c.result).toEqual([]);
  });
});
