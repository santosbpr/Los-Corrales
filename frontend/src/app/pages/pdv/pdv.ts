import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CustomerService } from '../../services/customer.service';
import { SalesService } from '../../services/sales.service';
import { NotificationService } from '../../services/notification.service';
import { TrocasComponent } from '../../components/trocas/trocas';

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [CommonModule, FormsModule, TrocasComponent],
  templateUrl: './pdv.html',
  styleUrl: './pdv.scss'
})
export class PdvComponent implements OnInit {
  products: any[] = [];
  customers: any[] = [];

  // Item em montagem
  selectedProduct: any = null;
  selectedVariantIndex = 0;
  quantity = 1;

  // Carrinho
  cart: any[] = [];
  selectedCustomerId: any = null;
  paymentMethod = 'DINHEIRO';

  scannedCode = '';
  isProcessing = false;

  constructor(
    private productService: ProductService,
    private customerService: CustomerService,
    private salesService: SalesService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCustomers();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data: any) => { this.products = data.products ? data.products : data; this.cdr.detectChanges(); },
      error: () => this.notification.error('Erro ao carregar produtos.')
    });
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (data: any) => { this.customers = data || []; this.cdr.detectChanges(); },
      error: () => { /* cliente é opcional; falha silenciosa */ }
    });
  }

  onProductChange() {
    this.selectedVariantIndex = 0;
    this.quantity = 1;
  }

  get total(): number {
    return this.cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  }

  private addVariantToCart(product: any, variantIndex: number, qty: number) {
    const v = product.variants?.[variantIndex];
    if (!v) { this.notification.error('Variação inválida.'); return; }

    const existente = this.cart.find(i => i.variant_id === v.id);
    const jaNoCarrinho = existente ? existente.quantity : 0;
    const disponivel = Number(v.stock) || 0;

    if (qty + jaNoCarrinho > disponivel) {
      this.notification.error(`Estoque insuficiente de ${product.name} (${v.color}/${v.size}). Disponível: ${disponivel}.`);
      return;
    }

    if (existente) {
      existente.quantity += qty;
    } else {
      this.cart.push({
        product_id: product.id,
        variant_id: v.id,
        product_name: product.name,
        variant_info: `Cor: ${v.color} | Tam: ${v.size}`,
        unit_price: Number(product.price) || 0,
        quantity: qty
      });
    }
    this.cdr.detectChanges();
  }

  adicionarItem() {
    if (!this.selectedProduct) { this.notification.error('Selecione um produto.'); return; }
    this.addVariantToCart(this.selectedProduct, Number(this.selectedVariantIndex), Number(this.quantity) || 1);
    this.selectedProduct = null;
    this.selectedVariantIndex = 0;
    this.quantity = 1;
  }

  removerItem(idx: number) {
    this.cart.splice(idx, 1);
    this.cdr.detectChanges();
  }

  // O leitor agora ADICIONA ao carrinho (não vende direto).
  processarLeitura() {
    const code = String(this.scannedCode || '').trim();
    this.scannedCode = '';
    if (!code) return;

    for (const p of this.products) {
      const vi = (p.variants || []).findIndex((v: any) => String(v.sku || '').trim().toUpperCase() === code.toUpperCase());
      if (vi !== -1) { this.addVariantToCart(p, vi, 1); return; }
    }
    this.notification.error(`Referência "${code}" não encontrada.`);
  }

  finalizarVenda() {
    if (this.isProcessing) return;
    if (this.cart.length === 0) { this.notification.error('Adicione itens ao carrinho.'); return; }

    const payload = {
      customer_id: this.selectedCustomerId || null,
      payment_method: this.paymentMethod,
      items: this.cart.map(i => ({ product_id: i.product_id, variant_id: i.variant_id, quantity: i.quantity }))
    };

    this.isProcessing = true;
    this.salesService.createSale(payload)
      .pipe(finalize(() => { this.isProcessing = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          this.notification.success('Venda concluída e estoque atualizado!');
          this.cart = [];
          this.selectedCustomerId = null;
          this.paymentMethod = 'DINHEIRO';
          this.loadProducts();
        },
        error: (err) => this.notification.error(err.error?.message || 'Erro ao finalizar a venda.')
      });
  }
}