import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {}
