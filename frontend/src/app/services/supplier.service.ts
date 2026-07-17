import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private apiUrl = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  addSupplier(supplier: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, supplier);
  }
  updateSupplier(id: number, supplier: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, supplier);
  }
  deleteSupplier(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}