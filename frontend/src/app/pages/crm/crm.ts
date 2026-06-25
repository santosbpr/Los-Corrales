import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CustomerService } from '../../services/customer.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-crm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crm.html',
  styleUrl: './crm.scss'
})
export class CrmComponent implements OnInit {
  customers: any[] = [];
  searchTerm: string = '';
  isSaving = false;

  newCustomer = { name: '', cpf: '', phone: '', email: '' };

  // Edição (revela os dados completos só aqui)
  editingCustomer: any = null;
  isUpdating = false;

  constructor(
    private customerService: CustomerService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (data: any) => { this.customers = data; this.cdr.detectChanges(); },
      error: () => this.notification.error('Erro ao carregar a lista de clientes.')
    });
  }

  // ===== Máscaras de exibição (censura parcial) =====
  maskCpf(cpf: string): string {
    if (!cpf) return '-';
    const d = String(cpf).replace(/\D/g, '');
    if (d.length < 4) return '***';
    return `${d.slice(0, 3)}.***.***-${d.slice(-2)}`;
  }

  maskEmail(email: string): string {
    if (!email) return '-';
    const [user, domain] = String(email).split('@');
    if (!domain) return '***';
    const u = user.length <= 1 ? user : `${user[0]}***`;
    return `${u}@${domain}`;
  }

  maskPhone(phone: string): string {
    if (!phone) return '-';
    const d = String(phone).replace(/\D/g, '');
    if (d.length < 4) return '***';
    return `(••) •••••-${d.slice(-4)}`;
  }

  // ===== Cadastro =====
  salvarCliente() {
    if (this.isSaving) return;
    if (!this.newCustomer.name || !this.newCustomer.email) {
      this.notification.error('O Nome e o Email são obrigatórios!');
      return;
    }
    this.isSaving = true;
    this.customerService.addCustomer(this.newCustomer)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          this.notification.success('Cliente cadastrado com sucesso!');
          this.newCustomer = { name: '', cpf: '', phone: '', email: '' };
          this.loadCustomers();
        },
        error: () => this.notification.error('Erro ao salvar os dados do cliente.')
      });
  }

  // ===== Edição (abre o cadastro com os dados reais) =====
  editar(c: any) {
    // cópia para não alterar a linha da tabela enquanto edita
    this.editingCustomer = { id: c.id, name: c.name, cpf: c.cpf, phone: c.phone, email: c.email };
  }

  cancelarEdicao() {
    this.editingCustomer = null;
  }

  salvarEdicao() {
    if (this.isUpdating || !this.editingCustomer) return;
    if (!this.editingCustomer.name || !this.editingCustomer.email) {
      this.notification.error('O Nome e o Email são obrigatórios!');
      return;
    }
    const { id, name, cpf, phone, email } = this.editingCustomer;
    this.isUpdating = true;
    this.customerService.updateCustomer(id, { name, cpf, phone, email })
      .pipe(finalize(() => { this.isUpdating = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          this.notification.success('Cliente atualizado com sucesso!');
          this.editingCustomer = null;
          this.loadCustomers();
        },
        error: () => this.notification.error('Erro ao atualizar o cliente.')
      });
  }

  // ===== Exclusão =====
  excluirCliente(id: number, name: string) {
    if (confirm(`Tem certeza que deseja remover o cliente ${name}?`)) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => { this.notification.success('Cliente removido com sucesso!'); this.loadCustomers(); },
        error: () => this.notification.error('Não foi possível excluir o cliente.')
      });
    }
  }
}