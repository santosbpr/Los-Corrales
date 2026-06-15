import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  // Canal que avisa quando a lista de produtos precisa ser recarregada
  private _refreshNeeded$ = new Subject<void>();

  get refreshNeeded$() {
    return this._refreshNeeded$;
  }

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

  // Deleta um produto (rota protegida por ADMIN no backend)
  deleteProduct(id: number | string) {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = localStorage.getItem('token');

    // O backend identifica o usuário pelo header 'user-email' e consulta o role no banco.
    let headers = new HttpHeaders({
      'user-email': user?.email || ''
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  // Registra uma venda. ATENÇÃO: o backend expõe esta rota como '/:id/sale'.
  registerSale(id: number | string, saleData: { variantIndex: number, quantity: number }) {
    return this.http.post(`${this.apiUrl}/${id}/sale`, saleData);
  }
}