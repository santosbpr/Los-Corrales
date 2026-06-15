import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  // Header de identificação enviado nas operações protegidas (escrita exige ADMIN no backend)
  private getAuthHeaders() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return new HttpHeaders({
      'user-email': user?.email || ''
    });
  }

  // Cores
  getColors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/colors`);
  }
  addColor(name: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/colors`, { name }, { headers: this.getAuthHeaders() });
  }
  deleteColor(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/colors/${id}`, { headers: this.getAuthHeaders() });
  }

  // Tamanhos
  getSizes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sizes`);
  }
  addSize(name: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sizes`, { name }, { headers: this.getAuthHeaders() });
  }
  deleteSize(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sizes/${id}`, { headers: this.getAuthHeaders() });
  }

  // Categorias
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }
  addCategory(name: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, { name }, { headers: this.getAuthHeaders() });
  }
  deleteCategory(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, { headers: this.getAuthHeaders() });
  }
}