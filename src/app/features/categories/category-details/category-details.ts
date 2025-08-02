import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { Product } from '../../../core/models/product.model';
import { AppCategory } from '../../../core/services/app-category';
import { AppProduct } from '../../../core/services/app-product';

@Component({
  selector: 'app-category-details',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTableModule,
    MatTooltipModule
  ],
  templateUrl: './category-details.html',
  styleUrl: './category-details.scss'
})
export class CategoryDetails implements OnInit {
  category$!: Observable<Category>;
  categoryProducts$!: Observable<Product[]>;
  category: Category | null = null;
  categoryId!: number;
  attributeColumns: string[] = ['name', 'dataType', 'status', 'actions'];

  categoryService = inject(AppCategory);
  productService = inject(AppProduct);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.categoryId = +this.route.snapshot.params['id'];
    this.loadCategoryDetails();
  }

  loadCategoryDetails(): void {
    this.category$ = this.categoryService.getById(this.categoryId);
    // this.categoryProducts$ = this.productService.getByCategoryId(this.categoryId);
    this.categoryProducts$ = of([]); // Placeholder for products, can be replaced with actual service call

    this.category$.subscribe(category => {
      this.category = category;
    });
  }

  enableCategory(): void {
    this.categoryService.enable(this.categoryId).subscribe({
      next: () => {
        this.snackBar.open('Category enabled successfully', 'Close', { duration: 3000 });
        this.loadCategoryDetails();
      },
      error: (error) => {
        this.snackBar.open('Error enabling category: ' + error, 'Close', { duration: 5000 });
      }
    });
  }

  deleteCategory(): void {
    if (confirm('Are you sure you want to disable this category? This will also disable all its products.')) {
      this.categoryService.delete(this.categoryId).subscribe({
        next: () => {
          this.snackBar.open('Category disabled successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/categories']);
        },
        error: (error) => {
          this.snackBar.open('Error disabling category: ' + error, 'Close', { duration: 5000 });
        }
      });
    }
  }

  enableAttribute(attributeId: number): void {
    this.categoryService.enableAttribute(attributeId).subscribe({
      next: () => {
        this.snackBar.open('Attribute enabled successfully', 'Close', { duration: 3000 });
        this.loadCategoryDetails();
      },
      error: (error) => {
        this.snackBar.open('Error enabling attribute: ' + error, 'Close', { duration: 5000 });
      }
    });
  }

  deleteAttribute(attributeId: number): void {
    if (confirm('Are you sure you want to disable this attribute? This will affect all products using this attribute.')) {
      this.categoryService.deleteAttribute(attributeId).subscribe({
        next: () => {
          this.snackBar.open('Attribute disabled successfully', 'Close', { duration: 3000 });
          this.loadCategoryDetails();
        },
        error: (error) => {
          this.snackBar.open('Error disabling attribute: ' + error, 'Close', { duration: 5000 });
        }
      });
    }
  }

  getActiveAttributesCount(category: Category): number {
    return category.attributes.filter(attr => attr.isActive).length;
  }

  getDataTypeName(dataTypeId: number): string {
    const dataTypes = {
      1: 'String',
      2: 'Integer',
      3: 'Decimal',
      4: 'Boolean',
      5: 'Date',
      6: 'JSON'
    };
    return dataTypes[dataTypeId as keyof typeof dataTypes] || 'Unknown';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
