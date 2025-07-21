//src/app/services/cuentas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../guards/auth.service';

export interface Cuenta {
  id: number;
  correo: string;
  clave: string;
  fecha_compra: string;
  tiempo_asignado: string;
  fecha_corte: string;
  proveedor: string;
  costo_total: string;
  numero_perfiles: number;
  perfiles_usados: number;
  plataforma: {
    id: number;
    nombre: string;
    color: string | null;
  };
}

@Injectable({ providedIn: 'root' })
export class CuentasService {
  private apiUrl = `${environment.apiUrl}/cuentas`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getCuentas(): Observable<Cuenta[]> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Cuenta[]>(this.apiUrl, { headers });
  }

  getCuenta(id: number): Observable<Cuenta> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Cuenta>(`${this.apiUrl}/${id}`, { headers });
  }
}
