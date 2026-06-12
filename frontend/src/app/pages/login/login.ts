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
          
          // O Redirecionamento Inteligente com Chave Mestra:
          let userRole = response.user.role ? response.user.role.toUpperCase() : 'CAIXA';
          
          if (response.user.email === 'admin@loscorrales.com') {
            userRole = 'ADMIN';
          }

          if (userRole === 'ADMIN') {
            this.router.navigate(['/dashboard']); 
          } else {
            this.router.navigate(['/pdv']); 
          }
        },
        error: (err) => {
          this.isLoading = false; 
          this.notificationService.error(err.error?.message || 'Falha ao fazer login');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}