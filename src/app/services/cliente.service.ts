// src/app/services/cliente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Cliente {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<Cliente[]> {
    const token = localStorage.getItem('token'); // o usa tu AuthService si prefieres
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Cliente[]>(`${this.apiUrl}/mis-clientes`, { headers });
  }

  crearCliente(cliente: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}`, cliente, { headers });
  }

  editarCliente(id: number, cambios: Partial<any>): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.apiUrl}/${id}`, cambios, { headers });
  }
}
