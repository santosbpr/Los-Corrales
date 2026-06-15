import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  success(message: string) {
    this.toast.fire({ icon: 'success', title: message });
  }

  error(message: string) {
    this.toast.fire({ icon: 'error', title: message });
  }

  confirmDelete(itemName: string): Promise<any> {
    return Swal.fire({
      title: 'Tem certeza?',
      text: `Você está prestes a excluir "${itemName}". Isso não pode ser desfeito!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });
  }

  // Pede ao admin a nova senha do usuário. Resolve com a senha digitada, ou null se cancelado.
  promptPasswordReset(email: string): Promise<string | null> {
    return Swal.fire({
      title: 'Resetar senha',
      text: `Defina uma nova senha para ${email}`,
      input: 'password',
      inputPlaceholder: 'Nova senha (mín. 6 caracteres)',
      inputAttributes: { autocomplete: 'new-password' },
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Resetar senha',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) =>
        (!value || value.length < 6) ? 'A senha precisa de pelo menos 6 caracteres.' : undefined
    }).then(result => (result.isConfirmed ? (result.value as string) : null));
  }
}