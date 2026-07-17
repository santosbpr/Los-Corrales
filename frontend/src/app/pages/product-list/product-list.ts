import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ProductFormComponent } from '../product-form/product-form';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductFormComponent, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductListComponent implements OnInit {
  products: any[] = [];          // lista crua (1 registro por variação)
  groupedProducts: any[] = [];   // agrupada por nome+categoria (o que a tela mostra)
  isModalOpen = false;
  productToEdit: any = null;
  searchTerm: string = '';
  expandedId: any = null;        // chave do grupo expandido
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private auth: AuthService
  ) {}

  // Junta registros com o mesmo nome+categoria; cada variação guarda seu registro de origem.
  private agruparProdutos(lista: any[]): any[] {
    const map = new Map<string, any>();
    for (const p of lista) {
      const key = `${p.name}||${p.category}`;
      if (!map.has(key)) map.set(key, { key, name: p.name, category: p.category, variants: [] });
      const grupo = map.get(key);
      const vars = Array.isArray(p.variants) ? p.variants : [];
      for (const v of vars) {
        grupo.variants.push({ ...v, product_id: p.id, product_price: p.price, _product: p });
      }
    }
    return Array.from(map.values());
  }

  // Filtra os GRUPOS por nome, categoria ou SKU de variação
  get filteredProducts() {
    const termo = this.searchTerm.toLowerCase().trim();
    if (!termo) return this.groupedProducts;
    return this.groupedProducts.filter(g =>
      (g.name || '').toLowerCase().includes(termo) ||
      (g.category || '').toLowerCase().includes(termo) ||
      g.variants.some((v: any) => (v.sku || '').toLowerCase().includes(termo))
    );
  }

  totalStock(grupo: any): number {
    if (Array.isArray(grupo.variants)) {
      return grupo.variants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0);
    }
    return 0;
  }

  toggleExpand(key: any) {
    this.expandedId = this.expandedId === key ? null : key;
  }

  openNewProductModal() {
    this.productToEdit = null;
    this.isModalOpen = true;
  }

  editProduct(product: any) {
    this.productToEdit = product;
    this.isModalOpen = true;
  }

  deleteProduct(id: number, name: string = 'este item') {
    this.notificationService.confirmDelete(name).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            this.notificationService.success('Produto removido com sucesso!');
            this.loadData();
          },
          error: () => this.notificationService.error('Não foi possível excluir o produto.')
        });
      }
    });
  }

  ngOnInit(): void {
    this.isAdmin = this.auth.getRole() === 'ADMIN';
    this.loadData();

    this.productService.refreshNeeded$.subscribe(() => {
      this.loadData();
      this.closeModal();
    });
  }

  loadData() {
    this.productService.getProducts().subscribe({
      next: (data: any) => {
        this.products = data.products ? data.products : data;
        this.groupedProducts = this.agruparProdutos(this.products);
        this.cdRef.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar produtos:', err)
    });
  }

  openModal() { this.isModalOpen = true; }
  closeModal() { this.isModalOpen = false; }
}