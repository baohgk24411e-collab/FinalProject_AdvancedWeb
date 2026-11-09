import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService), router = inject(Router);
  await auth.refresh();
  return auth.isAuthenticated() || router.createUrlTree(['/login']);
};
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService), router = inject(Router);
  await auth.refresh();
  return auth.isAdmin() || router.createUrlTree(['/login']);
};
