import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { AppProduct } from '../../../core/services/app-product';

@Component({
  selector: 'app-product-details',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss'
})
export class ProductDetails {
  product$!: Observable<Product>;
  product: Product | null = null;
  productId!: number;

  productService = inject(AppProduct);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.productId = +this.route.snapshot.params['id'];
    this.loadProduct();
  }

  loadProduct(): void {
    this.product$ = this.productService.getById(this.productId);
    this.product$.subscribe(product => {
      this.product = product;
    });
  }

  enableProduct(): void {
    this.productService.enable(this.productId).subscribe({
      next: () => {
        this.snackBar.open('Product enabled successfully', 'Close', { duration: 3000 });
        this.loadProduct();
      },
      error: (error) => {
        this.snackBar.open('Error enabling product: ' + error, 'Close', { duration: 5000 });
      }
    });
  }

  deleteProduct(): void {
    if (confirm('Are you sure you want to disable this product?')) {
      this.productService.delete(this.productId).subscribe({
        next: () => {
          this.snackBar.open('Product disabled successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/products']);
        },
        error: (error) => {
          this.snackBar.open('Error disabling product: ' + error, 'Close', { duration: 5000 });
        }
      });
    }
  }

formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
}
}
