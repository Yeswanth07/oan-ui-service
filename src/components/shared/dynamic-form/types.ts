import type {
  UseFormRegister,
  FieldValues,
  FieldErrors,
  Control,
} from 'react-hook-form';
import PhoneField from '../components/form-inputs/phone-field';
export interface FieldProps<TFieldValues extends FieldValues = FieldValues> {
  field: FormField;
  register: UseFormRegister<TFieldValues>;
  control: Control<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  getColorClass?: (index: number) => string;
  className?: string;
}
export type InputType =
  | 'section'
  | 'template'
  | 'text'
  | 'number'
  | 'date'
  | 'email'
  | 'autocomplete'
  | 'p-multiSelect'
  | 'options'
  | 'text-area'
  | 'mask-input'
  | 'text-editor'
  | 'file'
  | 'radio'
  | 'checkbox'
  | 'hidden'
  | 'multi-select'
  | 'dropdown'
  | 'phone'
  | 'url'
  | 'boolean';
export interface OptionFieldConfig {
  options?: any[];
  optionLabel?: string;
  optionValue?: string;
  filter?: boolean;
  emptyMessage?: string;
  dataKey?: string;
  returnType?: 'object' | 'string';
  clearable?: boolean;
  // API loading configuration
  apiUrl?: string;
  urlParamMap?: Record<string, string>; // Maps URL params to API params
  queryParams?: Record<string, string | number>;
  transformResponse?: (data: any) => any[]; // Function to transform API response
}

export type OperatorString =
  | 'answered'
  | 'exists'
  | 'not_answered'
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<=';

export interface Condition {
  id?: string | number;
  name?: string;
  expression: OperatorString;
  value?: any;
}
export interface VisibilityCondition {
  conditions: Condition[];
  parentFieldName?: string;
  conditionsRule?: 'all' | 'any';
  objectKey?: string;
}
export interface Rules {
  name: string;
  message: string;
  value: any;
}
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: string;
  min?: number;
  max?: number;
  date?: string;
  validators?: Rules[];
}
export interface VisibilityConditions {
  visibleConditions: 'all' | 'any';
  visibilities: VisibilityCondition[];
}
export interface Section {
  align?: 'start' | 'right' | 'left' | 'top' | 'bottom' | 'center';
  sectionTitle?: string;
  type?: 'solid' | 'dashed' | 'dotted';
}
interface TextField {
  placeholder?: string;
  disabled?: boolean | any;
}
export interface NumberField {
  mode?: 'decimal' | 'integer' | 'currency';
  currency?: string | 'TZS';
  min?: number | any;
  max?: number | any;
  minFractionDigits?: number | any;
  maxFractionDigits?: number | any;
  prefix?: string | null;
  suffix?: string | 'decimal';
  placeholder?: string;
  disabled?: boolean | any;
}
export interface BaseField {
  controlName?: string;
  fields?: any[];
}
export interface DateField extends BaseField {
  maxDate?: any;
  minDate?: any;
  dataType?: 'string' | 'date';
  showWeek?: boolean;
  timeOnly?: boolean;
  view?: any;
  dateFormat?: string;
  showTime?: boolean;
  showSeconds?: boolean;
  numberOfMonths?: number | any;
  showButtonBar?: boolean;
  disabled?: boolean | any;
  hourFormat?: number | any;
  disabledDays?: number[];
  disabledDates?: (value: Date) => boolean;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
}
export interface AutocompleteField {
  dataKey?: string;
  minLength?: number;
  forceSelection?: boolean;
  suggestions: any[] | undefined;
  field: string;
  disabled?: boolean | any;
  // templates?: DynamicTemplate[];
}
export interface DualMultiSelectField {
  items?: any[] | undefined;
  key?: string;
  filterBy?: string;
  displayKeys?: string[];
  apiFilter?: boolean;
  selectedItems?: any[];
  title?: string;
  emptyMessage?: string;
}
export interface MaskInputField {
  mask: string;
  placeholder?: string;
  disabled?: boolean | any;
}
export interface TextEditorField {
  styles: any;
  disabled?: boolean | any;
}
export interface TextAreaField {
  styles: any;
  disabled?: boolean | any;
}
export interface FileInputField {
  acceptTypes: any[];
  size?: number;
}
export declare interface RadioFieldOption {
  label?: any;
  value?: any;
  id?: string | number;
}
export declare interface RadioField {
  options: RadioFieldOption[] | undefined;
  disabled?: boolean | any;
}
export declare interface CheckBoxField {
  options?: any[] | undefined;
  binary?: boolean;
  disabled?: boolean | any;
  returnObject?: boolean;
  key?: string | any | undefined;
  label?: string;
  textClass?: string;
  onChange: ((checked: any) => void) | undefined;
}
export interface URLField {
  placeholder?: string;
  disabled?: boolean;
}
export interface PhoneField {
  defaultCountry?: string;
}
export type FormField = {
  isLoading?: boolean;
  name: string;
  type?: InputType | any;
  render: boolean;
  value?: any;
  label?: string;
  className?: string;
  updatedClass?: string;
  placeholder?: string | null | '' | any;
  fieldClass?: string;
  class?: string;
  customClass?: string;
  inputClass?: string;
  template?: string;
  parentId?: string;
  category?: string | undefined;
  disabled?: boolean | any;
  option?: OptionFieldConfig;
  description?: string;
  visibilityConditions?: VisibilityCondition | VisibilityConditions;
  validationRules?: ValidationRule;
  section?: Section;
  text?: TextField;
  number?: NumberField;
  date?: DateField;
  autocomplete?: AutocompleteField;
  multiSelect?: OptionFieldConfig;
  dependencies?: string[];
  dualSelects?: DualMultiSelectField;
  mask?: MaskInputField;
  textEditor?: TextEditorField;
  textArea?: TextAreaField;
  file?: FileInputField;
  radio?: RadioField;
  checkbox?: CheckBoxField;
  getValue?: any;
  error?: string;
  url?: URLField;
  phone?: PhoneField;
  datatype?: string;
  helpText?: string;
};

