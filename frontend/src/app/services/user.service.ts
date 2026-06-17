import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Lista usuários (e-mail + cargo). Credenciais vão pelo authInterceptor.
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Admin define nova senha para o usuário informado.
  resetPassword(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, password });
  }

  // Adicione junto dos outros métodos na classe UserService
  deleteUser(id: string | number) {
    const token = localStorage.getItem('token');
    
    // Monta o cabeçalho de autorização se o token existir
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Faz a requisição DELETE para a API
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}