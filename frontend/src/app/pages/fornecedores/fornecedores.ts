import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SupplierService } from '../../services/supplier.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-fornecedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fornecedores.html',
  styleUrl: './fornecedores.scss'
})
export class FornecedoresComponent implements OnInit {
  suppliers: any[] = [];
  isSaving = false;

  newSupplier = { name: '', cnpj: '', phone: '', email: '', contact_name: '', category: '', notes: '' };

  editing: any = null;
  isUpdating = false;

  constructor(
    private supplierService: SupplierService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => { this.suppliers = data; this.cdr.detectChanges(); },
      error: () => this.notification.error('Erro ao carregar fornecedores.')
    });
  }

  salvar() {
    if (this.isSaving) return;
    if (!this.newSupplier.name) { this.notification.error('O nome do fornecedor é obrigatório.'); return; }
    this.isSaving = true;
    this.supplierService.addSupplier(this.newSupplier)
      .pipe(finalize(() => { this.isSaving = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => {
          this.notification.success('Fornecedor cadastrado com sucesso!');
          this.newSupplier = { name: '', cnpj: '', phone: '', email: '', contact_name: '', category: '', notes: '' };
          this.load();
        },
        error: () => this.notification.error('Erro ao salvar o fornecedor.')
      });
  }

  editar(s: any) {
    this.editing = { ...s };
  }

  cancelarEdicao() {
    this.editing = null;
  }

  salvarEdicao() {
    if (this.isUpdating || !this.editing) return;
    if (!this.editing.name) { this.notification.error('O nome do fornecedor é obrigatório.'); return; }
    const { id, name, cnpj, phone, email, contact_name, category, notes } = this.editing;
    this.isUpdating = true;
    this.supplierService.updateSupplier(id, { name, cnpj, phone, email, contact_name, category, notes })
      .pipe(finalize(() => { this.isUpdating = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: () => { this.notification.success('Fornecedor atualizado com sucesso!'); this.editing = null; this.load(); },
        error: () => this.notification.error('Erro ao atualizar o fornecedor.')
      });
  }

  excluir(s: any) {
    if (!confirm(`Remover o fornecedor "${s.name}"?`)) return;
    this.supplierService.deleteSupplier(s.id).subscribe({
      next: () => { this.notification.success('Fornecedor removido.'); this.load(); },
      error: () => this.notification.error('Não foi possível excluir o fornecedor.')
    });
  }
}