import React from 'react';
import { Controller } from 'react-hook-form';
import { Textarea } from '../../../ui/textarea';
import { cn } from '../../../../lib/utils';
import { FieldProps } from '../../dynamic-form/types';

export function TextareaField({ field, control, errors }: FieldProps) {
  const base =
    'w-full rounded-md px-4 py-2 text-sm transition-colors outline-none resize-vertical';

  const hasError = Boolean(errors && errors[field.name]);

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: controllerField }) => {
        const { onChange, value, ...rest } = controllerField;

        const textareaClass = cn(
          base,
          hasError
            ? 'border-red-500 ring-red-50 focus:border-red-500 focus:ring-2'
            : 'border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20',
          field.inputClass ?? ''
        );

        // optional textarea-specific config (rows etc.)
        const rows = (field as any).textarea?.rows ?? 4;
        const maxLength = field.validationRules?.maxLength;

        return (
          <div className={field.className ?? 'w-full'}>
            <Textarea
              {...(rest as any)}
              id={field.name}
              value={value ?? ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange(e.target.value)
              }
              placeholder={field.placeholder ?? field.label ?? ''}
              rows={rows}
              maxLength={maxLength}
              className={textareaClass}
              disabled={Boolean(field.disabled)}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${field.name}-error` : undefined}
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

export default TextareaField;
