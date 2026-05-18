import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../../services/product';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductFormComponent {
  currentProductId: string | number | null = null;

  @Input() set product(val: any) {
    if (val) { //Se receber um produto, preenche o formulário com os dados para edição
      this.productForm.patchValue(val);
      this.currentProductId = val.id;
    } else {
      this.productForm.reset();
      this.currentProductId = null;
    }

    }

  // 3. Criamos o nosso formulário com regras (campos obrigatórios)
  productForm = new FormGroup({
    name: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
  });

  constructor(
    private productService: ProductService, 
    private notificationService: NotificationService
  ) {}

  // 4. A função que roda quando clicamos em "Salvar"
  onSubmit() {
    if (this.productForm.valid) {
      // Como o nosso back-end exige a propriedade "variants", 
      // vamos injetar uma variante padrão invisível por enquanto para o cadastro não falhar.
      const newProduct = {
        name: this.productForm.value.name,
        category: this.productForm.value.category,
        description: "Produto cadastrado via sistema",
        variants: [
          { sku: "GERADO-SISTEMA", color: "Padrão", size: "U", minimumStock: 1 }
        ]
      };

      if (this.currentProductId) {
        this.productService.updateProduct(this.currentProductId, newProduct).subscribe({
          next: () => {
            this.notificationService.success('Produto atualizado com sucesso!');
            // Obs: A janela já vai fechar sozinha porque a lista está ouvindo o sinal!
          },
          error: (err) => this.notificationService.error('Erro ao atualizar produto.')
        });
      } else {
        this.productService.createProduct(newProduct).subscribe({
          next: () => this.notificationService.success('Produto cadastrado com sucesso!'),
          error: (err) => this.notificationService.error('Erro ao salvar produto.')
        });
      }
    } else {
      this.productForm.markAllAsTouched(); // Mostra os erros de validação  
    }
  }
}