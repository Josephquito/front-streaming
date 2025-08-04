import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

// Guards
import { authGuard } from './guards/auth.guard';
import { superAdminGuard } from './guards/superadmin.guard';
import { adminGuard } from './guards/admin.guard';
import { empleadoGuard } from './guards/empleado.guard';
import { adminOempleadoGuard } from './guards/admin-empleado.guard';

// Finanzas (Componentes pre-cargados)
import { KardexInventariosComponent } from './pages/finanzas/kardex-inventarios/kardex-inventarios.component';
import { TablaKardexComponent } from './pages/finanzas/kardex-inventarios/tabla-kardex/tabla-kardex.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [authGuard] },

  // Inicio
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/inicio/inicio.component').then((m) => m.InicioComponent),
  },

  // Usuarios y administración
  {
    path: 'registrar-admin',
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
    path: 'usuarios/empleados',
    canActivate: [adminOempleadoGuard],
    loadComponent: () =>
      import('./pages/usuarios/empleados/empleados.component').then(
        (m) => m.EmpleadosComponent
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

  // Gestión de cuentas y perfiles
  {
    path: 'cuentas',
    canActivate: [adminOempleadoGuard],
    loadComponent: () =>
      import('./pages/cuentas/cuentas.component').then(
        (m) => m.CuentasComponent
      ),
  },
  {
    path: 'perfiles/:cuentaId',
    canActivate: [adminOempleadoGuard],
    loadComponent: () =>
      import('./pages/perfiles/perfiles.component').then(
        (m) => m.PerfilesComponent
      ),
  },

  // Clientes
  {
    path: 'clientes',
    canActivate: [adminOempleadoGuard],
    loadComponent: () =>
      import('./pages/clientes/clientes.component').then(
        (m) => m.ClientesComponent
      ),
  },
  {
    path: 'clientes/:id',
    loadComponent: () =>
      import('./pages/clientes/info-cliente/info-cliente.component').then(
        (m) => m.InfoClienteComponent
      ),
  },

  // Finanzas
  {
    path: 'finanzas',
    canActivate: [adminOempleadoGuard],
    loadComponent: () =>
      import('./pages/finanzas/finanzas.component').then(
        (m) => m.FinanzasComponent
      ),
  },
  {
    path: 'finanzas/kardex',
    component: KardexInventariosComponent,
  },
  {
    path: 'finanzas/kardex/:plataformaId',
    component: TablaKardexComponent,
  },

  // Wildcard
  { path: '**', redirectTo: 'login' },
];
