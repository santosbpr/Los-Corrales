import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // Notificação que aparece no canto da tela e some sozinha
  private toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Notificação de Sucesso (Verdinha) no canto da tela
  success(message: string) {
    this.toast.fire({
      icon: 'success',
      title: message
    });
  }

  // Notificação de Erro (Vermelha) no canto da tela
  error(message: string) {
    this.toast.fire({
      icon: 'error',
      title: message
    });
  }

  // Pop-up central para confirmar uma exclusão (Avisa antes de apagar)
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
}