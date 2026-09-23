export interface PropertiesFilter {
  page: number;
  limit: number;
  status: 'under_construction' | 'completed';
  min_area: number;
  max_area: number;
  started_after: string;
  ended_before: string;
  sort_by: 'Name' | 'Date Created' | 'Area';
  search: string;
}

export interface Apartment {
  id: string;
  floor?: number;
  number?: string;
}

export interface PropertyFormData {
  name: string;
  status: 'under_construction' | 'completed';
  address: string;
  startedIn: string;
  endedIn: string;
  floorsNumber: string;
  area: string;
  selectedEmployeeIds: string[];
  apartments: Apartment[];
}

export interface EditPropertyProps {
  params: Promise<{
    propertyID: string;
  }>;
}

export interface PropertyOption {
  id: string;
  name: string;
}

export interface AddApartmentFormProps {
    propertyID: string;
}

export interface PropertyResponse extends PropertyOption {
  status?: 'under_construction' | 'completed';
  address?: string;
  startedIn?: string;
  endedIn?: string;
  floorsNumber?: number;
  area?: number | string;
  employees?: PropertyEmployeeAssignment[];
  apartments?: Apartment[];
}

export interface EmployeeReference {
  id: string;
}

export interface PropertyEmployeeAssignment {
  employeeId?: string;
  employee?: EmployeeReference;
  id?: string;
}