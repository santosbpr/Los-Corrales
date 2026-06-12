import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-crm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crm.html'
})
export class CrmComponent implements OnInit {
  customers: any[] = [];
  searchTerm: string = '';
  
  // Objeto para segurar os dados do formulário
  newCustomer = {
    name: '',
    cpf: '',
    phone: '',
    email: ''
  };

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
    // Validação básica
    if (!this.newCustomer.name || !this.newCustomer.email) {
      this.notification.error('O Nome e o Email são obrigatórios!');
      return;
    }

    this.customerService.addCustomer(this.newCustomer).subscribe({
      next: () => {
        this.notification.success('Cliente cadastrado com sucesso!');
        // Limpa o formulário
        this.newCustomer = { name: '', cpf: '', phone: '', email: '' };
        // Recarrega a tabela
        this.loadCustomers();
      },
      error: () => this.notification.error('Erro ao salvar os dados do cliente.')
    });
  }

  excluirCliente(id: number, name: string) {
    // Tratamento seguro para a confirmação de exclusão
    if (confirm(`Tem certeza que deseja remover o cliente ${name}?`)) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.notification.success('Cliente removido com sucesso!');
          this.loadCustomers(); // Atualiza a tabela
        },
        error: () => this.notification.error('Não foi possível excluir o cliente.')
      });
    }
  }
}