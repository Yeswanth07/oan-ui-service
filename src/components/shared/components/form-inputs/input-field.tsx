import React from 'react';
import { Controller, type ControllerRenderProps } from 'react-hook-form';
import { FieldProps } from '../../dynamic-form/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// helper that was in your repo
function parseInputValue(
  e: React.ChangeEvent<HTMLInputElement>,
  fieldType?: string
) {
  switch (fieldType) {
    case 'number':
      return e.target.value === '' ? undefined : Number(e.target.value);
    case 'file':
      return e.target.files?.[0];
    default:
      return e.target.value;
  }
}

export function InputField({
  field,
  control,
  errors,
}: FieldProps & { getColorClass?: (index: number) => string }) {
  const base =
    'w-full rounded-md px-4 py-2 text-sm transition-colors outline-none';

  const hasError = Boolean(errors && errors[field.name]);

  return (
    <Controller
      name={field.name}
      control={control}
      render={({
        field: controllerField,
      }: {
        field: ControllerRenderProps;
      }) => {
        const { onChange, value, ...rest } = controllerField;
        const inputClass = cn(
          base,
          hasError
            ? 'border-red-500 ring-red-50 focus:border-red-500 focus:ring-2'
            : 'border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20',
          field.inputClass ?? ''
        );

        return (
          <div className={field.className ?? 'w-full'}>
            <Input
              {...(rest as any)}
              id={field.name}
              value={value ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange(parseInputValue(e, field.type))
              }
              type={
                field.type === 'number'
                  ? 'number'
                  : field.type === 'email'
                    ? 'email'
                    : field.type === 'file'
                      ? 'file'
                      : 'text'
              }
              placeholder={field.placeholder ?? field.label ?? ''}
              className={inputClass}
              disabled={Boolean(field.disabled)}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${field.name}-error` : undefined}
            />

            {/* hidden a11y error text: FormMessage will show visual error so we only render sr-only for screen readers */}
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
  );
}

export default InputField;
