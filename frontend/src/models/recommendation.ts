export interface Recommendation {
  product: string;
  reason: string;
  price: number;
}

export interface Recommendations {
  recommendations: Recommendation[];
}
