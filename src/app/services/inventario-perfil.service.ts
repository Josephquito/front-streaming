import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../guards/auth.service';

@Injectable({ providedIn: 'root' })
export class InventarioPerfilService {
  private url = `${environment.apiUrl}/inventario-perfil`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getInventario() {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(this.url, { headers });
  }
}
