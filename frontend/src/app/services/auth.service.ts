import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Persiste token e usuário (com role) no navegador
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  // Token presente = sessão ativa
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Papel do usuário logado (sempre em maiúsculas; vazio se não houver)
  getRole(): string {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return String(user?.role || '').toUpperCase();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }
}