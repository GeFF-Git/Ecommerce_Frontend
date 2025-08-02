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
import { UpdateCategoryDto, CreateCategoryDto } from '../../../core/models/category.model';

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
    RouterModule
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss'
})
export class CategoryForm implements OnInit{
  categoryForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  categoryId?: number;

  fb = inject(FormBuilder);
  categoryService = inject(AppCategory);
  route = inject(ActivatedRoute);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  constructor() {
    this.initializeForm();
  }

    ngOnInit(): void {
    this.categoryId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.categoryId;

    if (this.isEditMode) {
      this.loadCategory();
    }
  }

  initializeForm(): void {
    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      categoryDescription: [''],
      attributes: this.fb.array([])
    });
  }

  get attributes(): FormArray {
    return this.categoryForm.get('attributes') as FormArray;
  }

  addAttribute(): void {
    const attributeGroup = this.fb.group({
      attributeName: ['', Validators.required],
      attributeDisplayName: ['', Validators.required],
      dataTypeId: ['', Validators.required]
    });
    this.attributes.push(attributeGroup);
  }

  removeAttribute(index: number): void {
    this.attributes.removeAt(index);
  }

  loadCategory(): void {
    if (this.categoryId) {
      this.categoryService.getById(this.categoryId).subscribe({
        next: (category) => {
          this.categoryForm.patchValue({
            categoryName: category.categoryName,
            categoryDescription: category.categoryDescription
          });
        },
        error: (error) => {
          this.snackBar.open('Error loading category: ' + error, 'Close', { duration: 5000 });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;

      const formData = this.categoryForm.value;

      if (this.isEditMode) {
        const updateData: UpdateCategoryDto = {
          categoryName: formData.categoryName,
          categoryDescription: formData.categoryDescription
        };

        this.categoryService.update(this.categoryId!, updateData).subscribe({
          next: () => {
            this.snackBar.open('Category updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/categories']);
          },
          error: (error) => {
            this.snackBar.open('Error updating category: ' + error, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      } else {
        const createData: CreateCategoryDto = formData;

        this.categoryService.create(createData).subscribe({
          next: () => {
            this.snackBar.open('Category created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/categories']);
          },
          error: (error) => {
            this.snackBar.open('Error creating category: ' + error, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}
