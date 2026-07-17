import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  colors: any[] = [];
  sizes: any[] = [];
  categories: any[] = [];
  users: any[] = [];
  resetRequests: any[] = [];

  newColorName: string = '';
  newSizeName: string = '';
  newCategoryName: string = '';

  newUser = { email: '', password: '', role: 'CAIXA' };

  isCreatingUser = false;
  resettingEmail: string | null = null;

  constructor(
    private settingsService: SettingsService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadAllSettings();
    this.loadUsers();
    this.loadResetRequests();
  }

  loadAllSettings() {
    this.settingsService.getColors().subscribe({
      next: (data) => { this.colors = data; this.cdr.detectChanges(); },
      error: () => this.notification.error('Erro ao carregar lista de cores.')
    });
    this.settingsService.getSizes().subscribe({
      next: (data) => { this.sizes = data; this.cdr.detectChanges(); },
      error: () => this.notification.error('Erro ao carregar lista de tamanhos.')
    });
    this.settingsService.getCategories().subscribe({
      next: (data) => { this.categories = data; this.cdr.detectChanges(); },
      error: () => this.notification.error('Erro ao carregar categorias.')
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => { this.users = data; this.cdr.detectChanges(); },
      error: () => this.notification.error('Erro ao carregar a lista de usuários.')
    });
  }

  loadResetRequests() {
    this.userService.getResetRequests().subscribe({
      next: (data) => { this.resetRequests = data || []; this.cdr.detectChanges(); },
      error: () => { /* silencioso: seção some se não houver dados */ }
    });
  }

  salvarCor() {
    if (!this.newColorName.trim()) return;
    this.settingsService.addColor(this.newColorName.trim()).subscribe({
      next: () => { this.notification.success('Nova cor adicionada com sucesso!'); this.newColorName = ''; this.loadAllSettings(); },
      error: () => this.notification.error('Erro ao salvar cor.')
    });
  }

  excluirCor(id: number, name: string) {
    this.notification.confirmDelete(name).then((result) => {
      if (result.isConfirmed) {
        this.settingsService.deleteColor(id).subscribe({
          next: () => { this.notification.success('Cor removida!'); this.loadAllSettings(); },
          error: () => this.notification.error('Não foi possível excluir a cor.')
        });
      }
    });
  }

  salvarTamanho() {
    if (!this.newSizeName.trim()) return;
    this.settingsService.addSize(this.newSizeName.trim()).subscribe({
      next: () => { this.notification.success('Novo tamanho adicionado!'); this.newSizeName = ''; this.loadAllSettings(); },
      error: () => this.notification.error('Erro ao salvar tamanho.')
    });
  }

  excluirTamanho(id: number, name: string) {
    this.notification.confirmDelete(name).then((result) => {
      if (result.isConfirmed) {
        this.settingsService.deleteSize(id).subscribe({
          next: () => { this.notification.success('Tamanho removido!'); this.loadAllSettings(); },
          error: () => this.notification.error('Não foi possível excluir o tamanho.')
        });
      }
    });
  }

  salvarCategoria() {
    if (!this.newCategoryName.trim()) return;
    this.settingsService.addCategory(this.newCategoryName.trim()).subscribe({
      next: () => { this.notification.success('Nova categoria adicionada!'); this.newCategoryName = ''; this.loadAllSettings(); },
      error: () => this.notification.error('Erro ao salvar categoria.')
    });
  }

  excluirCategoria(id: number, name: string) {
    this.notification.confirmDelete(name).then((result) => {
      if (result.isConfirmed) {
        this.settingsService.deleteCategory(id).subscribe({
          next: () => { this.notification.success('Categoria removida!'); this.loadAllSettings(); },
          error: () => this.notification.error('Erro ao excluir a categoria.')
        });
      }
    });
  }

  salvarUtilizador() {
    if (this.isCreatingUser) return;
    if (!this.newUser.email || !this.newUser.password) {
      this.notification.error('Preencha o e-mail e a palavra-passe!');
      return;
    }
    this.isCreatingUser = true;
    this.authService.register(this.newUser)
      .pipe(finalize(() => this.isCreatingUser = false))
      .subscribe({
        next: () => {
          this.notification.success(`Utilizador ${this.newUser.role} criado com sucesso!`);
          this.newUser = { email: '', password: '', role: 'CAIXA' };
          this.loadUsers();
        },
        error: (err) => {
          console.error('Detalhes do erro do servidor:', err);
          this.notification.error(err.error?.message || 'Erro desconhecido ao criar utilizador.');
        }
      });
  }

  // Reset de senha: admin define a nova senha
  resetarSenha(user: any) {
    if (this.resettingEmail) return;
    this.notification.promptPasswordReset(user.email).then((newPassword) => {
      if (!newPassword) return;

      this.resettingEmail = user.email;
      this.userService.resetPassword(user.email, newPassword)
        .pipe(finalize(() => { this.resettingEmail = null; this.cdr.detectChanges(); }))
        .subscribe({
          next: () => {
            this.notification.success(`Senha de ${user.email} redefinida!`);
            this.loadResetRequests(); // a solicitação pendente some após o reset
          },
          error: (err) => this.notification.error(err.error?.message || 'Não foi possível resetar a senha.')
        });
    });
  }

  // Dispensa uma solicitação sem redefinir
  dispensarSolicitacao(req: any) {
    this.userService.dismissResetRequest(req.id).subscribe({
      next: () => { this.notification.success('Solicitação dispensada.'); this.loadResetRequests(); },
      error: () => this.notification.error('Não foi possível dispensar a solicitação.')
    });
  }

  excluirUtilizador(user: any) {
    this.notification.confirmDelete(user.email).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.email).subscribe({
          next: () => { this.notification.success(`O acesso de ${user.email} foi removido com sucesso!`); this.loadUsers(); },
          error: (err) => {
            console.error('Erro ao deletar usuário:', err);
            this.notification.error(err.error?.message || 'Não foi possível excluir este usuário.');
          }
        });
      }
    });
  }
}