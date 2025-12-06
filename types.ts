export interface MentalModelProperties {
  title: string;
  content: string;
  tldr: string;
  tags: string[];
}

export interface MentalModel {
  model_name: string;
  original_description: string;
  properties?: MentalModelProperties;
  title?: string;
  content?: string;
  tldr?: string;
  tags?: string[];
  required?: string[];
}

export interface CategoryData {
  category: string;
  data: MentalModel[];
}

