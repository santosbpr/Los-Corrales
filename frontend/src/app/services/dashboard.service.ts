import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return new HttpHeaders({
      'user-email': user?.email || ''
    });
  }

  getSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`, { headers: this.getAuthHeaders() });
  }
}