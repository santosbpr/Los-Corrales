import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product'; // Ajustado para o nome curto
import { ProductFormComponent } from '../product-form/product-form';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './product-list.html', // Ajustado para o seu arquivo
  styleUrl: './product-list.scss'     // Ajustado para o seu arquivo
})
export class ProductListComponent implements OnInit {
  products: any[] = [];

  //Varial que controla a janela modal de cadastro
  isModalOpen = false

  constructor(private productService: ProductService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Carrega os produtos qnd inicializado
    this.loadData();
    
    // recarregar a lista quando um produto for criado
    this.productService.refreshNeeded$.subscribe(() => {
      this.loadData();
      this.closeModal(); // Fecha a modal após o cadastro
    });
  }

  loadData() {
    this.productService.getProducts().subscribe({
      next: (data: any) => {
        this.products = data.products ? data.products : data;

        // Força a atualização da view para refletir os novos dados
        this.cdRef.detectChanges(); 
        console.log('Dados recebidos da API:', this.products);
      },
      error: (err) => {
        console.error('Erro ao buscar produtos:', err);
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  // ngOnInit(): void {
  //   this.productService.getProducts().subscribe({
  //     next: (data: any) => {
  //       this.products = data.products ? data.products : data;
  //       console.log('Dados recebidos da API:', this.products);
  //     },
  //     error: (err) => {
  //       console.error('Erro ao buscar produtos:', err);
  //     }
  //   });
  // }
}