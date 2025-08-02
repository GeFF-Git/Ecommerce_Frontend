import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api-service';
import { Observable } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto, CreateProductAttributeValueDto, ProductAttributeValue, UpdateProductAttributeValueDto } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class AppProduct {
  private endpoint = 'products';
  apiService = inject(ApiService);

    getAll(): Observable<Product[]> {
    return this.apiService.get<Product[]>(this.endpoint);
  }

  getById(id: number): Observable<Product> {
    return this.apiService.get<Product>(`${this.endpoint}/${id}`);
  }

  create(product: CreateProductDto): Observable<Product> {
    return this.apiService.post<Product>(this.endpoint, product);
  }

  update(id: number, product: UpdateProductDto): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  enable(id: number): Observable<void> {
    return this.apiService.patch<void>(`${this.endpoint}/${id}`);
  }

  addOrUpdateAttribute(productId: number, attribute: CreateProductAttributeValueDto): Observable<ProductAttributeValue> {
    return this.apiService.post<ProductAttributeValue>(`${this.endpoint}/${productId}/attributes`, attribute);
  }

  updateAttributeValue(productId: number, attributeId: number, attribute: UpdateProductAttributeValueDto): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${productId}/attributes/${attributeId}`, attribute);
  }

  deleteAttributeValue(productId: number, attributeId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${productId}/attributes/${attributeId}`);
  }

}
