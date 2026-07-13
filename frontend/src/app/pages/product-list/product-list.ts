import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ProductFormComponent } from '../product-form/product-form';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductFormComponent, FormsModule],
  templateUrl: './product-list.html', // Ajustado para o seu arquivo
  styleUrl: './product-list.scss'     // Ajustado para o seu arquivo
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  isModalOpen = false //Varial que controla a janela modal de cadastro
  productToEdit: any = null; //Guarda o produto selecionado para edição
  searchTerm: string = ''; // Variável para armazenar o termo de busca
  expandedId: any = null;   // produto com variações expandidas

  constructor(
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService
    ) {}

  // Função para filtrar os produtos com base no termo de busca
  get filteredProducts() {
    const termo = this.searchTerm.toLowerCase().trim();
    if (!termo) return this.products;
    return this.products.filter(product =>
      (product.name || '').toLowerCase().includes(termo) ||
      (product.sku || '').toLowerCase().includes(termo) ||
      (Array.isArray(product.variants) &&
        product.variants.some((v: any) => (v.sku || '').toLowerCase().includes(termo)))
    );
  }

  // Soma o estoque de todas as variações
  totalStock(product: any): number {
    if (Array.isArray(product.variants)) {
      return product.variants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0);
    }
    return Number(product.quantity || product.stock || 0);
  }

  // Expande/colapsa as variações de um produto
  toggleExpand(id: any) {
    this.expandedId = this.expandedId === id ? null : id;
  } 
  
  // Função para abror o modal de NOVo produto
  openNewProductModal() {
    this.productToEdit = null; // Garante que o formulário esteja vazio
    this.isModalOpen = true;
  }

  //Funcão para abrir o modal de edição, preenchendo os campos com os dados do produto selecionado
  editProduct(product: any) {

    console.log('Produto selecionado para edição:', product);

    this.productToEdit = product; // Passa os dados do produto para o formulário
    this.isModalOpen = true;
  }

  // Função para deletar um produto, confirmando a ação com o usuário
  deleteProduct(id: number, name: string = 'este item') {
    this.notificationService.confirmDelete(name).then((result) => {
      // Se o usuário clicar no botão vermelho "Sim, excluir!" do pop-up bonitão
      if (result.isConfirmed) {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            this.notificationService.success('Produto removido com sucesso!');
            this.loadData(); // <-- CORRIGIDO: mudamos de loadProducts para loadData
          },
          error: () => {
            this.notificationService.error('Não foi possível excluir o produto.');
          }
        });
      }
    }); // <-- CORRIGIDO: Faltava fechar o parêntese do .then() aqui
  }

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