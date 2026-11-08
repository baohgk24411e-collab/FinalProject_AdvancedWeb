export interface NutritionFacts {
  calories: string;
  protein?: string;
  fat?: string;
  carbs?: string;
  fiber?: string;
  vitaminC?: string;
  sugar?: string;
  sodium?: string;
  [key: string]: any;
}

export interface ProductOrigin {
  farmName: string;
  location: string;
  standard?: string;
  harvestDate?: string;
  farmer?: string;
  inspection?: string;
  [key: string]: any;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  image: string;
  gallery?: string[];
  description?: string;
  origin?: ProductOrigin;
  nutritionFacts?: NutritionFacts;
  rating?: number;
  reviewsCount?: number;
  stock: number;
  isSeasonal?: boolean;
  isBestSeller?: boolean;
  dietaryCategory?: string[];
  traceabilityId?: string;
  [key: string]: any;
}

