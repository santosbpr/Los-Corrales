import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { HardwareService } from '../../services/hardware.service';

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pdv.html'
})
export class PdvComponent implements OnInit {
  products: any[] = [];
  selectedProduct: any = null;
  selectedVariantIndex: number = 0;
  quantity: number = 1;
  scannedCode: string = '';

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
        // Ajuste para garantir que pegamos o array correto vindo da API
        this.products = data.products ? data.products : data;
      },
      error: () => this.notification.error('Erro ao carregar produtos no painel de vendas.')
    });
  }

  onProductChange() {
    this.selectedVariantIndex = 0; // Reseta para a primeira variação se mudar de produto
    this.quantity = 1;
  }

  finalizarVenda() {
    if (!this.selectedProduct) {
      this.notification.error('Por favor, selecione um produto.');
      return;
    }

    const productId = this.selectedProduct.id;
    const dadosVenda = {
      variantIndex: Number(this.selectedVariantIndex),
      quantity: Number(this.quantity)
    };

    this.productService.registerSale(productId, dadosVenda).subscribe({
      next: (res: any) => {
        // Dispara o nosso Toast lindo do SweetAlert2!
        this.notification.success('Venda realizada e estoque atualizado!');
        
        // Limpa o formulário para a próxima venda
        this.selectedProduct = null;
        this.quantity = 1;
        
        // Recarrega os produtos para atualizar os números de estoque na tela
        this.loadProducts();
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao processar a venda.');
      }
    });
  }
  processarLeitura() {
    if (!this.scannedCode.trim()) return;

    this.hardwareService.processScan(this.scannedCode).subscribe({
      next: (response) => {
        // Se a API validar a leitura, a venda foi feita, o stock caiu e o caixa subiu!
        alert(`✅ Sucesso! ${response.product_name} vendido via hardware. Stock restante: ${response.stock_remaining}`);
        
        // Limpa o campo para o próximo "bip" do leitor
        this.scannedCode = ''; 
      },
      error: (err) => {
        // Mostra o erro exato que o nosso Back-end enviou (ex: "Produto não cadastrado" ou "Estoque insuficiente")
        alert(`❌ Erro na leitura: ${err.error?.message || 'Falha ao processar.'}`);
        this.scannedCode = ''; 
      }
    });
  }
}