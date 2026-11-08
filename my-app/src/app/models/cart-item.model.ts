import { Product } from './product.model';

export interface CartItem {
  productId: number;
  quantity: number;
  product?: Product;
}

