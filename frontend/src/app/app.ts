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
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // MELHORIA: Usamos o urlAfterRedirects e o método .includes() 
      // Isso evita que parâmetros extras na URL travem a lógica do menu
      const currentUrl = event.urlAfterRedirects || event.url;
      
      this.showSidebar = !currentUrl.includes('/login') && currentUrl !== '/';
    });
  }
}
