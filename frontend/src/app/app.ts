import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html'
})
export class AppComponent {
  showSidebar: boolean = true;
  isMobile: boolean = false;
  mobileMenuOpen: boolean = false;

  userRole: string = 'CAIXA';

  constructor(private router: Router) {
    this.checkScreenSize();
    this.checkUserRole();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentUrl = event.urlAfterRedirects || event.url;
      this.showSidebar = !currentUrl.includes('/login') && currentUrl !== '/';
      this.mobileMenuOpen = false;

      this.checkUserRole();
    });
  }

  checkUserRole() {
    // Acesso protegido ao localStorage (resiliente fora do browser: testes/SSR).
    if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
      return;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.userRole = 'CAIXA';
      return;
    }

    try {
      const user = JSON.parse(userStr);
      // O cargo vem do backend (lido de profiles no login). Normaliza em maiúsculas.
      this.userRole = user?.role ? String(user.role).toUpperCase() : 'CAIXA';
    } catch {
      // JSON inválido no storage: cai no padrão seguro.
      this.userRole = 'CAIXA';
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (typeof window === 'undefined') {
      return;
    }
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.mobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  sair() {
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.userRole = 'CAIXA';
    this.router.navigate(['/login']);
  }
}