import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  totalProducts: number = 0;
  totalCategories: number = 0;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Assim que a tela abre, ele busca as roupas no Supabase
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Conta quantas roupas tem no total
        this.totalProducts = products.length;
        
        // Mágica do JavaScript para contar quantas categorias ÚNICAS existem
        const categories = products.map(p => p.category);
        this.totalCategories = new Set(categories).size;
      }
    });
  }
}