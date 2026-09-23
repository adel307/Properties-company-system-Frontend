export interface SuppliersFilter {
  page: number;
  limit: number;
  has_debt: string;
  sort_by?: 'paid' | 'debt';
  search?: string;
}

export interface SupplierMaterialSummary {
  name?: string;
  title?: string;
  totalPrice: number;
  paidPrice: number;
  paymentDate?: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
  materials: SupplierMaterialSummary[];
  updatedAt?: string;
  total_debt?: number;
}