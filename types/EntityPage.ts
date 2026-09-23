export interface ColumnOption {
  label: string;
  value: string | number;
}

export interface Column {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | string;
  options?: ColumnOption[];
}

export interface EntityRow {
  [key: string]: any;
}

export type EntityValue = string | number | boolean | null | undefined | EntityObject | EntityObject[];

export interface EntityObject {
  [key: string]: EntityValue;
}

export interface EntityRow extends EntityObject {
  id: string;
  name?: string;
}

export interface EntityPageProps {
  title: string;
  eyebrow: string;
  description: string;
  rows?: EntityRow[];
  columns?: Column[];
  action?: string;
  actionHref?: string;
  detailHref?: string;
  onAction?: () => void;
  onSave?: (id: string, updatedData: Partial<EntityRow>) => Promise<any>;
  onDelete?: (id: string) => Promise<void | any>;
}