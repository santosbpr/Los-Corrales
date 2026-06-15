import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  private _refreshNeeded$ = new Subject<void>();
  get refreshNeeded$() { return this._refreshNeeded$; }

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product).pipe(
      tap(() => this._refreshNeeded$.next())
    );
  }

  updateProduct(id: string | number, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product).pipe(
      tap(() => this._refreshNeeded$.next())
    );
  }

  // Credenciais (user-email + token) são injetadas pelo authInterceptor.
  deleteProduct(id: number | string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // O backend expõe esta rota como '/:id/sale'.
  registerSale(id: number | string, saleData: { variantIndex: number, quantity: number }) {
    return this.http.post(`${this.apiUrl}/${id}/sale`, saleData);
  }
}