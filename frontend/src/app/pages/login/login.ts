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
  templateUrl: './login.html'
})
export class LoginComponent {
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
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Toast de sucesso bonito!
          this.notificationService.success('Bem-vindo ao Los Corrales!');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          // Toast de erro elegante em vez do alert do navegador!
          this.notificationService.error(err.error?.message || 'Falha ao fazer login');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}