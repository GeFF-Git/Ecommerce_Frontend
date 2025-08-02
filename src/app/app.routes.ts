// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-component').then(m => m.DashboardComponent)
  },

  // Category Routes
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/category-list/category-list').then(m => m.CategoryList)
  },
  {
    path: 'categories/create',
    loadComponent: () => import('./features/categories/category-form/category-form').then(m => m.CategoryForm)
  },
  {
    path: 'categories/:id',
    loadComponent: () => import('./features/categories/category-details/category-details').then(m => m.CategoryDetails)
  },
  {
    path: 'categories/:id/edit',
    loadComponent: () => import('./features/categories/category-form/category-form').then(m => m.CategoryForm)
  },
  {
    path: 'categories/:id/attributes',
    loadComponent: () => import('./features/categories/category-attributes/category-attributes').then(m => m.CategoryAttributes)
  },

  // Product Routes
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductList)
  },
  {
    path: 'products/create',
    loadComponent: () => import('./features/products/product-form/product-form').then(m => m.ProductForm)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-details/product-details').then(m => m.ProductDetails)
  },
  {
    path: 'products/:id/edit',
    loadComponent: () => import('./features/products/product-form/product-form').then(m => m.ProductForm)
  },

  // Fallback
  { path: '**', redirectTo: '/dashboard' }
];
