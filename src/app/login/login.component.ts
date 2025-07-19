import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../guards/auth.service'; // ← IMPORTA el servicio
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  cargando = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService // ← INYECTA el servicio
  ) {}

  login() {
    this.cargando = true;
    this.errorMessage = '';

    this.http
      .post<any>(`${environment.apiUrl}/auth/login`, {
        correo: this.email,
        clave: this.password,
      })
      .subscribe({
        next: (res) => {
          this.auth.setToken(res.access_token, res.usuario.rol); // ✅ ← Usa el servicio
          this.router.navigate(['/inicio']); // ← O cualquier ruta protegida
        },
        error: () => {
          this.errorMessage = 'Credenciales incorrectas';
          this.cargando = false;
        },
        complete: () => {
          this.cargando = false;
        },
      });
  }
}
