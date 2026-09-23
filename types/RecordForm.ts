export interface Option {
  label: string;
  value: string;
}

export interface Field {
  name: string;
  label: string;
  type?: string;
  value?: string;
  required?: boolean;
  options?: Option[];
}

export interface RecordFormProps {
  fields?: Field[];
  submitLabel?: string;
  onSuccess?: (data: FormSubmissionResult) => void;
  onSubmit?: (formData: FormValues) => Promise<FormSubmissionResult>;
}

export type FormValues = Record<string, string>;
export type FormSubmissionResult = Record<string, string> | null | undefined;