// src/app/core/models/product.model.ts
export interface Product {
  productId: number;
  categoryId: number;
  categoryName: string;
  productSku: string;
  productName: string;
  productDescription?: string;
  brand?: string; // Added missing field
  salePrice: number;
  costPrice?: number; // Added missing field
  stockQuantity: number;
  isActive: boolean;
  createdDate?: string; // Added for completeness
  modifiedDate?: string; // Added for completeness
  attributes: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  attributeId?: number; // Added for backend mapping
  attributeName: string;
  attributeDisplayName?: string; // Added for better UX
  dataTypeId?: number; // Added for validation
  value?: string;
}

export interface CreateProductDto {
  categoryId: number;
  productSku: string;
  productName: string;
  brand: string;
  productDescription?: string;
  salePrice: number;
  costPrice?: number; // Added missing field
  stockQuantity: number;
  attributes?: CreateProductAttributeValueDto[];
}

export interface CreateProductAttributeValueDto {
  attributeId: number;
  value?: string;
}

export interface UpdateProductDto {
  productSku: string;
  productName: string;
  brand?: string; // Added missing field
  productDescription?: string;
  salePrice: number;
  costPrice?: number; // Added missing field
  stockQuantity: number;
}

export interface UpdateProductAttributeValueDto {
  value?: string;
}

// Additional interfaces for better type safety
export interface ProductFilter {
  searchTerm?: string;
  categoryId?: number;
  status?: 'all' | 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
}

export interface ProductSummary {
  productId: number;
  productName: string;
  productSku: string;
  categoryName: string;
  salePrice: number;
  stockQuantity: number;
  isActive: boolean;
}

// Enums for better type safety
export enum ProductStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export enum StockLevel {
  OutOfStock = 'out_of_stock',
  LowStock = 'low_stock',
  InStock = 'in_stock'
}

// Helper functions
export class ProductHelper {
  static getStockLevel(quantity: number): StockLevel {
    if (quantity === 0) return StockLevel.OutOfStock;
    if (quantity < 10) return StockLevel.LowStock;
    return StockLevel.InStock;
  }

  static formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  static generateSKU(categoryName: string): string {
    const prefix = categoryName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  static validateSKU(sku: string): boolean {
    return /^[A-Z0-9-_]+$/.test(sku) && sku.length >= 3 && sku.length <= 20;
  }
}
