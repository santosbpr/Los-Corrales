import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  // O caminho exato para o seu servidor no Render
  private apiUrl = 'https://los-corrales-api.onrender.com/api/finance';

  constructor(private http: HttpClient) {}

  // Vai buscar o utilizador logado para provar que tem permissão (ADMIN)
  private getAuthHeaders() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return new HttpHeaders({ 
      'user-email': user?.email || '' 
    });
  }

  // Pede o extrato completo ao banco de dados
  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // Envia uma nova despesa/entrada manual
  addTransaction(transaction: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, transaction, { headers: this.getAuthHeaders() });
  }
}