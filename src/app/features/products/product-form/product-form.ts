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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Category, CategoryAttribute } from '../../../core/models/category.model';
import { CreateProductDto, UpdateProductDto, ProductHelper } from '../../../core/models/product.model';
import { AppCategory } from '../../../core/services/app-category';
import { AppProduct } from '../../../core/services/app-product';
import { ValidationService } from '../../../shared/services/validation-service';
import { DataTypeName } from '../../../core/models/attribute-data-type.model';

@Component({
  selector: 'app-product-form',
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
    MatDividerModule
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit {
  productForm!: FormGroup;
  categories$!: Observable<Category[]>;
  selectedCategory: Category | null = null;
  isEditMode = false;
  isSubmitting = false;
  productId?: number;

  fb = inject(FormBuilder);
  productService = inject(AppProduct);
  categoryService = inject(AppCategory);
  route = inject(ActivatedRoute);
  router = inject(Router);
  snackBar = inject(MatSnackBar);

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.categories$ = this.categoryService.getAll();
    this.productId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.productId;

    if (this.isEditMode) {
      this.loadProduct();
    }

    // Set up form watchers
    this.setupFormWatchers();
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      categoryId: ['', Validators.required],
      productSku: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z0-9-_]+$/),
        Validators.minLength(3),
        Validators.maxLength(20)
      ]],
      productName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      brand: ['', [Validators.required, Validators.maxLength(100)]],
      productDescription: ['', Validators.maxLength(2000)],
      salePrice: ['', [Validators.required, ValidationService.priceValidator()]],
      costPrice: ['', ValidationService.priceValidator()],
      stockQuantity: ['', [Validators.required, ValidationService.stockValidator()]],
      attributes: this.fb.array([])
    });
  }

  setupFormWatchers(): void {
    // Watch for category changes to update attributes
    this.productForm.get('categoryId')?.valueChanges.subscribe(categoryId => {
      if (categoryId) {
        this.onCategoryChange(categoryId);
      }
    });

    // Auto-format SKU to uppercase
    this.productForm.get('productSku')?.valueChanges.subscribe(value => {
      if (value && typeof value === 'string') {
        const formatted = value.toUpperCase();
        if (formatted !== value) {
          this.productForm.get('productSku')?.setValue(formatted, { emitEvent: false });
        }
      }
    });
  }

  get attributes(): FormArray {
    return this.productForm.get('attributes') as FormArray;
  }

  loadProduct(): void {
    if (this.productId) {
      this.productService.getById(this.productId).subscribe({
        next: (product) => {
          this.productForm.patchValue({
            categoryId: product.categoryId,
            productSku: product.productSku,
            productName: product.productName,
            brand: product.brand || '',
            productDescription: product.productDescription,
            salePrice: product.salePrice,
            costPrice: product.costPrice || '',
            stockQuantity: product.stockQuantity
          });

          // Load category and then set attributes
          this.categoryService.getById(product.categoryId).subscribe(category => {
            this.selectedCategory = category;
            this.buildAttributeFields(category.attributes, product.attributes);
          });
        },
        error: (error) => {
          this.snackBar.open('Error loading product: ' + error, 'Close', { duration: 5000 });
          this.router.navigate(['/products']);
        }
      });
    }
  }

  onCategoryChange(categoryId: number): void {
    this.categoryService.getById(categoryId).subscribe({
      next: (category) => {
        this.selectedCategory = category;
        this.buildAttributeFields(category.attributes);

        // Auto-generate SKU if creating new product
        if (!this.isEditMode && !this.productForm.get('productSku')?.value) {
          this.generateSKU();
        }
      },
      error: (error) => {
        this.snackBar.open('Error loading category: ' + error, 'Close', { duration: 5000 });
      }
    });
  }

  buildAttributeFields(categoryAttributes: CategoryAttribute[], existingValues?: any[]): void {
    // Clear existing attributes
    this.attributes.clear();

    // Only include active attributes
    const activeAttributes = categoryAttributes.filter(attr => attr.isActive);

    activeAttributes.forEach(attr => {
      const existingValue = existingValues?.find(v => v.attributeName === attr.attributeName);
      const validators = ValidationService.getValidatorsByDataType(this.getDataTypeName(attr.dataTypeId));

      const attributeGroup = this.fb.group({
        attributeId: [attr.attributeId],
        attributeName: [attr.attributeName],
        attributeDisplayName: [attr.attributeDisplayName],
        dataTypeId: [attr.dataTypeId],
        value: [existingValue?.value || '', validators]
      });

      this.attributes.push(attributeGroup);
    });
  }

  getDataTypeName(dataTypeId: number): string {
    const dataTypes = {
      1: DataTypeName.String,
      2: DataTypeName.Integer,
      3: DataTypeName.Decimal,
      4: DataTypeName.Boolean,
      5: DataTypeName.Date,
      6: DataTypeName.JSON
    };
    return dataTypes[dataTypeId as keyof typeof dataTypes] || DataTypeName.String;
  }

  getInputType(dataTypeId: number): string {
    return ValidationService.getInputType(this.getDataTypeName(dataTypeId));
  }

  getPlaceholder(attributeName: string, dataTypeId: number): string {
    return ValidationService.getPlaceholder(this.getDataTypeName(dataTypeId), attributeName);
  }

  getBooleanOptions(): { value: string; label: string }[] {
    return ValidationService.getBooleanOptions();
  }

  isTextarea(dataTypeId: number): boolean {
    return this.getDataTypeName(dataTypeId) === DataTypeName.JSON;
  }

  isBoolean(dataTypeId: number): boolean {
    return this.getDataTypeName(dataTypeId) === DataTypeName.Boolean;
  }

  generateSKU(): void {
    if (this.selectedCategory) {
      const sku = ProductHelper.generateSKU(this.selectedCategory.categoryName);
      this.productForm.patchValue({ productSku: sku });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid && this.selectedCategory) {
      this.isSubmitting = true;

      const formValue = this.productForm.value;

      if (this.isEditMode) {
        const updateData: UpdateProductDto = {
          productSku: formValue.productSku,
          productName: formValue.productName,
          brand: formValue.brand,
          productDescription: formValue.productDescription,
          salePrice: parseFloat(formValue.salePrice),
          costPrice: formValue.costPrice ? parseFloat(formValue.costPrice) : undefined,
          stockQuantity: parseInt(formValue.stockQuantity)
        };

        this.productService.update(this.productId!, updateData).subscribe({
          next: () => {
            // Update attributes separately
            this.updateProductAttributes();
          },
          error: (error) => {
            this.snackBar.open('Error updating product: ' + error, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      } else {
        const createData: CreateProductDto = {
          categoryId: formValue.categoryId,
          productSku: formValue.productSku,
          productName: formValue.productName,
          brand: formValue.brand,
          productDescription: formValue.productDescription,
          salePrice: parseFloat(formValue.salePrice),
          costPrice: formValue.costPrice ? parseFloat(formValue.costPrice) : undefined,
          stockQuantity: parseInt(formValue.stockQuantity),
          attributes: formValue.attributes
            .filter((attr: any) => attr.value && attr.value.trim()) // Only include attributes with non-empty values
            .map((attr: any) => ({
              attributeId: attr.attributeId,
              value: attr.value.trim()
            }))
        };

        this.productService.create(createData).subscribe({
          next: () => {
            this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.snackBar.open('Error creating product: ' + error, 'Close', { duration: 5000 });
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.productForm);
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    }
  }

  private updateProductAttributes(): void {
    const attributePromises = this.attributes.controls
      .filter(control => control.get('value')?.value && control.get('value')?.value.trim())
      .map(control => {
        const attributeData = {
          attributeId: control.get('attributeId')?.value,
          value: control.get('value')?.value.trim()
        };
        return this.productService.addOrUpdateAttribute(this.productId!, attributeData).toPromise();
      });

    Promise.all(attributePromises).then(() => {
      this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
      this.router.navigate(['/products']);
    }).catch(error => {
      this.snackBar.open('Error updating attributes: ' + error, 'Close', { duration: 5000 });
    }).finally(() => {
      this.isSubmitting = false;
    });
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

  // Helper method to check if form has unsaved changes
  hasUnsavedChanges(): boolean {
    return this.productForm.dirty && !this.isSubmitting;
  }
}
