export interface SurveyData {
  goal?: string;
  activityLevel?: string;
  preferredCategories?: string[];
  preferredFlavors?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  [key: string]: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  healthGoal?: string;
  avatar?: string;
  address?: string;
  isAdmin?: boolean;
  wishlist?: number[];
  isNewUser?: boolean;
  surveyCompleted?: boolean;
  surveyData?: SurveyData;
  [key: string]: any;
}

