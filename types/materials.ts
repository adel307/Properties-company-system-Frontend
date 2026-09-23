export type MaterialStatus = 'paid' | 'as_dept';

export interface MaterialRecord {
	id: string;
	name: string;
	totalPrice: number;
	paidPrice: number;
	status: MaterialStatus;
	quantity: number;
	arriveDate: string;
	remainingAmount?: number;
	paymentDate: string;
	supplierId: string;
	propertyId: string;
	updatedAt?: string;
	supplier?: SupplierReference;
	property?: PropertyReference;
}

export interface SupplierReference {
	id: string;
	name: string;
}

export interface PropertyReference {
	id: string;
	name: string;
}

export interface MaterialFormData {
	name: string;
	totalPrice: number;
	paidPrice: number;
	status: MaterialStatus;
	quantity: number;
	arriveDate: string;
	paymentDate: string;
	supplierId: string;
	propertyId: string;
}
