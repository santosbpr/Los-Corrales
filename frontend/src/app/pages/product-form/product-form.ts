import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProductService } from '../../services/product.service';
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
  availableCategories: any[] = [];
  allSizes: any[] = [];
  filteredSizes: any[] = [];
  isSaving = false; // trava o botão durante o salvamento

  @Input() set product(val: any) {
    if (val) {
      this.currentProductId = val.id;
      this.productForm.patchValue({
        name: val.name,
        category: val.category,
        color: val.variants && val.variants.length > 0 ? val.variants[0].color : '',
        size: val.variants && val.variants.length > 0 ? val.variants[0].size : '',
        stock: val.variants && val.variants.length > 0 ? val.variants[0].stock : 0
      });
    } else {
      this.productForm.reset({ stock: 1 });
      this.currentProductId = null;
    }
  }

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
    this.settingsService.getColors().subscribe({
      next: (data) => this.availableColors = data,
      error: () => this.notificationService.error('Erro ao carregar paleta de cores.')
    });

    this.settingsService.getCategories().subscribe({
      next: (data) => this.availableCategories = data,
      error: () => this.notificationService.error('Erro ao carregar categorias oficiais.')
    });

    this.settingsService.getSizes().subscribe({
      next: (data) => {
        this.allSizes = data;
        this.filteredSizes = data;
      },
      error: () => this.notificationService.error('Erro ao carregar grade de tamanhos.')
    });

    this.productForm.get('category')?.valueChanges.subscribe(categoriaSelecionada => {
      this.filtrarTamanhosPorCategoria(categoriaSelecionada);
    });
  }

  filtrarTamanhosPorCategoria(categoria: string | null) {
    if (!categoria) {
      this.filteredSizes = this.allSizes;
      return;
    }

    const catTexto = categoria.toLowerCase();
    const usarNumeros = ['calça', 'calca', 'bermuda', 'short'].some(palavra => catTexto.includes(palavra));
    const usarLetras = ['camisa', 'camiseta', 'jaqueta', 'casaco', 'moletom'].some(palavra => catTexto.includes(palavra));

    this.filteredSizes = this.allSizes.filter(size => {
      const isNumero = !isNaN(Number(size.name));
      if (usarNumeros) return isNumero;
      if (usarLetras) return !isNumero;
      return true;
    });

    this.productForm.patchValue({ size: '' });
  }

  onSubmit() {
    if (this.isSaving) return; // evita duplo-clique
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValues = this.productForm.value;
    const newProduct = {
      name: formValues.name,
      category: formValues.category,
      description: "Produto cadastrado via sistema",
      variants: [
        {
          sku: "SKU-" + Math.floor(Math.random() * 10000),
          color: formValues.color,
          size: formValues.size,
          stock: formValues.stock
        }
      ]
    };

    this.isSaving = true;
    const request$ = this.currentProductId
      ? this.productService.updateProduct(this.currentProductId, newProduct)
      : this.productService.createProduct(newProduct);

    request$.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: () => {
        this.notificationService.success(this.currentProductId ? 'Produto atualizado!' : 'Produto cadastrado com sucesso!');
        this.productSaved.emit();
      },
      error: () => this.notificationService.error('Erro ao guardar produto.')
    });
  }
}