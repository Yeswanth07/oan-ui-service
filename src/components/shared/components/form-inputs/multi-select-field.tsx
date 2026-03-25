import { Controller, useFormContext } from 'react-hook-form';
import { MultiSelect } from '../multiselect';
import { FieldProps } from '../../dynamic-form/types';

export default function MultiSelectField({
  field,
  control,
  errors,
}: FieldProps) {
  const { setValue, trigger } = useFormContext();
  const options: any[] = field.multiSelect?.options || [];
  const hasError = Boolean(errors && errors[field.name]);
  return (
    <div className={field.className}>
      <Controller
        name={field.name}
        control={control}
        render={({ field: { value, ...fieldProps } }) => (
          <MultiSelect
            {...fieldProps}
            options={options}
            optionLabel={field.multiSelect?.optionLabel}
            optionValue={field.multiSelect?.optionValue}
            placeholder={field.placeholder || field.label}
            defaultValue={value}
            onValueChange={(selectedOption: any) => {
              setValue(field.name, selectedOption);
              trigger(field.name);
              //   onChange(selectedOption);
            }}
            returnType={
              field?.datatype?.toLowerCase() === 'object' ? 'object' : 'string'
            }
            // isLoading={isLoading || field.isLoading}
            disabled={field.disabled}
            noResultText={field.multiSelect?.emptyMessage || 'No options found'}
            className={field.inputClass}
          />
        )}
      />
      {hasError && (
        <span id={`${field.name}-error`} className="sr-only">
          {(errors as any)[field.name]?.message ??
            `${field.label ?? field.name} is invalid`}
        </span>
      )}
    </div>
  );
}
