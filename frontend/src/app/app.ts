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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      
      // 1. Tenta ler o cargo e garante que fica tudo em maiúsculas (para evitar bugs de texto)
      let roleDoBanco = user.role ? user.role.toUpperCase() : 'CAIXA';

      // 2. A CHAVE MESTRA: Se for o e-mail oficial, o acesso é total e indiscutível!
      if (user.email === 'admin@loscorrales.com') {
        roleDoBanco = 'ADMIN';
      }

      this.userRole = roleDoBanco;
    }
  }
  
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.mobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // A FUNÇÃO QUE FALTAVA!
  sair() {
    localStorage.removeItem('token'); // Remove o crachá
    localStorage.removeItem('user');  // Remove os dados do utilizador
    this.userRole = 'CAIXA'; // Reseta o menu por segurança
  }
}