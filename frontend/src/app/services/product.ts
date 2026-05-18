import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://los-corrales-api.onrender.com/api/products';

  //canal que atualiza a lista de produtos
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
      tap(() => {
        this._refreshNeeded$.next();
      })
    );
  }

  //Atualiza um produto existente
  updateProduct(id:string | number, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product).pipe(
      tap(() => {
        this._refreshNeeded$.next();
      })
    );
  }

  //Deleta um produto existente
  deleteProduct(id: string | number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._refreshNeeded$.next();
      })
    );
  }

  //Registra uma venda, enviando o ID do produto e os dados da venda (variante e quantidade)
  registerSale(id: number | string, saleData: { variantIndex: number, quantity: number }) {
    // Garanta que a URL bate com a do seu back-end (ex: http://localhost:3000/api/products)
    return this.http.post(`${this.apiUrl}/${id}/sell`, saleData);
  }
}
