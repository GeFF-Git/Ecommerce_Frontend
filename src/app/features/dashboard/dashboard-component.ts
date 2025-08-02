import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { DashboardStats } from '../../core/models/dashboard.model';
import { AppDashboard } from '../../core/services/app-dashboard';

@Component({
  selector: 'app-dashboard-component',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss'
})
export class DashboardComponent implements OnInit{
  dashboardStats$!: Observable<DashboardStats>;
  dashboardService = inject(AppDashboard);

  ngOnInit(): void {
    this.dashboardStats$ = this.dashboardService.getDashboardStats();
  }
}
