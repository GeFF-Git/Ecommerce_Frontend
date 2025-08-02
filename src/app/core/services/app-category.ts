import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../shared/services/api-service';
import { Observable } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto, CreateCategoryAttributeDto, UpdateCategoryAttributeDto } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class AppCategory {
  private endpoint = 'categories';
  apiService = inject(ApiService);

    getAll(): Observable<Category[]> {
    return this.apiService.get<Category[]>(this.endpoint);
  }

  getById(id: number): Observable<Category> {
    return this.apiService.get<Category>(`${this.endpoint}/${id}`);
  }

  create(category: CreateCategoryDto): Observable<Category> {
    return this.apiService.post<Category>(this.endpoint, category);
  }

  update(id: number, category: UpdateCategoryDto): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  enable(id: number): Observable<void> {
    return this.apiService.patch<void>(`${this.endpoint}/${id}`);
  }

  addAttribute(categoryId: number, attribute: CreateCategoryAttributeDto): Observable<any> {
    return this.apiService.post<any>(`${this.endpoint}/${categoryId}/attributes`, attribute);
  }

  updateAttribute(attributeId: number, attribute: UpdateCategoryAttributeDto): Observable<void> {
    return this.apiService.put<void>(`${this.endpoint}/attributes/${attributeId}`, attribute);
  }

  deleteAttribute(attributeId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/attributes/${attributeId}`);
  }

  enableAttribute(attributeId: number): Observable<void> {
    return this.apiService.patch<void>(`${this.endpoint}/attributes/${attributeId}`);
  }
}
