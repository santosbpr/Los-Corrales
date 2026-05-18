import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // Ajuste a porta se o seu back-end rodar em outra (ex: 3000)
  private apiUrl = 'http://localhost:3000/api/settings'; 

  constructor(private http: HttpClient) {}

  // Métodos para Cores
  getColors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/colors`);
  }
  addColor(name: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/colors`, { name });
  }
  deleteColor(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/colors/${id}`);
  }


  // Métodos para Tamanhos
  getSizes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sizes`);
  }
  addSize(name: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sizes`, { name });
  }
  deleteSize(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sizes/${id}`);
  }

  
  // Métodos para Categorias
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }
  addCategory(name: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, { name });
  }
  deleteCategory(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }
}