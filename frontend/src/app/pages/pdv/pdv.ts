import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { HardwareService } from '../../services/hardware.service';

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdv.html',
  styleUrl: './pdv.scss'
})
export class PdvComponent implements OnInit {
  products: any[] = [];
  selectedProduct: any = null;
  selectedVariantIndex: number = 0;
  quantity: number = 1;
  scannedCode: string = '';
  isProcessing = false; // trava a venda durante o processamento

  constructor(
    private productService: ProductService,
    private notification: NotificationService,
    private hardwareService: HardwareService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data: any) => {
        this.products = data.products ? data.products : data;
      },
      error: () => this.notification.error('Erro ao carregar produtos no painel de vendas.')
    });
  }

  onProductChange() {
    this.selectedVariantIndex = 0;
    this.quantity = 1;
  }

  finalizarVenda() {
    if (this.isProcessing) return; // evita venda duplicada por duplo-clique
    if (!this.selectedProduct) {
      this.notification.error('Por favor, selecione um produto.');
      return;
    }

    const productId = this.selectedProduct.id;
    const dadosVenda = {
      variantIndex: Number(this.selectedVariantIndex),
      quantity: Number(this.quantity)
    };

    this.isProcessing = true;
    this.productService.registerSale(productId, dadosVenda)
      .pipe(finalize(() => this.isProcessing = false))
      .subscribe({
        next: () => {
          this.notification.success('Venda realizada e estoque atualizado!');
          this.selectedProduct = null;
          this.selectedVariantIndex = 0;
          this.quantity = 1;
          this.loadProducts();
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Erro ao processar a venda.');
        }
      });
  }

  processarLeitura() {
    if (this.isProcessing) return;           // ignora "bips" enquanto processa
    if (!this.scannedCode.trim()) return;

    this.isProcessing = true;
    this.hardwareService.processScan(this.scannedCode)
      .pipe(finalize(() => { this.isProcessing = false; this.scannedCode = ''; }))
      .subscribe({
        next: (response) => {
          alert(`✅ Sucesso! ${response.product_name} vendido via hardware. Stock restante: ${response.stock_remaining}`);
        },
        error: (err) => {
          alert(`❌ Erro na leitura: ${err.error?.message || 'Falha ao processar.'}`);
        }
      });
  }
}