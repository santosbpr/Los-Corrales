import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log("👉 1. Dashboard carregou! Pedindo dados ao Back-end...");

    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log("👉 2. Resposta do Supabase chegou:", products);

        // Garantimos que a resposta é um array antes de contar
        if (products && Array.isArray(products)) {
          this.totalProducts = products.length;
          
          const categories = products.map(p => p.category);
          this.totalCategories = new Set(categories).size;

          console.log(`👉 3. Matemática feita: ${this.totalProducts} produtos, ${this.totalCategories} categorias.`);

          // 2. O PULO DO GATO: Mandamos o Angular redesenhar o HTML na mesma hora!
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('🚨 Erro ao buscar produtos para o Dashboard:', err);
      }
    });
  }
}