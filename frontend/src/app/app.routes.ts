import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { PdvComponent } from './pages/pdv/pdv';
import { ProfileComponent } from './pages/profile/profile';
import { CrmComponent } from './pages/crm/crm';
import { FinanceComponent } from './pages/finance/finance';
import { authGuard, loginGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // Login: bloqueado para quem já está autenticado
    { path: 'login', component: LoginComponent, canActivate: [loginGuard] },

    // Páginas de gestão: somente ADMIN
    { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard(['ADMIN'])] },
    { path: 'finance', component: FinanceComponent, canActivate: [roleGuard(['ADMIN'])] },
    { path: 'crm', component: CrmComponent, canActivate: [roleGuard(['ADMIN'])] },
    { path: 'profile', component: ProfileComponent, canActivate: [roleGuard(['ADMIN'])] },

    // Páginas operacionais: qualquer usuário autenticado (ADMIN ou CAIXA)
    { path: 'products', component: ProductListComponent, canActivate: [authGuard] },
    { path: 'pdv', component: PdvComponent, canActivate: [authGuard] },

    // Qualquer rota desconhecida cai numa protegida -> o guard resolve (login se deslogado)
    { path: '**', redirectTo: 'dashboard' }
];