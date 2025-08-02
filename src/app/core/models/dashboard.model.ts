import { Category } from "./category.model";
import { Product } from "./product.model";

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  recentProducts: Product[];
  recentCategories: Category[];
}
