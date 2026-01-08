/**
 * Type definitions for backend schema
 * 
 * These types match the JSON structure returned by
 * our Django schema introspection API.
 */

export interface FieldChoice {
  value: string;
  label: string;
}

export interface FieldSchema {
  name: string;
  type: string;
  required: boolean;
  help_text?: string;
  max_length?: number;
  choices?: FieldChoice[];
  default?: any;
  related_model?: string;
  many?: boolean;
}

export interface ModelSchema {
  model_name: string;
  app_label: string;
  table_name: string;
  fields: FieldSchema[];
  verbose_name: string;
  verbose_name_plural: string;
}

export interface AllSchemasResponse {
  [modelName: string]: ModelSchema;
}