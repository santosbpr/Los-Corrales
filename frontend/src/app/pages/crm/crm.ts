import { Component, OnInit } from '@angular/core';
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
  
  // Objeto para segurar os dados do formulário
  newCustomer = {
    name: '',
    cpf: '',
    phone: '',
    email: ''
  };

  constructor(
    private customerService: CustomerService,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (data) => this.customers = data,
      error: () => this.notification.error('Erro ao carregar a lista de clientes.')
    });
  }

  salvarCliente() {
    // Validação básica
    if (!this.newCustomer.name || !this.newCustomer.phone) {
      this.notification.error('O Nome e o Telefone são obrigatórios!');
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
    this.notification.confirmDelete(name).then((result) => {
      if (result.isConfirmed) {
        this.customerService.deleteCustomer(id).subscribe({
          next: () => {
            this.notification.success('Cliente removido da base!');
            this.loadCustomers();
          },
          error: () => this.notification.error('Erro ao tentar excluir o cliente.')
        });
      }
    });
  }
}