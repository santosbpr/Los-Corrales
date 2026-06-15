import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  // Cores
  getColors(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/colors`); }
  addColor(name: string): Observable<any> { return this.http.post<any>(`${this.apiUrl}/colors`, { name }); }
  deleteColor(id: number | string): Observable<any> { return this.http.delete(`${this.apiUrl}/colors/${id}`); }

  // Tamanhos
  getSizes(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/sizes`); }
  addSize(name: string): Observable<any> { return this.http.post<any>(`${this.apiUrl}/sizes`, { name }); }
  deleteSize(id: number | string): Observable<any> { return this.http.delete(`${this.apiUrl}/sizes/${id}`); }

  // Categorias
  getCategories(): Observable<any[]> { return this.http.get<any[]>(`${this.apiUrl}/categories`); }
  addCategory(name: string): Observable<any> { return this.http.post<any>(`${this.apiUrl}/categories`, { name }); }
  deleteCategory(id: number | string): Observable<any> { return this.http.delete(`${this.apiUrl}/categories/${id}`); }
}