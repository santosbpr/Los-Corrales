import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  // payload: { customer_id, payment_method, items: [{product_id, variant_id, quantity}] }
  createSale(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  getCustomerSales(customerId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/customer/${customerId}`);
  }
}