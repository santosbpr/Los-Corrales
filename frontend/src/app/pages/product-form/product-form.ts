import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { NotificationService } from '../../services/notification.service';
import { SettingsService } from '../../services/settings.service';
import { SupplierService } from '../../services/supplier.service';

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
  suppliers: any[] = [];
  isSaving = false;

  productForm = new FormGroup({
    name: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    cost: new FormControl<number>(0, [Validators.min(0)]),
    supplier_id: new FormControl<number | null>(null),
    variants: new FormArray<FormGroup>([], Validators.required)
  });

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  private novaVariacao(v: any = {}): FormGroup {
    return new FormGroup({
      color: new FormControl(v.color || '', Validators.required),
      size: new FormControl(v.size ?? '', Validators.required),
      stock: new FormControl(v.stock ?? 0, [Validators.required, Validators.min(0)])
    });
  }

  addVariacao() {
    this.variants.push(this.novaVariacao({ stock: 0 }));
  }

  removerVariacao(i: number) {
    if (this.variants.length > 1) this.variants.removeAt(i);
    else this.notificationService.error('O produto precisa de ao menos uma variação.');
  }

  // Preenche o formulário ao abrir (edição) ou zera (novo)
  @Input() set product(val: any) {
    this.variants.clear();

    if (val) {
      this.currentProductId = val.id;
      this.productForm.patchValue({
        name: val.name,
        category: val.category,
        price: val.price ?? null,
        cost: val.cost ?? 0,
        supplier_id: val.supplier_id ?? null
      });
      const vs = Array.isArray(val.variants) && val.variants.length ? val.variants : [{}];
      vs.forEach((v: any) => this.variants.push(this.novaVariacao(v)));
    } else {
      this.currentProductId = null;
      this.productForm.patchValue({ name: '', category: '', price: null, cost: 0, supplier_id: null });
      this.productForm.markAsUntouched();
      this.variants.push(this.novaVariacao({ stock: 1 }));
    }
  }

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    private settingsService: SettingsService,
    private supplierService: SupplierService
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
        this.filtrarTamanhosPorCategoria(this.productForm.get('category')?.value || null);
      },
      error: () => this.notificationService.error('Erro ao carregar grade de tamanhos.')
    });

    // Fornecedores (para o vínculo do produto)
    this.supplierService.getSuppliers().subscribe({
      next: (data) => this.suppliers = data || [],
      error: () => { /* fornecedores é opcional no cadastro */ }
    });

    // A categoria é do produto (uma só) e define a grade de tamanhos das variações
    this.productForm.get('category')?.valueChanges.subscribe(cat => {
      this.filtrarTamanhosPorCategoria(cat);
    });
  }

  filtrarTamanhosPorCategoria(categoria: string | null) {
    if (!categoria) { this.filteredSizes = this.allSizes; return; }

    const catTexto = categoria.toLowerCase();
    const usarNumeros = ['calça', 'calca', 'bermuda', 'short'].some(p => catTexto.includes(p));
    const usarLetras = ['camisa', 'camiseta', 'jaqueta', 'casaco', 'moletom'].some(p => catTexto.includes(p));

    this.filteredSizes = this.allSizes.filter(size => {
      const isNumero = !isNaN(Number(size.name));
      if (usarNumeros) return isNumero;
      if (usarLetras) return !isNumero;
      return true;
    });
  }

  onSubmit() {
    if (this.isSaving) return;
    if (!this.productForm.valid) {
      this.productForm.markAllAsTouched();
      this.notificationService.error('Preencha os dados do produto e ao menos uma variação completa (cor, tamanho e estoque).');
      return;
    }

    const fv = this.productForm.value as any;
    const variants = (fv.variants || []).map((v: any) => ({
      color: v.color,
      size: v.size,
      stock: Number(v.stock) || 0
    }));

    // Impede variações duplicadas (mesma cor + tamanho)
    const chaves = new Set<string>();
    for (const v of variants) {
      const k = `${String(v.color).toUpperCase()}|${String(v.size).toUpperCase()}`;
      if (chaves.has(k)) {
        this.notificationService.error(`Variação duplicada: ${v.color} / ${v.size}. Remova a repetida.`);
        return;
      }
      chaves.add(k);
    }

    const payload = {
      name: fv.name,
      category: fv.category,
      description: 'Produto cadastrado via sistema',
      price: Number(fv.price) || 0,
      cost: Number(fv.cost) || 0,
      supplier_id: fv.supplier_id || null,
      // Sem sku/id aqui — o backend gera o SKU do produto e o id/sku de cada variação.
      variants
    };

    this.isSaving = true;
    const request$ = this.currentProductId
      ? this.productService.updateProduct(this.currentProductId, payload)
      : this.productService.createProduct(payload);

    request$.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: () => {
        this.notificationService.success(this.currentProductId ? 'Produto atualizado!' : 'Produto cadastrado com sucesso!');
        this.productSaved.emit();
      },
      error: () => this.notificationService.error('Erro ao guardar produto.')
    });
  }
}