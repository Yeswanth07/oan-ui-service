import { Controller } from 'react-hook-form';
import { Input } from '../../../ui/input';
import { cn } from '../../../../lib/utils';
import { FieldProps } from '../../dynamic-form/types';

export function URLField({ field, control, errors }: FieldProps) {
  const urlRegex = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;

  const base =
    'w-full rounded-md px-4 py-2 text-sm transition-colors outline-none';

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { onChange, value, ...fieldProps } }) => {
        const rhfError = errors?.[field.name];
        const isInvalidFormat = value && !urlRegex.test(value);
        const showError = Boolean(rhfError || isInvalidFormat);

        const inputClass = cn(
          base,
          showError
            ? 'border-red-500 ring-red-100 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20',
          field.inputClass ?? ''
        );

        return (
          <div className={field.className}>
            <Input
              type="url"
              placeholder={field.placeholder || field.label}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className={inputClass}
              {...fieldProps}
            />

            {!rhfError && isInvalidFormat && (
              <p className="text-sm text-red-500 mt-1">
                Enter a valid URL (example: https://example.com)
              </p>
            )}
          </div>
        );
      }}
    />
  );
}

export default URLField;
