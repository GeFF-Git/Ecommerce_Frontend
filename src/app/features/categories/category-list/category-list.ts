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
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { AppCategory } from '../../../core/services/app-category';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-category-list',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss'
})
export class CategoryList implements OnInit {
  categories$!: Observable<Category[]>;
  filteredCategories$!: Observable<Category[]>;
  displayedColumns: string[] = ['name', 'attributes', 'status', 'actions'];

  // Filter subjects for reactive updates
  private searchSubject = new BehaviorSubject<string>('');
  private statusSubject = new BehaviorSubject<string>('all');

  categoryService = inject(AppCategory);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);

  // Getters and setters for filters
  get searchTerm(): string {
    return this.searchSubject.value;
  }

  set searchTerm(value: string) {
    this.searchSubject.next(value);
  }

  get selectedStatus(): string {
    return this.statusSubject.value;
  }

  set selectedStatus(value: string) {
    this.statusSubject.next(value);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setupFilters();
  }

  loadCategories(): void {
    this.categories$ = this.categoryService.getAll();
    this.setupFilters();
  }

  setupFilters(): void {
    this.filteredCategories$ = combineLatest([
      this.categories$,
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()),
      this.statusSubject
    ]).pipe(
      map(([categories, searchTerm, status]) => {
        return categories.filter(category => {
          // Search filter
          const matchesSearch = !searchTerm ||
            category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.categoryDescription && category.categoryDescription.toLowerCase().includes(searchTerm.toLowerCase()));

          // Status filter
          const matchesStatus = status === 'all' ||
            (status === 'active' && category.isActive) ||
            (status === 'inactive' && !category.isActive);

          return matchesSearch && matchesStatus;
        });
      })
    );
  }

  onFilterChange(): void {
    // This method is kept for backward compatibility with the template
    // but filtering now happens automatically through the subjects
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
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

  getActiveAttributesCount(category: Category): number {
    return category.attributes.filter(attr => attr.isActive).length;
  }

  getTotalAttributesCount(category: Category): number {
    return category.attributes.length;
  }

  getAttributesDisplay(category: Category): string {
    const activeAttrs = category.attributes.filter(attr => attr.isActive);
    return activeAttrs.map(attr => attr.attributeDisplayName).join(', ');
  }
}
