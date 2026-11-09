import { authGuard, adminGuard } from './guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { NutritionComponent } from './pages/nutrition/nutrition.component';
import { TraceabilityComponent } from './pages/traceability/traceability.component';
import { ContactComponent } from './pages/contact/contact.component';

import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin/admin-products/admin-products.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders/admin-orders.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'detail', component: ProductDetailComponent },
  { path: 'detail/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'nutrition', component: NutritionComponent },
  { path: 'traceability', component: TraceabilityComponent },
  { path: 'contact', component: ContactComponent },
  
  // Admin Routes
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [adminGuard] },
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },

  // .html Aliases
  { path: 'index.html', redirectTo: '', pathMatch: 'full' },
  { path: 'about.html', redirectTo: 'about', pathMatch: 'full' },
  { path: 'products.html', redirectTo: 'products', pathMatch: 'full' },
  { path: 'detail.html', redirectTo: 'detail', pathMatch: 'full' },
  { path: 'cart.html', redirectTo: 'cart', pathMatch: 'full' },
  { path: 'checkout.html', redirectTo: 'checkout', pathMatch: 'full' },
  { path: 'login.html', redirectTo: 'login', pathMatch: 'full' },
  { path: 'profile.html', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'nutrition.html', redirectTo: 'nutrition', pathMatch: 'full' },
  { path: 'traceability.html', redirectTo: 'traceability', pathMatch: 'full' },
  { path: 'contact.html', redirectTo: 'contact', pathMatch: 'full' },
  { path: 'admin-dashboard.html', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'admin-products.html', redirectTo: 'admin/products', pathMatch: 'full' },
  { path: 'admin-orders.html', redirectTo: 'admin/orders', pathMatch: 'full' },

  // Wildcard fallback
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

