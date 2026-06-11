import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { PdvComponent } from './pages/pdv/pdv';
import { ProfileComponent } from './pages/profile/profile';
import { CrmComponent } from './pages/crm/crm';
import { FinanceComponent } from './pages/finance/finance';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'dashboard', component: DashboardComponent},
    {path: 'products', component: ProductListComponent},
    {path: 'pdv', component: PdvComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'crm', component: CrmComponent},
    {path: 'finance', component: FinanceComponent},

    {path: '**', redirectTo: 'dashboard'}
];