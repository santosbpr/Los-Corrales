import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  totalRevenue: number = 0;
  totalItemsSold: number = 0;
  lowStockItems: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.dashboardService.getSummary().subscribe({
      next: (data) => {
        this.totalRevenue = data.totalRevenue || 0;
        this.totalItemsSold = data.totalItemsSold || 0;
        this.lowStockItems = data.lowStockItems || [];
        
        // Manda o Angular redesenhar o ecrã com os novos números
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('🚨 Erro ao carregar o dashboard:', err);
      }
    });
  }
}