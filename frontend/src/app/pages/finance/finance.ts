import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html'
})
export class FinanceComponent implements OnInit {
  transactions: any[] = [];
  
  // Objeto para o lançamento manual
  newTransaction = {
    type: 'SAÍDA', // Padrão
    amount: null,
    description: ''
  };

  constructor(private financeService: FinanceService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.financeService.getTransactions().subscribe({
      next: (data) => this.transactions = data,
      error: (err) => console.error('Erro ao buscar extrato financeiro:', err)
    });
  }

  registrarLancamento() {
    if (!this.newTransaction.amount || !this.newTransaction.description) {
      alert('Preencha o valor e a descrição!');
      return;
    }

    this.financeService.addTransaction(this.newTransaction).subscribe({
      next: () => {
        alert('Lançamento registrado com sucesso!');
        this.newTransaction = { type: 'SAÍDA', amount: null, description: '' };
        this.loadTransactions(); // Atualiza a tabela
      },
      error: () => alert('Erro ao registrar lançamento.')
    });
  }

  // Função auxiliar para calcular o saldo atual
  getSaldoTotal(): number {
    return this.transactions.reduce((acc, curr) => {
      return curr.type === 'ENTRADA' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }
}