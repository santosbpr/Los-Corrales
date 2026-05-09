import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterLink } from '@angular/router'; // Adicionado aqui
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink], // E adicionado aqui
  templateUrl: './app.html'
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
