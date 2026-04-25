import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajuste a porta se o seu Node estiver rodando em uma diferente de 3000
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Se o login der certo, salvamos o Crachá (Token) no cofre do navegador
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  // Função para checar se o usuário tem o crachá guardado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Função para sair do sistema
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}