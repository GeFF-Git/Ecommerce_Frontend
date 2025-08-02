export interface Product {
  productId: number;
  categoryId: number;
  categoryName: string;
  productSku: string;
  productName: string;
  productDescription?: string;
  salePrice: number;
  stockQuantity: number;
  isActive: boolean;
  attributes: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  attributeName: string;
  value?: string;
}

export interface CreateProductDto {
  categoryId: number;
  productSku: string;
  productName: string;
  brand: string;
  productDescription?: string;
  salePrice: number;
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
  productDescription?: string;
  salePrice: number;
  stockQuantity: number;
}

export interface UpdateProductAttributeValueDto {
  value?: string;
}
