import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminOempleadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const rol = auth.getRole(); // asume que esto devuelve 'admin', 'empleado', etc.

  if (auth.isAuthenticated() && (rol === 'admin' || rol === 'empleado')) {
    return true;
  }

  return router.parseUrl('/login'); // o redirige a /unauthorized si tienes
};
