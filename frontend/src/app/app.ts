import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './pages/product-list/product-list';
import { ProductFormComponent } from './pages/product-form/product-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ ProductListComponent, CommonModule, ProductFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  title = 'los-corrales-app';
}
