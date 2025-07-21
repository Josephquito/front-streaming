import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-register.component.html',
})
export class AdminRegisterComponent {
  admin = {
    nombre: '',
    apellido: '',
    correo: '',
    clave: '',
    telefono: '',
    rol: 'admin', // Fijo
    negocio: {
      nombre: '',
      correo_contacto: '',
      telefono: '',
    },
  };

  cargando = false;
  mensaje = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  registrarAdmin() {
    this.cargando = true;
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    this.http
      .post(`${environment.apiUrl}/usuarios`, this.admin, { headers })
      .subscribe({
        next: () => {
          this.mensaje = '✅ Admin registrado con éxito.';
          this.error = '';
          this.resetFormulario();
        },
        error: () => {
          this.error = '❌ Error al registrar. Verifica los datos.';
          this.mensaje = '';
        },
        complete: () => {
          this.cargando = false;
        },
      });
  }

  resetFormulario() {
    this.admin = {
      nombre: '',
      apellido: '',
      correo: '',
      clave: '',
      telefono: '',
      rol: 'admin',
      negocio: {
        nombre: '',
        correo_contacto: '',
        telefono: '',
      },
    };
  }
}
