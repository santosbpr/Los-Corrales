import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.scss'
})
export class FinanceComponent implements OnInit {
  transactions: any[] = [];
  isSaving = false; // trava o botão durante o lançamento

  newTransaction = {
    type: 'SAÍDA',
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
    if (this.isSaving) return; // evita duplo-clique
    if (!this.newTransaction.amount || !this.newTransaction.description) {
      alert('Preencha o valor e a descrição!');
      return;
    }

    this.isSaving = true;
    this.financeService.addTransaction(this.newTransaction)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          alert('Lançamento registrado com sucesso!');
          this.newTransaction = { type: 'SAÍDA', amount: null, description: '' };
          this.loadTransactions();
        },
        error: () => alert('Erro ao registrar lançamento.')
      });
  }

  getSaldoTotal(): number {
    return this.transactions.reduce((acc, curr) => {
      return curr.type === 'ENTRADA' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }
}