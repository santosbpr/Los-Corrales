import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ExchangeService } from '../../services/exchange.service';
import { ProductService } from '../../services/product.service';
import { CustomerService } from '../../services/customer.service';
import { SalesService } from '../../services/sales.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-trocas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trocas.html',
  styleUrl: './trocas.scss'
})
export class TrocasComponent implements OnInit {
  // Opcional: o PDV pode passar a lista; se vier vazia, o componente carrega a sua.
  @Input() products: any[] = [];

  isAdmin = false;
  pendentes: any[] = [];

  // Vínculo com NF (venda de origem)
  customers: any[] = [];
  selectedCustomerId: any = null;
  vendasCliente: any[] = [];
  selectedSaleId: any = null;
  itensDaVenda: any[] = [];
  devolvidoItemIndex = 0;

  // Formulário de solicitação
  devolvidoProduto: any = null;
  devolvidoVarIndex = 0;
  devolvidoQtd = 1;

  temItemNovo = false;
  novoProduto: any = null;
  novoVarIndex = 0;
  novoQtd = 1;

  motivo = '';

  // Busca por referência (SKU da etiqueta)
  refDevolvido = '';
  refNovo = '';

  // Captura via leitor IoT (preenche o item escolhido, sem vender)
  scanRef = '';
  scanAlvo: 'devolvido' | 'novo' = 'devolvido';

  isSaving = false;
  processandoId: number | null = null;

  constructor(
    private exchangeService: ExchangeService,
    private productService: ProductService,
    private customerService: CustomerService,
    private salesService: SalesService,
    private notification: NotificationService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.getRole() === 'ADMIN';
    // Carrega os próprios produtos (não depende do timing do componente pai).
    if (!this.products || this.products.length === 0) {
      this.carregarProdutos();
    }
    this.carregarClientes();
    this.carregarPendentes();
  }

  carregarProdutos() {
    this.productService.getProducts().subscribe({
      next: (data: any) => {
        this.products = data.products ? data.products : data;
        this.cdr.detectChanges();
      },
      error: () => this.notification.error('Erro ao carregar produtos para a troca.')
    });
  }

  carregarPendentes() {
    this.exchangeService.listar('PENDENTE').subscribe({
      next: (data) => { this.pendentes = data; this.cdr.detectChanges(); },
      error: () => this.notification.error('Erro ao carregar trocas pendentes.')
    });
  }

  carregarClientes() {
    this.customerService.getCustomers().subscribe({
      next: (data: any) => { this.customers = data || []; this.cdr.detectChanges(); },
      error: () => { /* opcional */ }
    });
  }

  onClienteChange() {
    this.selectedSaleId = null;
    this.vendasCliente = [];
    this.itensDaVenda = [];
    this.devolvidoItemIndex = 0;
    if (!this.selectedCustomerId) { this.cdr.detectChanges(); return; }

    this.salesService.getCustomerSales(this.selectedCustomerId).subscribe({
      next: (data: any[]) => { this.vendasCliente = data || []; this.cdr.detectChanges(); },
      error: () => this.notification.error('Erro ao carregar as compras do cliente.')
    });
  }

  diasDaVenda(v: any): number {
    if (!v?.created_at) return 0;
    return Math.floor((Date.now() - new Date(v.created_at).getTime()) / (1000 * 60 * 60 * 24));
  }

  trocaExpirada(v: any): boolean {
    return this.diasDaVenda(v) > 30;
  }

  onVendaChange() {
    const venda = this.vendasCliente.find(v => v.id === this.selectedSaleId);
    this.itensDaVenda = venda?.sale_items || [];
    this.devolvidoItemIndex = 0;
    this.cdr.detectChanges();
  }

  // Decide a origem do item devolvido: item da NF (se uma venda foi escolhida) ou livre.
  private getReturnedPayload() {
    if (this.selectedSaleId && this.itensDaVenda.length > 0) {
      const it = this.itensDaVenda[this.devolvidoItemIndex];
      if (!it) return null;
      return {
        product_id: it.product_id,
        variant_id: it.variant_id,
        name: it.product_name,
        info: it.variant_info,
        qty: Number(this.devolvidoQtd) || 1,
        unit_price: Number(it.unit_price) || 0
      };
    }
    if (!this.devolvidoProduto) return null;
    return this.montarItem(this.devolvidoProduto, this.devolvidoVarIndex, this.devolvidoQtd);
  }

  // Captura do leitor IoT: usa o código lido como referência e preenche o item-alvo.
  // Importante: aqui NÃO há venda — é apenas localização do item para a troca.
  capturarIoT() {
    const ref = String(this.scanRef || '').trim();
    if (!ref) return;
    this.buscarPorReferencia(ref, this.scanAlvo);
    this.scanRef = ''; // limpa para o próximo bip
    this.cdr.detectChanges();
  }

  // Localiza um item pela referência (SKU do produto ou da variação) e preenche os seletores.
  buscarPorReferencia(ref: string, alvo: 'devolvido' | 'novo') {
    const termo = String(ref || '').trim().toUpperCase();
    if (!termo) return;

    for (const p of this.products) {
      // referência no nível do produto
      if (String(p.sku || '').trim().toUpperCase() === termo) {
        this.selecionar(p, 0, alvo);
        return;
      }
      // referência no nível da variação (mais preciso: cor/tamanho exatos)
      const vi = (p.variants || []).findIndex((v: any) =>
        String(v.sku || '').trim().toUpperCase() === termo);
      if (vi !== -1) {
        this.selecionar(p, vi, alvo);
        return;
      }
    }
    this.notification.error(`Referência "${ref}" não encontrada.`);
  }

  private selecionar(produto: any, varIndex: number, alvo: 'devolvido' | 'novo') {
    if (alvo === 'devolvido') {
      this.devolvidoProduto = produto;
      this.devolvidoVarIndex = varIndex;
    } else {
      this.novoProduto = produto;
      this.novoVarIndex = varIndex;
    }
    this.cdr.detectChanges();
  }

  private montarItem(produto: any, varIndex: number, qtd: number) {
    const v = produto.variants[varIndex];
    return {
      product_id: produto.id,
      variant_id: v?.id || null,
      name: produto.name,
      info: `Cor: ${v?.color} | Tam: ${v?.size}`,
      qty: Number(qtd) || 1,
      unit_price: Number(produto.price) || 0
    };
  }

  solicitar() {
    if (this.isSaving) return;

    const returned = this.getReturnedPayload();
    if (!returned) {
      this.notification.error('Selecione o item que está sendo devolvido.');
      return;
    }
    if (this.temItemNovo && !this.novoProduto) {
      this.notification.error('Selecione o item novo da troca (ou desmarque "trocar por outro item").');
      return;
    }

    const payload = {
      customer_id: this.selectedCustomerId || null,
      sale_id: this.selectedSaleId || null,
      reason: this.motivo,
      returned,
      delivered: this.temItemNovo ? this.montarItem(this.novoProduto, this.novoVarIndex, this.novoQtd) : null
    };

    this.isSaving = true;
    this.exchangeService.solicitar(payload)
      .pipe(finalize(() => { this.isSaving = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          this.notification.success('Troca enviada para aprovação do administrador.');
          this.devolvidoProduto = null; this.devolvidoVarIndex = 0; this.devolvidoQtd = 1;
          this.temItemNovo = false; this.novoProduto = null; this.novoVarIndex = 0; this.novoQtd = 1;
          this.motivo = '';
          this.selectedCustomerId = null; this.selectedSaleId = null; this.vendasCliente = []; this.itensDaVenda = []; this.devolvidoItemIndex = 0;
          this.carregarPendentes();
        },
        error: (err) => this.notification.error(err.error?.message || 'Erro ao registrar a troca.')
      });
  }

  aprovar(t: any) {
    if (this.processandoId) return;
    this.processandoId = t.id;
    this.exchangeService.aprovar(t.id)
      .pipe(finalize(() => { this.processandoId = null; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.notification.success(`Troca #${t.id} aprovada.`); this.carregarPendentes(); },
        error: (err) => this.notification.error(err.error?.message || 'Erro ao aprovar a troca.')
      });
  }

  rejeitar(t: any) {
    if (this.processandoId) return;
    this.processandoId = t.id;
    this.exchangeService.rejeitar(t.id)
      .pipe(finalize(() => { this.processandoId = null; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.notification.success(`Troca #${t.id} rejeitada.`); this.carregarPendentes(); },
        error: (err) => this.notification.error(err.error?.message || 'Erro ao rejeitar a troca.')
      });
  }
}