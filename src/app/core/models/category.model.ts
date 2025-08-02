export interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  isActive: boolean;
  attributes: CategoryAttribute[];
}

export interface CategoryAttribute {
  attributeId: number;
  attributeName: string;
  attributeDisplayName: string;
  dataTypeId: number;
  isActive: boolean;
}

export interface CreateCategoryDto {
  categoryName: string;
  categoryDescription?: string;
  attributes?: CreateCategoryAttributeDto[];
}

export interface CreateCategoryAttributeDto {
  attributeName: string;
  attributeDisplayName: string;
  dataTypeId: number;
}

export interface UpdateCategoryDto {
  categoryName: string;
  categoryDescription?: string;
}

export interface UpdateCategoryAttributeDto {
  attributeName: string;
  attributeDisplayName: string;
}
