export interface lease {
    id: string;
    apartmentId: string;
    tenantId: string;
    startDate?: string;
    endDate?: string;
    rentAmount?: string;
    deposit?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    apartment?: JSON;
}