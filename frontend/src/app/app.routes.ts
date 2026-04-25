import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list'
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';

export const routes: Routes = [
    // ao entrar na raiz (localhost:4200), direciona para o Dashboard
    {path: '', redirectTo: 'login', pathMatch: 'full'},

    // redireciona para pag de estoque
    {path: 'stock', component: ProductListComponent},

    // redireciona para o dashboard
    {path: 'dashboard', component: DashboardComponent},

    {path: 'login', component: LoginComponent},

    //Caso haja caminhos inexistentes, redireciona
    {path: '**', redirectTo: 'dashboard'} //SEMPRE COLOCAR POR ÚLTIMO, POIS ELE VAI REDIRECIONAR PARA QUALQUER ROTA QUE NÃO EXISTA
];
