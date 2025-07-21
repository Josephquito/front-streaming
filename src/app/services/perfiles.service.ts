// src/app/services/perfil.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

export interface Perfil {
  id?: number;
  cuentaId: number;
  clienteId: number;
  fecha_venta: string;
  tiempo_asignado: string;
  precio: number;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private apiUrl = 'http://localhost:3000/perfiles';

  constructor(private http: HttpClient) {}

  getPerfiles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getPerfil(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearPerfil(perfil: Perfil): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.apiUrl, perfil, { headers });
  }

  actualizarPerfil(id: number, datos: Partial<Perfil>): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${id}`, datos, { headers });
  }

  eliminarPerfil(id: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  getPerfilesByCuenta(cuentaId: number): Observable<Perfil[]> {
    const token = localStorage.getItem('token'); // o usa AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Perfil[]>(`${this.apiUrl}/cuenta/${cuentaId}`, {
      headers,
    });
  }
}
