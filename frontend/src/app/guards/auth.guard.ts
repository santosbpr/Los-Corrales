import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Página inicial segura para cada papel (evita loop de redirecionamento).
function homeForRole(role: string): string {
  if (role === 'ADMIN') return '/dashboard';
  if (role === 'ESTOQUISTA') return '/products';
  return '/pdv'; // CAIXA e fallback
}

/** Bloqueia rota se não autenticado. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};

/** Impede usuário autenticado de voltar ao /login (manda para a home do papel). */
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  return router.createUrlTree([homeForRole(auth.getRole())]);
};

/** Guard de papel. Uso: canActivate: [roleGuard(['ADMIN','CAIXA'])] */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  const allowed = allowedRoles.map(r => r.toUpperCase());
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
    if (allowed.includes(auth.getRole())) return true;
    // Sem permissão: manda para a home do próprio papel (não gera loop)
    return router.createUrlTree([homeForRole(auth.getRole())]);
  };
};