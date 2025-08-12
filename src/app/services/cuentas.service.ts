// src/app/services/cuentas.service.ts
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

// 👇 Añade esta interfaz
export interface RenovarPayload {
  fecha_compra: string; // 'YYYY-MM-DD'
  tiempo_asignado: string; // '1 mes' | '30 dias' | etc.
  costo_total: number | string;
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

  // 🛠️ PATCH para reemplazar/actualizar una cuenta
  actualizarCuenta(id: number, datos: any): Observable<any> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.apiUrl}/${id}`, datos, { headers });
  }

  // ✅ Nuevo: RENOVAR (usa el endpoint /cuentas/:id/renovar)
  renovarCuenta(id: number, datos: RenovarPayload): Observable<Cuenta> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const payload = {
      fecha_compra: datos.fecha_compra,
      tiempo_asignado: datos.tiempo_asignado,
      costo_total: Number(datos.costo_total), // el backend espera number
    };

    return this.http.patch<Cuenta>(`${this.apiUrl}/${id}/renovar`, payload, {
      headers,
    });
  }
}
