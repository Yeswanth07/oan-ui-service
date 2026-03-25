import { Controller } from 'react-hook-form';
import { cn } from '../../../../lib/utils';
import { PhoneInput } from '../phone-input'; // assume this exists
import { FieldProps } from '../../dynamic-form/types';

export function PhoneField({ field, control, errors }: FieldProps) {
  const hasError = Boolean(errors && errors[field.name]);

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: controllerField }) => {
        const { onChange, value, ...rest } = controllerField;

        return (
          <div className={field.className ?? 'w-full'}>
            <PhoneInput
              value={value || ''}
              onChange={(phoneNumber: string) => onChange(phoneNumber)}
              placeholder={
                field.placeholder || field.label || 'Enter phone number'
              }
              disabled={field.disabled}
              className={cn(
                'w-full',

                hasError ? 'phone-input-error' : '',
                field.inputClass ?? ''
              )}
              defaultCountry={field.phone?.defaultCountry || 'IN'}
              {...(rest as any)}
            />

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

export default PhoneField;
