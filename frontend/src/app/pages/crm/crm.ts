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
  isSaving = false; // trava o botão durante o cadastro

  newCustomer = { name: '', cpf: '', phone: '', email: '' };

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
      next: (data: any) => {
        this.customers = data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Erro ao carregar a lista de clientes.')
    });
  }

  salvarCliente() {
    if (this.isSaving) return; // evita duplo-clique
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

  excluirCliente(id: number, name: string) {
    if (confirm(`Tem certeza que deseja remover o cliente ${name}?`)) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.notification.success('Cliente removido com sucesso!');
          this.loadCustomers();
        },
        error: () => this.notification.error('Não foi possível excluir o cliente.')
      });
    }
  }
}