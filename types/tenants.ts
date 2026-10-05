import { lease } from "./lease";

export interface tenants {
    id: string;
    name: string;
    nationalId?: string;
    phone?: string;
    email?: string;
    address?: string;
    createdAt?: string;
    updatedAt?: string;
    leases?: lease;
}