import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'https://los-corrales-api.onrender.com/api/dashboard';

  constructor(private http: HttpClient) {}

  // Vai buscar o e-mail real do utilizador que fez login
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