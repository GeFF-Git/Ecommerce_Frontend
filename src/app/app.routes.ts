import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-component').then(m => m.DashboardComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/category-list/category-list').then(m => m.CategoryList)
  },
  {
    path: 'categories/create',
    loadComponent: () => import('./features/categories/category-form/category-form').then(m => m.CategoryForm)
  },
  {
    path: 'categories/:id/edit',
    loadComponent: () => import('./features/categories/category-form/category-form').then(m => m.CategoryForm)
  },
  // {
  //   path: 'products',
  //   loadComponent: () => import('./features/products/product-list.component').then(m => m.ProductListComponent)
  // },
  // {
  //   path: 'products/create',
  //   loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent)
  // },
  // {
  //   path: 'products/:id/edit',
  //   loadComponent: () => import('./features/products/product-form.component').then(m => m.ProductFormComponent)
  // },
  { path: '**', redirectTo: '/dashboard' }

];
