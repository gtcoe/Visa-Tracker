export interface FieldConfig {
    type: "number" | "string";
    required: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
}

export interface ValidationSchema {
    body?: {
        updated_by_id?: FieldConfig;
        updated_by?: FieldConfig;
        text?: FieldConfig;
        status?: FieldConfig;
        id?: FieldConfig;
    };
    param?: {
        id?: FieldConfig;
    };
}