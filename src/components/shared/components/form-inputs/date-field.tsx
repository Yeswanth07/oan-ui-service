import { Controller, type ControllerRenderProps } from 'react-hook-form';
import DateTimePicker from '../date-time-picker';
import { FieldProps } from '../../dynamic-form/types';
import { cn } from '@/lib/utils';

export function DateField({ field, control, errors }: FieldProps) {
  const hasError = Boolean(errors && errors[field.name]);
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
          const { onChange, value, ...rest } = controllerField;

          return (
            <div>
              <DateTimePicker
                date={value as any}
                setDate={(d: Date | undefined) => onChange(d)}
                onDateChange={(d: Date | undefined) => onChange(d)}
                disablePastDates={field.date?.disablePastDates}
                disableFutureDates={field.date?.disableFutureDates}
                includeTime={field.date?.showTime}
                formatStr={field.date?.dateFormat || 'yyyy-MM-dd'}
                placeholder={field.placeholder || field.label}
                disabledDates={field.date?.disabledDates}
                disabled={Boolean(field.disabled)}
                className={cn(
                  'w-full',
                  hasError
                    ? 'border-red-500 ring-red-50 focus-within:border-red-500'
                    : '',
                  field.inputClass ?? ''
                )}
                hasError={hasError}
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
    </div>
  );
}

export default DateField;
