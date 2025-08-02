import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard'; // 👈 asegúrate de importar el guard
import { superAdminGuard } from './guards/superadmin.guard'; // 👈 asegúrate de importar el guard de super admin
import { adminGuard } from './guards/admin.guard'; // 👈 asegúrate de importar el guard de admin
import { empleadoGuard } from './guards/empleado.guard'; // 👈 asegúrate de importar el guard de empleado
import { adminOempleadoGuard } from './guards/admin-empleado.guard';
import { KardexInventariosComponent } from './pages/finanzas/kardex-inventarios/kardex-inventarios.component';
import { TablaKardexComponent } from './pages/finanzas/kardex-inventarios/tabla-kardex/tabla-kardex.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [authGuard] },

  {
    path: 'inicio',
    canActivate: [authGuard], // 👈 protección añadida
    loadComponent: () =>
      import('./pages/inicio/inicio.component').then((m) => m.InicioComponent),
  },

  {
    path: 'registrar-admin', // ✅ nueva ruta protegida por rol
    canActivate: [superAdminGuard],
    loadComponent: () =>
      import('./pages/admin-register/admin-register.component').then(
        (m) => m.AdminRegisterComponent
      ),
  },

  {
    path: 'admins',
    canActivate: [superAdminGuard],
    loadComponent: () =>
      import('./pages/admin-list/admin-list.component').then(
        (m) => m.AdminListComponent
      ),
  },

  {
    path: 'usuarios/:id',
    canActivate: [superAdminGuard],
    loadComponent: () =>
      import('./pages/usuarios/editar-admin/editar-admin.component').then(
        (m) => m.EditarAdminComponent
      ),
  },

  {
    path: 'cuentas',
    canActivate: [adminOempleadoGuard], // 👈 protección añadida
    loadComponent: () =>
      import('./pages/cuentas/cuentas.component').then(
        (m) => m.CuentasComponent
      ), // 👈 solo estos pueden acceder
  },

  {
    path: 'perfiles/:cuentaId',
    canActivate: [adminOempleadoGuard], // 👈 protección añadida
    loadComponent: () =>
      import('./pages/perfiles/perfiles.component').then(
        (m) => m.PerfilesComponent
      ), // 👈 solo estos pueden acceder
  },

  {
    path: 'clientes',
    canActivate: [adminOempleadoGuard], // 👈 protección añadida
    loadComponent: () =>
      import('./pages/clientes/clientes.component').then(
        (m) => m.ClientesComponent
      ), // 👈 solo estos pueden acceder
  },

  {
    path: 'finanzas',
    canActivate: [adminOempleadoGuard], // 👈 protección añadida
    loadComponent: () =>
      import('./pages/finanzas/finanzas.component').then(
        (m) => m.FinanzasComponent
      ), // 👈 solo estos pueden acceder
  },

  {
    path: 'finanzas/kardex',
    component: KardexInventariosComponent,
  },
  {
    path: 'finanzas/kardex/:plataformaId',
    component: TablaKardexComponent,
  },

  // Ruta wildcard opcional para rutas no existentes
  { path: '**', redirectTo: 'login' },
];
