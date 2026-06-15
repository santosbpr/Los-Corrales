import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Anexa automaticamente as credenciais em TODA requisição destinada à nossa API:
 *  - user-email (usado pelo backend para autorização/auditoria)
 *  - Authorization: Bearer <token>
 * Só age em URLs da própria API (environment.apiUrl) para não vazar credenciais a terceiros.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');

  const setHeaders: Record<string, string> = {};
  if (user?.email) setHeaders['user-email'] = user.email;
  if (token) setHeaders['Authorization'] = `Bearer ${token}`;

  return next(Object.keys(setHeaders).length ? req.clone({ setHeaders }) : req);
};