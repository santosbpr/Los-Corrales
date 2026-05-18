import { Routes } from '@angular/router';
import { ProductListComponent } from './pages/product-list/product-list'
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LoginComponent } from './pages/login/login';
import { PdvComponent } from './pages/pdv/pdv';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
    // ao entrar na raiz (localhost:4200), direciona para o Dashboard
    {path: '', redirectTo: 'login', pathMatch: 'full'},

    {path: 'login', component: LoginComponent},
    
    // redireciona para o dashboard
    {path: 'dashboard', component: DashboardComponent},

    // redireciona para pag de estoque
    {path: 'products', component: ProductListComponent},

    // redireciona para a página de registro de venda
    {path: 'pdv', component: PdvComponent},

    // redireciona para a página de configurações (perfil)
    {path: 'profile', component: ProfileComponent},

    //Caso haja caminhos inexistentes, redireciona
    {path: '**', redirectTo: 'dashboard'} //SEMPRE COLOCAR POR ÚLTIMO, POIS ELE VAI REDIRECIONAR PARA QUALQUER ROTA QUE NÃO EXISTA
];
