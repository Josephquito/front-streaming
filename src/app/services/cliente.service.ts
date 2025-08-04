import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces
export interface Cliente {
  id: number;
  nombre: string;
  contacto?: string;
  clave?: string;
  fecha_creacion?: string;
  perfiles_activas?: any[];
}

export interface Cuenta {
  id: number;
  correo: string;
  plataforma: {
    nombre: string;
  };
}

export interface Perfil {
  id: number;
  nombre?: string;
  fecha_venta: string;
  fecha_corte?: string;
  fecha_baja?: string;
  precio: number;

  cuenta?: {
    correo: string;
    plataforma: {
      nombre: string;
    };
  };

  // 👇 Añade estas propiedades auxiliares (vienen del backend)
  correo_asignado?: string;
  plataforma_asignada?: string;
}

export interface HistorialCliente {
  cliente: Cliente;
  perfilesActivos: Perfil[];
  historialPerfiles: Perfil[];
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/mis-clientes`, {
      headers: this.getAuthHeaders(),
    });
  }

  crearCliente(cliente: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, cliente, {
      headers: this.getAuthHeaders(),
    });
  }

  editarCliente(id: number, cambios: Partial<any>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, cambios, {
      headers: this.getAuthHeaders(),
    });
  }

  eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getHistorialCliente(id: number): Observable<HistorialCliente> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<HistorialCliente>(`${this.apiUrl}/${id}/historial`, {
      headers,
    });
  }
}
