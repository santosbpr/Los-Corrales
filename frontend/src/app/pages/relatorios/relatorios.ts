import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ReportService } from '../../services/report.service';
import { NotificationService } from '../../services/notification.service';
import { PdfReportService } from '../../services/pdf-report.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss'
})
export class RelatoriosComponent implements OnInit {
  start = '';
  end = '';
  loading = false;
  tipoPdf = 'geral';

  role = '';
  podeFinanceiro = false; // vendas/caixa
  podeEstoque = false;
  podeUsuarios = false;

  financial: any = null;
  inventory: any = null;
  users: any = null;

  constructor(
    private reportService: ReportService,
    private notification: NotificationService,
    private pdf: PdfReportService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.role = this.auth.getRole();
    this.podeFinanceiro = this.role === 'ADMIN' || this.role === 'CAIXA';
    this.podeEstoque    = this.role === 'ADMIN' || this.role === 'ESTOQUISTA';
    this.podeUsuarios   = this.role === 'ADMIN';

    // Tipo de PDF inicial conforme o que o papel pode ver
    this.tipoPdf = this.role === 'ADMIN' ? 'geral'
                 : this.podeFinanceiro ? 'financeiro'
                 : 'estoque';

    // Padrão: do primeiro dia do mês atual até hoje
    const hoje = new Date();
    const primeiro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    this.start = primeiro.toISOString().slice(0, 10);
    this.end = hoje.toISOString().slice(0, 10);
    this.gerar();
  }

  gerar() {
    if (this.loading) return;
    this.loading = true;

    const calls: any = {};
    if (this.podeFinanceiro) calls.financial = this.reportService.getFinancial(this.start, this.end);
    if (this.podeEstoque)    calls.inventory = this.reportService.getInventory(this.start, this.end);
    if (this.podeUsuarios)   calls.users = this.reportService.getUsers(this.start, this.end);

    forkJoin(calls).pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (r: any) => {
          if (r.financial) this.financial = r.financial;
          if (r.inventory) this.inventory = r.inventory;
          if (r.users) this.users = r.users;
          this.cdr.detectChanges();
        },
        error: () => this.notification.error('Erro ao gerar os relatórios.')
      });
  }

  baixarPdf() {
    if (!this.financial || !this.inventory || !this.users) {
      this.notification.error('Gere os relatórios antes de exportar.');
      return;
    }
    this.pdf.gerar(this.tipoPdf, { start: this.start, end: this.end }, {
      financial: this.financial,
      inventory: this.inventory,
      users: this.users
    });
  }
}