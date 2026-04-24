import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product'; // Ajustado para o nome curto

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html', // Ajustado para o seu arquivo
  styleUrl: './product-list.scss'     // Ajustado para o seu arquivo
})
export class ProductListComponent implements OnInit {
  products: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Dados recebidos da API:', this.products);
      },
      error: (err) => {
        console.error('Erro ao buscar produtos:', err);
      }
    });
  }
}