//src/app/services/finanzas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment'; // ajusta si tu path es diferente
import { Observable } from 'rxjs';

interface EgresoFijo {
  id: number;
  detalle: string;
  valor: number;
  fecha_creacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class FinanzasService {
  private apiUrl = `${environment.apiUrl}/finanzas/egresos-fijos`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // o usa tu servicio Auth
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  obtenerEgresosFijos(): Observable<EgresoFijo[]> {
    return this.http.get<EgresoFijo[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  crearEgresoFijo(data: { detalle: string; valor: number }): Observable<any> {
    return this.http.post(this.apiUrl, data, {
      headers: this.getHeaders(),
    });
  }

  eliminarEgresoFijo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  editarEgresoFijo(
    id: number,
    data: { detalle: string; valor: number }
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, {
      headers: this.getHeaders(),
    });
  }
}
