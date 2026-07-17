import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  isLoading: boolean = false;
  enviandoReset: boolean = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService) {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('Bem-vindo ao Los Corrales!');
          const userRole = String(response.user?.role || 'CAIXA').toUpperCase();
          this.router.navigate([userRole === 'ADMIN' ? '/dashboard' : '/pdv']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Falha no login:', err.error || err);
          this.notificationService.error(err.error?.message || 'Falha ao fazer login');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // Gera uma solicitação de redefinição de senha para o administrador
  esqueciSenha(ev: Event) {
    ev.preventDefault();
    if (this.enviandoReset) return;

    const emailCtrl = this.loginForm.get('email');
    const email = String(emailCtrl?.value || '').trim();
    if (!email || emailCtrl?.invalid) {
      this.notificationService.error('Digite seu e-mail no campo acima e clique em "Esqueci a senha".');
      emailCtrl?.markAsTouched();
      return;
    }

    this.enviandoReset = true;
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.enviandoReset = false;
        this.notificationService.success('Solicitação enviada! O administrador irá redefinir sua senha.');
      },
      error: (err) => {
        this.enviandoReset = false;
        this.notificationService.error(err.error?.message || 'Não foi possível enviar a solicitação.');
      }
    });
  }
}