import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../guards/auth.service';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-list.component.html',
})
export class AdminListComponent implements OnInit {
  admins: any[] = [];
  cargando = true;
  error = '';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router // ✅ inyectado correctamente
  ) {}

  ngOnInit(): void {
    console.log('📦 AdminListComponent cargado');

    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any[]>(`${environment.apiUrl}/usuarios/admins`, { headers })
      .subscribe({
        next: (data) => {
          this.admins = data;
          this.cargando = false;
        },
        error: () => {
          this.error = 'Error al cargar administradores';
          this.cargando = false;
        },
      });
  }

  editarAdmin(id: number) {
    this.router.navigate(['/usuarios', id]); // ✅ navegación por ID
  }

  eliminarAdmin(admin: any) {
    const confirmado = confirm(
      `¿Eliminar a ${admin.nombre} ${admin.apellido}?`
    );
    if (!confirmado) return;

    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .delete(`${environment.apiUrl}/usuarios/${admin.id}`, { headers })
      .subscribe({
        next: () => {
          this.admins = this.admins.filter((a) => a.id !== admin.id);
        },
        error: () => {
          this.error = 'Error al eliminar el administrador';
        },
      });
  }
}
