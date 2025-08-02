// src/app/features/categories/category-form/category-form.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppCategory } from '../../../core/services/app-category';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UpdateCategoryDto, CreateCategoryDto, Category } from '../../../core/models/category.model';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-category-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDividerModule,
    RouterModule,
    MatChipsModule
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss'
})
export class CategoryForm implements OnInit {
  categoryForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  categoryId?: number;
  category: Category | null = null;

  fb = inject(FormBuilder);
  categoryService = inject(AppCategory);
  route = inject(ActivatedRoute);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Check if we have an ID parameter
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.categoryId = +id;
      this.isEditMode = true;
      this.loadCategory();
    }
  }

  initializeForm(): void {
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      categoryDescription: ['', [Validators.maxLength(500)]],
      attributes: this.fb.array([])
    });
  }

  get attributes(): FormArray {
    return this.categoryForm.get('attributes') as FormArray;
  }

  addAttribute(): void {
    const attributeGroup = this.fb.group({
      attributeName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z][a-zA-Z0-9_]*$/) // Start with letter, alphanumeric and underscore only
      ]],
      attributeDisplayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      dataTypeId: ['', Validators.required]
    });

    // Auto-generate display name from attribute name
    attributeGroup.get('attributeName')?.valueChanges.subscribe(value => {
      if (value && !attributeGroup.get('attributeDisplayName')?.dirty) {
        const displayName = this.generateDisplayName(value);
        attributeGroup.get('attributeDisplayName')?.setValue(displayName);
      }
    });

    this.attributes.push(attributeGroup);
  }

  removeAttribute(index: number): void {
    if (confirm('Are you sure you want to remove this attribute?')) {
      this.attributes.removeAt(index);
    }
  }

  private generateDisplayName(attributeName: string): string {
    // Convert camelCase or snake_case to Title Case
    return attributeName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }

  loadCategory(): void {
    if (this.categoryId) {
      this.categoryService.getById(this.categoryId).subscribe({
        next: (category) => {
          this.category = category;
          this.categoryForm.patchValue({
            categoryName: category.categoryName,
            categoryDescription: category.categoryDescription || ''
          });

          // Note: In edit mode, we don't load attributes as they should be managed
          // through the separate category attributes management page
        },
        error: (error) => {
          console.error('Error loading category:', error);
          this.snackBar.open('Error loading category. Please try again.', 'Close', { duration: 5000 });
          this.router.navigate(['/categories']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const formData = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      this.updateCategory(formData);
    } else {
      this.createCategory(formData);
    }
  }

  private createCategory(formData: any): void {
    const createData: CreateCategoryDto = {
      categoryName: formData.categoryName.trim(),
      categoryDescription: formData.categoryDescription?.trim() || undefined,
      attributes: formData.attributes?.map((attr: any) => ({
        attributeName: attr.attributeName.trim(),
        attributeDisplayName: attr.attributeDisplayName.trim(),
        dataTypeId: attr.dataTypeId
      })) || []
    };

    this.categoryService.create(createData).subscribe({
      next: (createdCategory) => {
        this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/categories', createdCategory.categoryId]);
      },
      error: (error) => {
        console.error('Error creating category:', error);
        this.handleSubmitError('creating', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private updateCategory(formData: any): void {
    const updateData: UpdateCategoryDto = {
      categoryName: formData.categoryName.trim(),
      categoryDescription: formData.categoryDescription?.trim() || undefined
    };

    this.categoryService.update(this.categoryId!, updateData).subscribe({
      next: () => {
        this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/categories', this.categoryId]);
      },
      error: (error) => {
        console.error('Error updating category:', error);
        this.handleSubmitError('updating', error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private handleSubmitError(action: string, error: any): void {
    let errorMessage = `Error ${action} category. Please try again.`;

    if (error.status === 400) {
      errorMessage = 'Invalid data provided. Please check your inputs.';
    } else if (error.status === 409) {
      errorMessage = 'A category with this name already exists.';
    } else if (error.status === 0) {
      errorMessage = 'Unable to connect to server. Please check your connection.';
    }

    this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
    this.isSubmitting = false;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      }
    });
  }

  // Helper method to get field error message
  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `${fieldName} contains invalid characters`;
    }
    return '';
  }

  // Helper method to check if field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  // Helper method to check if form has unsaved changes
  hasUnsavedChanges(): boolean {
    return this.categoryForm.dirty && !this.isSubmitting;
  }

  // Helper method to get data type name
  getDataTypeName(dataTypeId: number): string {
    const dataTypes: { [key: number]: string } = {
      1: 'String',
      2: 'Integer',
      3: 'Decimal',
      4: 'Boolean',
      5: 'Date',
      6: 'JSON'
    };
    return dataTypes[dataTypeId] || 'Unknown';
  }
}
