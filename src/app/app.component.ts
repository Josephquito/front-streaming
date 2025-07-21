import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './guards/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule], // 👈 Aquí importas RouterModule
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private auth: AuthService, private router: Router) {}

  get isLoggedIn(): boolean {
    return this.auth.isAuthenticated();
  }

  get isSuperAdmin(): boolean {
    return this.auth.getRole()?.toLowerCase() === 'superadmin';
  }

  get isAdmin(): boolean {
    return this.auth.getRole()?.toLowerCase() === 'admin';
  }

  get isEmpleado(): boolean {
    return this.auth.getRole()?.toLowerCase() === 'empleado';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
