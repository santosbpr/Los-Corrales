import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list'
import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
    // ao entrar na raiz (localhost:4200), direciona para o Dashboard
    {path: '', redirectTo: 'dashboard', pathMatch: 'full'},

    // redireciona para pag de estoque
    {path: 'stock', component: ProductListComponent},

    //Caso haja caminhos inexistentes, redireciona
    {path: '**', redirectTo: 'stock'},

    // redireciona para o dashboard
    {path: 'dashboard', component: DashboardComponent}
];
