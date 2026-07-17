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
  products: any[] = [];        // lista crua vinda da API (1 registro por variação)
  groupedProducts: any[] = []; // agrupada por nome+categoria (o que o PDV mostra)
  customers: any[] = [];

  // Item em montagem (cascata: produto -> cor -> tamanho)
  selectedProduct: any = null; // um GRUPO ({ name, category, variants[] })
  selectedColor: string | null = null;
  selectedSize: any = null;
  quantity = 1;

  // Carrinho
  cart: any[] = [];
  selectedCustomerId: any = null;
  paymentMethod = 'DINHEIRO';
  saleType = 'PRESENCIAL';
  discount = 0;

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
      next: (data: any) => {
        this.products = data.products ? data.products : data;
        this.groupedProducts = this.agruparProdutos(this.products);
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Erro ao carregar produtos.')
    });
  }

  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (data: any) => { this.customers = data || []; this.cdr.detectChanges(); },
      error: () => { /* cliente é opcional; falha silenciosa */ }
    });
  }

  // Junta registros com o mesmo nome+categoria em um único "produto",
  // reunindo todas as variações. Cada variação guarda de qual registro veio.
  private agruparProdutos(lista: any[]): any[] {
    const map = new Map<string, any>();
    for (const p of lista) {
      const key = `${p.name}||${p.category}`;
      if (!map.has(key)) map.set(key, { name: p.name, category: p.category, variants: [] });
      const grupo = map.get(key);
      for (const v of (p.variants || [])) {
        grupo.variants.push({ ...v, product_id: p.id, product_price: p.price });
      }
    }
    return Array.from(map.values());
  }

  // ===== Seleção em cascata =====
  get coresDisponiveis(): string[] {
    const vs = this.selectedProduct?.variants || [];
    return Array.from(new Set(vs.map((v: any) => v.color)));
  }

  get tamanhosDisponiveis(): any[] {
    if (!this.selectedProduct || this.selectedColor == null) return [];
    return (this.selectedProduct.variants || []).filter((v: any) => v.color === this.selectedColor);
  }

  get variacaoAtual(): any {
    if (!this.selectedProduct || this.selectedColor == null || this.selectedSize == null) return null;
    return (this.selectedProduct.variants || []).find(
      (v: any) => v.color === this.selectedColor && String(v.size) === String(this.selectedSize)
    ) || null;
  }

  onProductChange() {
    this.selectedColor = null;
    this.selectedSize = null;
    this.quantity = 1;
    const cores = this.coresDisponiveis;
    if (cores.length === 1) { this.selectedColor = cores[0]; this.onColorChange(); }
  }

  onColorChange() {
    this.selectedSize = null;
    const tams = this.tamanhosDisponiveis;
    if (tams.length === 1) { this.selectedSize = tams[0].size; }
  }

  get subtotal(): number {
    return this.cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  }

  get total(): number {
    const desc = Number(this.discount) || 0;
    return Math.max(0, this.subtotal - desc);
  }

  // Adiciona ao carrinho a partir dos dados resolvidos (id/preço vêm da variação agrupada).
  private addToCart(productId: any, productName: string, price: number, variant: any, qty: number) {
    if (!variant) { this.notification.error('Selecione a variação (cor e tamanho).'); return; }

    const existente = this.cart.find(i => i.variant_id === variant.id);
    const jaNoCarrinho = existente ? existente.quantity : 0;
    const disponivel = Number(variant.stock) || 0;

    if (qty + jaNoCarrinho > disponivel) {
      this.notification.error(`Estoque insuficiente de ${productName} (${variant.color}/${variant.size}). Disponível: ${disponivel}.`);
      return;
    }

    if (existente) {
      existente.quantity += qty;
    } else {
      this.cart.push({
        product_id: productId,
        variant_id: variant.id,
        product_name: productName,
        variant_info: `Cor: ${variant.color} | Tam: ${variant.size}`,
        sku: variant.sku || '',
        unit_price: Number(price) || 0,
        quantity: qty
      });
    }
    this.cdr.detectChanges();
  }

  adicionarItem() {
    if (!this.selectedProduct) { this.notification.error('Selecione um produto.'); return; }
    const v = this.variacaoAtual;
    if (!v) { this.notification.error('Escolha a cor e o tamanho.'); return; }

    // v carrega product_id e product_price do registro de origem
    this.addToCart(v.product_id, this.selectedProduct.name, v.product_price, v, Number(this.quantity) || 1);

    this.selectedProduct = null;
    this.selectedColor = null;
    this.selectedSize = null;
    this.quantity = 1;
  }

  removerItem(idx: number) {
    this.cart.splice(idx, 1);
    this.cdr.detectChanges();
  }

  // Leitor: acha a variação pelo SKU na lista crua e adiciona ao carrinho.
  processarLeitura() {
    const code = String(this.scannedCode || '').trim();
    this.scannedCode = '';
    if (!code) return;

    for (const p of this.products) {
      const v = (p.variants || []).find((x: any) => String(x.sku || '').trim().toUpperCase() === code.toUpperCase());
      if (v) { this.addToCart(p.id, p.name, p.price, v, 1); return; }
    }
    this.notification.error(`Referência "${code}" não encontrada.`);
  }

  finalizarVenda() {
    if (this.isProcessing) return;
    if (this.cart.length === 0) { this.notification.error('Adicione itens ao carrinho.'); return; }

    const payload = {
      customer_id: this.selectedCustomerId || null,
      payment_method: this.paymentMethod,
      source: this.saleType,
      discount: Number(this.discount) || 0,
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
          this.saleType = 'PRESENCIAL';
          this.discount = 0;
          this.loadProducts();
        },
        error: (err) => this.notification.error(err.error?.message || 'Erro ao finalizar a venda.')
      });
  }
}