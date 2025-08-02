import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { AppCategory } from '../../../core/services/app-category';

@Component({
  selector: 'app-category-list',
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryList implements OnInit {
  categories$!: Observable<Category[]>;
  displayedColumns: string[] = ['name', 'attributes', 'status', 'actions'];

  categoryService = inject(AppCategory);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories$ = this.categoryService.getAll();
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to disable this category? This will also disable all its products.')) {
      this.categoryService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Category disabled successfully', 'Close', { duration: 3000 });
          this.loadCategories();
        },
        error: (error) => {
          this.snackBar.open('Error disabling category: ' + error, 'Close', { duration: 5000 });
        }
      });
    }
  }

  enableCategory(id: number): void {
    this.categoryService.enable(id).subscribe({
      next: () => {
        this.snackBar.open('Category enabled successfully', 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (error) => {
        this.snackBar.open('Error enabling category: ' + error, 'Close', { duration: 5000 });
      }
    });
  }
}
