import { inject, Injectable } from '@angular/core';
import { AppCategory } from './app-category';
import { Observable, forkJoin, map } from 'rxjs';
import { DashboardStats } from '../models/dashboard.model';
import { AppProduct } from './app-product';

@Injectable({
  providedIn: 'root'
})
export class AppDashboard {
  categoryService = inject(AppCategory);
  productService = inject(AppProduct);

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      categories: this.categoryService.getAll(),
      products: this.productService.getAll()
    }).pipe(
      map(({ categories, products }) => {
        const activeProducts = products.filter(p => p.isActive);
        const inactiveProducts = products.filter(p => !p.isActive);

        return {
          totalCategories: categories.length,
          totalProducts: products.length,
          activeProducts: activeProducts.length,
          inactiveProducts: inactiveProducts.length,
          recentProducts: products.slice(-5).reverse(),
          recentCategories: categories.slice(-5).reverse()
        };
      })
    );
  }
}
