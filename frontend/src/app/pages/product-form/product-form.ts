import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Importamos as ferramentas de Formulário
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // 2. Ativamos elas aqui
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductFormComponent {
  // 3. Criamos o nosso formulário com regras (campos obrigatórios)
  productForm = new FormGroup({
    name: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
  });

  constructor(private productService: ProductService) {}

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

      this.productService.createProduct(newProduct).subscribe({
        next: (response) => {
          alert('Produto cadastrado com sucesso!'); // Avisa o usuário
          this.productForm.reset(); // Limpa os campos
        },
        error: (err) => {
          console.error('Erro ao salvar:', err);
          alert('Erro ao salvar produto.');
        }
      });
    }
  }
}