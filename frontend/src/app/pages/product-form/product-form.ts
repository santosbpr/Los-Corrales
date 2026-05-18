import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../../services/product';
import { NotificationService } from '../../services/notification.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductFormComponent implements OnInit {
  currentProductId: string | number | null = null;
  @Output() productSaved = new EventEmitter<void>();

  availableColors: any[] = [];
  availableSizes: any[] = [];
  availableCategories: any[] = [];

  @Input() set product(val: any) {
    if (val) {
      this.currentProductId = val.id;
      // Preenche os campos "desempacotando" a primeira variante do array
      this.productForm.patchValue({
        name: val.name,
        category: val.category,
        color: val.variants && val.variants.length > 0 ? val.variants[0].color : '',
        size: val.variants && val.variants.length > 0 ? val.variants[0].size : '',
        stock: val.variants && val.variants.length > 0 ? val.variants[0].stock : 0
      });
    } else {
      this.productForm.reset({ stock: 1 }); // Valor padrão do estoque
      this.currentProductId = null;
    }

  }

  // 3. Criamos o nosso formulário com regras (campos obrigatórios)
  productForm = new FormGroup({
    name: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    color: new FormControl('', Validators.required),
    size: new FormControl('', Validators.required),
    stock: new FormControl(1, [Validators.required, Validators.min(0)])
  });

  constructor(
    private productService: ProductService, 
    private notificationService: NotificationService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    // Carrega as opções de CORES para os selects
    this.settingsService.getColors().subscribe({
      next: (data) => this.availableColors = data,
      error: () => this.notificationService.error('Erro ao carregar paleta de cores.')
    });

    // Carrega as opções de TAMANHOS para os selects
    this.settingsService.getSizes().subscribe({
      next: (data) => this.availableSizes = data,
      error: () => this.notificationService.error('Erro ao carregar grade de tamanhos.')
    });

    // Carrega as opções de CATEGORIAS para os selects
    this.settingsService.getCategories().subscribe({
      next: (data) => this.availableCategories = data,
      error: () => this.notificationService.error('Erro ao carregar categorias oficiais.')
    });
  }

  // 4. A função que roda quando clicamos em "Salvar"
  onSubmit() {
    if (this.productForm.valid) {
      const formValues = this.productForm.value;

      // Como o nosso back-end exige a propriedade "variants", 
      // vamos injetar uma variante padrão invisível por enquanto para o cadastro não falhar.
      const newProduct = {
        name: formValues.name,
        category: formValues.category,
        description: "Produto cadastrado via sistema",
        variants: [
          {
            sku: "SKU-" + Math.floor(Math.random() * 10000), // Gera um código único aleatório
            color: formValues.color,
            size: formValues.size,
            stock: formValues.stock
          }
        ]
      };

      if (this.currentProductId) {
        this.productService.updateProduct(this.currentProductId, newProduct).subscribe({
          next: () => {
            this.notificationService.success('Produto atualizado!');
            this.productSaved.emit();
          },
          error: () => this.notificationService.error('Erro ao atualizar.')
        });
      } else {
        this.productService.createProduct(newProduct).subscribe({
          next: () => {
            this.notificationService.success('Produto cadastrado com sucesso!');
            this.productSaved.emit();
          },
          error: () => this.notificationService.error('Erro ao salvar produto.')
        });
      }
    } else {
      this.productForm.markAllAsTouched();
    }
  }
}