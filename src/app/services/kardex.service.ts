import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../guards/auth.service';

@Injectable({ providedIn: 'root' })
export class KardexService {
  private url = `${environment.apiUrl}/movimiento-inventario`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getMovimientosPorPlataforma(plataformaId: number) {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.url}/${plataformaId}`, { headers });
  }
}
