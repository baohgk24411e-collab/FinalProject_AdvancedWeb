import { describe, it, expect } from 'vitest';
import { of, throwError } from 'rxjs';
import { AdminProductsComponent } from './admin-products.component';
describe('Angular product editor', () => {
  it('keeps the draft and displays the error when the server rejects a write', async () => {
    const c = new AdminProductsComponent({ addProduct: () => throwError(() => new Error('MongoDB offline')) } as any);
    c.open(); c.draft.name = 'Draft'; await c.save();
    expect(c.formOpen).toBe(true); expect(c.draft.name).toBe('Draft'); expect(c.products.length).toBe(0); expect(c.error).toBe('MongoDB offline'); expect(c.message).toBe('');
  });
  it('uses the server assigned id and saves season and goals', async () => {
    let body: any;
    const c = new AdminProductsComponent({ addProduct: (p: any) => { body = p; return of({ ...p, id: 77 }); } } as any);
    c.open(); c.draft.season = 'Mùa hè'; c.toggleGoal('Eat Clean', true); await c.save();
    expect(body.healthGoals).toEqual(['Eat Clean']); expect(body.season).toBe('Mùa hè'); expect(c.products[0].id).toBe(77); expect(c.formOpen).toBe(false);
  });
});
