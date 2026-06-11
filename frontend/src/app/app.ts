import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router'; // <-- RouterLinkActive adicionado
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], // <-- RouterLinkActive adicionado
  templateUrl: './app.html'
})
export class AppComponent {
  showSidebar: boolean = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentUrl = event.urlAfterRedirects || event.url;
      this.showSidebar = !currentUrl.includes('/login') && currentUrl !== '/';
    });
  }
}