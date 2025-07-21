import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../guards/auth.service';

export interface Plataforma {
  id: number;
  nombre: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class PlataformasService {
  private url = `${environment.apiUrl}/plataformas`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getPlataformas(): Observable<Plataforma[]> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Plataforma[]>(this.url, { headers });
  }
}
