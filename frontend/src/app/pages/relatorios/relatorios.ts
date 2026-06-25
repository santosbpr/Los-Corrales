import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ReportService } from '../../services/report.service';
import { NotificationService } from '../../services/notification.service';
import { PdfReportService } from '../../services/pdf-report.service';

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

  financial: any = null;
  inventory: any = null;
  users: any = null;

  constructor(
    private reportService: ReportService,
    private notification: NotificationService,
    private pdf: PdfReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
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

    forkJoin({
      financial: this.reportService.getFinancial(this.start, this.end),
      inventory: this.reportService.getInventory(this.start, this.end),
      users: this.reportService.getUsers(this.start, this.end)
    }).pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (r) => {
          this.financial = r.financial;
          this.inventory = r.inventory;
          this.users = r.users;
          this.cdr.detectChanges(); // força a renderização assim que os dados chegam
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