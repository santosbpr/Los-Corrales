import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class ProfileComponent implements OnInit {
  colors: any[] = [];
  sizes: any[] = [];
  categories: any[] = [];
  newColorName: string = '';
  newSizeName: string = '';
  newCategoryName: string = '';
  newUser = {
    email: '',
    password: '',
    role: 'CAIXA' // Por defeito, criamos operadores de caixa
  };
  
  constructor(
    private settingsService: SettingsService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadAllSettings();
  }

  loadAllSettings() {
   
    this.settingsService.getColors().subscribe({
      next: (data) => { 
        this.colors = data; 
        this.cdr.detectChanges(); 
      },
      error: () => this.notification.error('Erro ao carregar lista de cores.')
    });

    
    this.settingsService.getSizes().subscribe({
      next: (data) => { 
        this.sizes = data; 
        this.cdr.detectChanges(); 
      },
      error: () => this.notification.error('Erro ao carregar lista de tamanhos.')
    });

   
    this.settingsService.getCategories().subscribe({
      next: (data) => { 
        this.categories = data; 
        this.cdr.detectChanges(); 
      },
      error: () => this.notification.error('Erro ao carregar categorias.')
    });
  }

  salvarCor() {
    if (!this.newColorName.trim()) return;
    this.settingsService.addColor(this.newColorName.trim()).subscribe({
      next: () => {
        this.notification.success('Nova cor adicionada com sucesso!');
        this.newColorName = '';
        this.loadAllSettings(); 
      },
      error: () => this.notification.error('Erro ao salvar cor.')
    });
  }

  excluirCor(id: number, name: string) {
    this.notification.confirmDelete(name).then((result) => {
      if (result.isConfirmed) {
        this.settingsService.deleteColor(id).subscribe({
          next: () => {
            this.notification.success('Cor removida!');
            this.loadAllSettings();
          },
          error: () => this.notification.error('Não foi possível excluir a cor.')
        });
      }
    });
  }

  salvarTamanho() {
    if (!this.newSizeName.trim()) return;
    this.settingsService.addSize(this.newSizeName.trim()).subscribe({
      next: () => {
        this.notification.success('Novo tamanho adicionado!');
        this.newSizeName = '';
        this.loadAllSettings();
      },
      error: () => this.notification.error('Erro ao salvar tamanho.')
    });
  }

  excluirTamanho(id: number, name: string) {
    this.notification.confirmDelete(name).then((result) => {
      if (result.isConfirmed) {
        this.settingsService.deleteSize(id).subscribe({
          next: () => {
            this.notification.success('Tamanho removido!');
            this.loadAllSettings();
          },
          error: () => this.notification.error('Não foi possível excluir o tamanho.')
        });
      }
    });
  }

  salvarCategoria() {
    if (!this.newCategoryName.trim()) return;
    this.settingsService.addCategory(this.newCategoryName.trim()).subscribe({
      next: () => {
        this.notification.success('Nova categoria adicionada!');
        this.newCategoryName = '';
        this.loadAllSettings();
      },
      error: () => this.notification.error('Erro ao salvar categoria.')
    });
  }

  excluirCategoria(id: number, name: string) {
    this.notification.confirmDelete(name).then((result) => {
      if (result.isConfirmed) {
        this.settingsService.deleteCategory(id).subscribe({
          next: () => {
            this.notification.success('Categoria removida!');
            this.loadAllSettings();
          },
          error: () => this.notification.error('Erro ao excluir a categoria.')
        });
      }
    });
  }

  salvarUtilizador() {
    if (!this.newUser.email || !this.newUser.password) {
      this.notification.error('Preencha o e-mail e a palavra-passe!');
      return;
    }

    this.authService.register(this.newUser).subscribe({
      next: () => {
        this.notification.success(`Utilizador ${this.newUser.role} criado com sucesso!`);
        this.newUser = { email: '', password: '', role: 'CAIXA' };
      },
      error: (err) => {
        // AQUI ESTÁ O SEGREDO: Vamos ver no console o erro real do servidor
        console.error('Detalhes do erro do servidor:', err);
        
        // Exibe a mensagem que vem do Back-end
        const mensagemErro = err.error?.message || 'Erro desconhecido ao criar utilizador.';
        this.notification.error(mensagemErro);
      }
    });
  }
}