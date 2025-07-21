import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../guards/auth.service';
import { environment } from '../../../../environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-editar-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-admin.component.html',
})
export class EditarAdminComponent implements OnInit {
  adminId = '';
  admin: any = null;

  cargando = true;
  mensaje = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.adminId = this.route.snapshot.paramMap.get('id') || '';
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any>(`${environment.apiUrl}/usuarios/${this.adminId}`, { headers })
      .subscribe({
        next: (data) => {
          this.admin = data;
          this.cargando = false;
        },
        error: () => {
          this.error = 'Error al cargar el administrador';
          this.cargando = false;
        },
      });
  }

  guardarCambios() {
    if (!this.admin) return;

    this.cargando = true;
    this.mensaje = '';
    this.error = '';

    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const body = {
      telefono: this.admin.telefono,
      negocio: {
        nombre: this.admin.negocio?.nombre,
        telefono: this.admin.negocio?.telefono,
        correo_contacto: this.admin.negocio?.correo_contacto,
      },
    };

    this.http
      .patch(`${environment.apiUrl}/usuarios/${this.adminId}`, body, {
        headers,
      })
      .subscribe({
        next: () => {
          this.mensaje = '✅ Cambios guardados correctamente';
          this.error = '';
          this.cargando = false;

          setTimeout(() => {
            this.location.back(); // ⬅️ redirige automáticamente a la vista anterior
          }, 1000);
          // Si quieres redirigir al listado después:
          // this.router.navigate(['/admin-list']);
        },
        error: () => {
          this.error = '❌ Error al guardar los cambios';
          this.cargando = false;
        },
      });
  }
}
