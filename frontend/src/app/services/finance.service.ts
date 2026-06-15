import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private apiUrl = `${environment.apiUrl}/finance`;

  constructor(private http: HttpClient) {}

  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addTransaction(transaction: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, transaction);
  }
}