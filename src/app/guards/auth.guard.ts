// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const currentPath = route.routeConfig?.path ?? '';

  const role = auth.getRole(); // 'admin', 'empleado', 'superadmin'

  // Si va a /login y ya está autenticado → redirigir según rol
  if (currentPath === 'login') {
    if (!auth.isAuthenticated()) return true;

    if (role === 'superadmin') return router.parseUrl('/admins');
    return router.parseUrl('/inicio');
  }

  // Si no está autenticado → redirigir a /login
  if (!auth.isAuthenticated()) {
    return router.parseUrl('/login');
  }

  // Si es superadmin y trata de ir a /inicio → redirigir a /admins
  if (role === 'superadmin' && currentPath === 'inicio') {
    return router.parseUrl('/admins');
  }

  // Si pasa todas las validaciones
  return true;
};
