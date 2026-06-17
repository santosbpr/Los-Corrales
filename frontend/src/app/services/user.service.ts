import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // Exclui um usuário pelo e-mail (a lista vem de profiles, sem uuid do auth).
  deleteUser(email: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${encodeURIComponent(email)}`);
  }
}