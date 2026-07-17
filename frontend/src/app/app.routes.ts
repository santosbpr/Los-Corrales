import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { PdvComponent } from './pages/pdv/pdv';
import { ProfileComponent } from './pages/profile/profile';
import { CrmComponent } from './pages/crm/crm';
import { FinanceComponent } from './pages/finance/finance';
import { RelatoriosComponent } from './pages/relatorios/relatorios';
import { FornecedoresComponent } from './pages/fornecedores/fornecedores';
import { loginGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: 'login', component: LoginComponent, canActivate: [loginGuard] },

    // Gestão: somente ADMIN
    { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard(['ADMIN'])] },
    { path: 'finance', component: FinanceComponent, canActivate: [roleGuard(['ADMIN'])] },
    { path: 'profile', component: ProfileComponent, canActivate: [roleGuard(['ADMIN'])] },
    { path: 'fornecedores', component: FornecedoresComponent, canActivate: [roleGuard(['ADMIN'])] },

    // CRM: ADMIN e CAIXA
    { path: 'crm', component: CrmComponent, canActivate: [roleGuard(['ADMIN', 'CAIXA'])] },

    // PDV: ADMIN e CAIXA (Estoquista não vende)
    { path: 'pdv', component: PdvComponent, canActivate: [roleGuard(['ADMIN', 'CAIXA'])] },

    // Estoque (Produtos): ADMIN, CAIXA (leitura) e ESTOQUISTA
    { path: 'products', component: ProductListComponent, canActivate: [roleGuard(['ADMIN', 'CAIXA', 'ESTOQUISTA'])] },

    // Relatórios: ADMIN (todos), CAIXA (vendas) e ESTOQUISTA (estoque) — a página filtra por papel
    { path: 'relatorios', component: RelatoriosComponent, canActivate: [roleGuard(['ADMIN', 'CAIXA', 'ESTOQUISTA'])] },

    { path: '**', redirectTo: 'login' }
];