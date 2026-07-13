import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  totalRevenue: number = 0;
  totalItemsSold: number = 0;
  lowStockItems: any[] = [];

  charts: any = null;

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    this.loadCharts();
  }

  loadDashboardData() {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.totalRevenue = data.totalRevenue || 0;
        this.totalItemsSold = data.totalItemsSold || 0;
        this.lowStockItems = data.lowStockItems || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('🚨 Erro ao carregar o dashboard:', err)
    });
  }

  loadCharts() {
    this.dashboardService.getCharts().subscribe({
      next: (data) => { this.charts = data; this.cdr.detectChanges(); },
      error: (err) => {
        console.error('🚨 Erro ao carregar gráficos:', err);
        // Rede de segurança: mostra as pizzas zeradas em vez de sumir com tudo
        this.charts = {
          financeiro: { entradas: 0, saidas: 0 },
          mercadoria: { movimentada: 0, parada: 0 },
          tipoVenda: { presencial: 0, ecommerce: 0 }
        };
        this.cdr.detectChanges();
      }
    });
  }

  // Gera o conic-gradient da pizza (2 fatias). Se não há dados, cinza.
  pieGradient(a: number, b: number, colorA: string, colorB: string): string {
    const total = (Number(a) || 0) + (Number(b) || 0);
    if (total <= 0) return 'conic-gradient(#e0e0e0 0 100%)';
    const pct = (Number(a) / total) * 100;
    return `conic-gradient(${colorA} 0 ${pct}%, ${colorB} ${pct}% 100%)`;
  }

  pct(a: number, b: number): number {
    const total = (Number(a) || 0) + (Number(b) || 0);
    return total > 0 ? Math.round((Number(a) / total) * 100) : 0;
  }
}