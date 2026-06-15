import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private apiUrl = `${environment.apiUrl}/finance`;

  constructor(private http: HttpClient) {}

  // Busca o usuário logado para provar permissão (ADMIN) via header
  private getAuthHeaders() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return new HttpHeaders({
      'user-email': user?.email || ''
    });
  }

  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  addTransaction(transaction: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, transaction, { headers: this.getAuthHeaders() });
  }
}