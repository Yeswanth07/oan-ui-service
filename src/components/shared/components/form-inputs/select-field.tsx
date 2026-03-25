import { Controller, type ControllerRenderProps } from 'react-hook-form';
import DynamicSelect from '../dynamic-select';
import { cn } from '../../../../lib/utils';
import { FieldProps } from '../../dynamic-form/types';

export default function SelectField({ field, control, errors }: FieldProps) {
  const hasError = Boolean(errors && errors[field.name]);

  // convert incoming option data into the shape DynamicSelect expects
  const options: any[] | undefined = field.option?.options
    ? (field.option.options as any[])
    : undefined;

  const optionLabel =
    field.option?.optionLabel ??
    (typeof options?.[0] === 'object' ? 'label' : undefined);
  const optionValue =
    field.option?.optionValue ??
    (typeof options?.[0] === 'object' ? 'value' : undefined);

  return (
    <div className={field.className ?? 'w-full'}>
      <Controller
        name={field.name}
        control={control}
        render={({
          field: controllerField,
        }: {
          field: ControllerRenderProps;
        }) => {
          const { onChange, value } = controllerField;
          const defaultValue =
            value === null || value === undefined ? null : value;

          return (
            <div>
              <DynamicSelect
                options={options}
                optionLabel={optionLabel}
                optionValue={optionValue}
                placeholder={field.placeholder || field.label || 'Select'}
                defaultValue={defaultValue as any}
                onValueChange={(selected: any) => {
                  // selected will either be primitive (when optionValue specified) or object/null
                  onChange(selected);
                }}
                isLoading={field.isLoading}
                disabled={field.disabled}
                className={cn('w-full', field.inputClass ?? '')}
                clearable={field?.option?.clearable || false}
                noResultText={
                  field.option?.emptyMessage || 'No options available'
                }
                invalid={hasError}
                ariaDescribedBy={hasError ? `${field.name}-error` : undefined}
              />

              {/* a11y error span — visual error text is handled by FormMessage */}
              {hasError && (
                <span id={`${field.name}-error`} className="sr-only">
                  {(errors as any)[field.name]?.message ??
                    `${field.label ?? field.name} is invalid`}
                </span>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
