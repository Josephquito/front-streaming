// src/app/services/usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  clave?: string;
  telefono?: string;
  rol: 'superadmin' | 'admin' | 'empleado';
  activo: boolean;
  negocio?: {
    id: number;
    nombre: string;
    correo_contacto: string;
    telefono: string;
  };
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  getTodosLosUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/todos`, {
      headers: this.getHeaders(),
    });
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  crearUsuario(data: any): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, data, {
      headers: this.getHeaders(),
    });
  }

  actualizarUsuario(
    id: number,
    cambios: Partial<Usuario>
  ): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}`, cambios, {
      headers: this.getHeaders(),
    });
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
