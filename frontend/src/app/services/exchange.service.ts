import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExchangeService {
  private apiUrl = `${environment.apiUrl}/exchanges`;

  constructor(private http: HttpClient) {}

  solicitar(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  listar(status = 'PENDENTE'): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?status=${status}`);
  }

  aprovar(id: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/approve`, {});
  }

  rejeitar(id: number | string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reject`, {});
  }
}