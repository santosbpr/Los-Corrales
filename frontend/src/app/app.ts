import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, RouterOutlet /*SidebarComponent*/],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  showSidebar: boolean = true;

  constructor(private router: Router) {
    // Aqui nós ficamos escutando a mudança de rotas no navegador
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Se a URL for a tela de login ou a raiz, a barra lateral fica invisível
      this.showSidebar = event.url !== '/login' && event.url !== '/';
    });
  }
}
