import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // Login deu certo! Manda o gerente pro Dashboard.
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          // Temporário até colocarmos nossos Toasts bonitões!
          alert('Erro: ' + (err.error?.message || 'Falha ao fazer login'));
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}