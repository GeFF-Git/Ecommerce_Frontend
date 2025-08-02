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
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Category, CategoryAttribute, CreateCategoryAttributeDto, UpdateCategoryAttributeDto } from '../../../core/models/category.model';
import { AppCategory } from '../../../core/services/app-category';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-category-attributes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTableModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './category-attributes.html',
  styleUrl: './category-attributes.scss'
})
export class CategoryAttributes implements OnInit {
  category$!: Observable<Category>;
  category: Category | null = null;
  categoryId!: number;

  attributeForm!: FormGroup;
  isSubmitting = false;
  isEditingAttribute = false;
  editingAttributeId: number | null = null;

  displayedColumns: string[] = ['name', 'dataType', 'status', 'actions'];

  fb = inject(FormBuilder);
  categoryService = inject(AppCategory);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.categoryId = +this.route.snapshot.params['id'];
    this.loadCategory();
  }

  initializeForm(): void {
    this.attributeForm = this.fb.group({
      attributeName: ['', [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]*$/)]],
      attributeDisplayName: ['', Validators.required],
      dataTypeId: ['', Validators.required]
    });
  }

  loadCategory(): void {
    this.category$ = this.categoryService.getById(this.categoryId);
    this.category$.subscribe(category => {
      this.category = category;
    });
  }

  onSubmitAttribute(): void {
    if (this.attributeForm.valid) {
      this.isSubmitting = true;
      const formData = this.attributeForm.value;

      if (this.isEditingAttribute && this.editingAttributeId) {
        // Update existing attribute
        const updateData: UpdateCategoryAttributeDto = {
          attributeName: formData.attributeName,
          attributeDisplayName: formData.attributeDisplayName
        };

        this.categoryService.updateAttribute(this.editingAttributeId, updateData).subscribe({
          next: () => {
            this.snackBar.open('Attribute updated successfully', 'Close', { duration: 3000 });
            this.resetForm();
            this.loadCategory();
          },
          error: (error) => {
            this.snackBar.open('Error updating attribute: ' + error, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      } else {
        // Add new attribute
        const createData: CreateCategoryAttributeDto = formData;

        this.categoryService.addAttribute(this.categoryId, createData).subscribe({
          next: () => {
            this.snackBar.open('Attribute added successfully', 'Close', { duration: 3000 });
            this.resetForm();
            this.loadCategory();
          },
          error: (error) => {
            this.snackBar.open('Error adding attribute: ' + error, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  editAttribute(attribute: CategoryAttribute): void {
    this.isEditingAttribute = true;
    this.editingAttributeId = attribute.attributeId;

    this.attributeForm.patchValue({
      attributeName: attribute.attributeName,
      attributeDisplayName: attribute.attributeDisplayName,
      dataTypeId: attribute.dataTypeId
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.attributeForm.reset();
    this.isEditingAttribute = false;
    this.editingAttributeId = null;
    this.isSubmitting = false;
  }

  enableAttribute(attributeId: number): void {
    this.categoryService.enableAttribute(attributeId).subscribe({
      next: () => {
        this.snackBar.open('Attribute enabled successfully', 'Close', { duration: 3000 });
        this.loadCategory();
      },
      error: (error) => {
        this.snackBar.open('Error enabling attribute: ' + error, 'Close', { duration: 5000 });
      }
    });
  }

  deleteAttribute(attributeId: number): void {
    if (confirm('Are you sure you want to disable this attribute? This will affect all products using this attribute.')) {
      this.categoryService.deleteAttribute(attributeId).subscribe({
        next: () => {
          this.snackBar.open('Attribute disabled successfully', 'Close', { duration: 3000 });
          this.loadCategory();
        },
        error: (error) => {
          this.snackBar.open('Error disabling attribute: ' + error, 'Close', { duration: 5000 });
        }
      });
    }
  }

  getDataTypeName(dataTypeId: number): string {
    const dataTypes = {
      1: 'String',
      2: 'Integer',
      3: 'Decimal',
      4: 'Boolean',
      5: 'Date',
      6: 'JSON'
    };
    return dataTypes[dataTypeId as keyof typeof dataTypes] || 'Unknown';
  }
}
