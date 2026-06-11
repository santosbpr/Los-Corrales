import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  // Altere para localhost se estiver a testar apenas na sua máquina
  private apiUrl = 'https://los-corrales-api.onrender.com/api/customers'; 

  constructor(private http: HttpClient) {}

  // Busca o "crachá" do utilizador que fez login
  private getAuthHeaders() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return new HttpHeaders({ 
      'user-email': user?.email || '' 
    });
  }

  getCustomers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  addCustomer(customer: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, customer, { headers: this.getAuthHeaders() });
  }

  updateCustomer(id: number, customer: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, customer, { headers: this.getAuthHeaders() });
  }

  deleteCustomer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}