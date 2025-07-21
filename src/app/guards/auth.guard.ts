// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const currentUrl = route.url.map((segment) => segment.path).join('/');

  // Si va a /login y ya está autenticado → redirigir a /inicio
  if (currentUrl === 'login') {
    return auth.isAuthenticated() ? router.parseUrl('/inicio') : true;
  }

  // Para cualquier otra ruta → permitir solo si está autenticado
  return auth.isAuthenticated() ? true : router.parseUrl('/login');
};
