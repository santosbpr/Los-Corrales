import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Bloqueia qualquer rota se o usuário não estiver autenticado.
 * Sem token -> redireciona para /login.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

/**
 * Impede que um usuário já autenticado volte para a tela de /login.
 * Manda para a home conforme o papel (ADMIN -> dashboard, demais -> pdv).
 */
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return true;
  }
  const home = auth.getRole() === 'ADMIN' ? '/dashboard' : '/pdv';
  return router.createUrlTree([home]);
};

/**
 * Guard de papel (autorização). Uso: canActivate: [roleGuard(['ADMIN'])]
 * Não autenticado -> /login. Autenticado sem permissão -> /pdv (à prova de beco sem saída).
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  const allowed = allowedRoles.map(r => r.toUpperCase());
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }
    if (allowed.includes(auth.getRole())) {
      return true;
    }
    return router.createUrlTree(['/pdv']);
  };
};