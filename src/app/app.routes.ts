import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard'; // 👈 asegúrate de importar el guard

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'inicio',
    canActivate: [authGuard], // 👈 protección añadida
    loadComponent: () =>
      import('./pages/inicio/inicio.component').then((m) => m.InicioComponent),
  },
  // Ruta wildcard opcional para rutas no existentes
  { path: '**', redirectTo: 'login' },
];
