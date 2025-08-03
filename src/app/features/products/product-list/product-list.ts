import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, Observable, combineLatest, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { Product } from '../../../core/models/product.model';
import { AppCategory } from '../../../core/services/app-category';
import { AppProduct } from '../../../core/services/app-product';

@Component({
  selector: 'app-product-list',
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss'
})
export class ProductList implements OnInit {
  products$!: Observable<Product[]>;
  categories$!: Observable<Category[]>;
  filteredProducts$!: Observable<Product[]>;

  displayedColumns: string[] = ['product', 'category', 'price', 'stock', 'attributes', 'status', 'actions'];

  // Filter subjects for reactive updates
  private searchSubject = new BehaviorSubject<string>('');
  private categorySubject = new BehaviorSubject<number | null>(null);
  private statusSubject = new BehaviorSubject<string>('all');

  productService = inject(AppProduct);
  categoryService = inject(AppCategory);
  snackBar = inject(MatSnackBar);

  // Getters and setters for filters
  get searchTerm(): string {
    return this.searchSubject.value;
  }

  set searchTerm(value: string) {
    this.searchSubject.next(value);
  }

  get selectedCategoryId(): number | null {
    return this.categorySubject.value;
  }

  set selectedCategoryId(value: number | null) {
    this.categorySubject.next(value);
  }

  get selectedStatus(): string {
    return this.statusSubject.value;
  }

  set selectedStatus(value: string) {
    this.statusSubject.next(value);
  }

  ngOnInit(): void {
    this.loadData();
    this.setupFilters();
  }

  loadData(): void {
    this.products$ = this.productService.getAll();
    this.categories$ = this.categoryService.getAll();
    this.setupFilters();
  }

  setupFilters(): void {
    this.filteredProducts$ = combineLatest([
      this.products$,
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()),
      this.categorySubject,
      this.statusSubject
    ]).pipe(
      map(([products, searchTerm, categoryId, status]) => {
        return products.filter(product => {
          // Search filter
          const matchesSearch = !searchTerm ||
            product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

          // Category filter
          const matchesCategory = !categoryId || product.categoryId === categoryId;

          // Status filter
          const matchesStatus = status === 'all' ||
            (status === 'active' && product.isActive) ||
            (status === 'inactive' && !product.isActive);

          return matchesSearch && matchesCategory && matchesStatus;
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
    this.selectedCategoryId = null;
    this.selectedStatus = 'all';
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to disable this product?')) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.snackBar.open('Product disabled successfully', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          this.snackBar.open('Error disabling product: ' + error, 'Close', { duration: 5000 });
        }
      });
    }
  }

  enableProduct(id: number): void {
    this.productService.enable(id).subscribe({
      next: () => {
        this.snackBar.open('Product enabled successfully', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (error) => {
        this.snackBar.open('Error enabling product: ' + error, 'Close', { duration: 5000 });
      }
    });
  }

  getAttributeDisplay(product: Product): string {
    const maxDisplay = 3;
    const attributes = product.attributes.filter(attr => attr.value).slice(0, maxDisplay);
    const display = attributes.map(attr => `${attr.attributeName}: ${attr.value}`).join(', ');
    const remaining = product.attributes.length - maxDisplay;
    return remaining > 0 ? `${display} (+${remaining} more)` : display;
  }

formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
}
}
