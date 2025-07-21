//src/app/guards/superadmin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.getRole()?.toLowerCase();
  const isAuth = auth.isAuthenticated();

  if (isAuth && role === 'superadmin') {
    return true;
  }

  return router.parseUrl('/inicio');
};
