import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  private params(start?: string, end?: string): HttpParams {
    let p = new HttpParams();
    if (start) p = p.set('start', start);
    if (end) p = p.set('end', end);
    return p;
  }

  getFinancial(start?: string, end?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/financial`, { params: this.params(start, end) });
  }
  getInventory(start?: string, end?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventory`, { params: this.params(start, end) });
  }
  getUsers(start?: string, end?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`, { params: this.params(start, end) });
  }
}