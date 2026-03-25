import { cn } from '../../../lib/utils';
import {
  FormField as ShadcnFormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import BooleanField from '../components/form-inputs/boolean-field';
import { DateField } from '../components/form-inputs/date-field';
import { InputField } from '../components/form-inputs/input-field';
import MultiSelectField from '../components/form-inputs/multi-select-field';
import { PhoneField } from '../components/form-inputs/phone-field';

import SelectField from '../components/form-inputs/select-field';
import TextareaField from '../components/form-inputs/textarea-field';
import URLField from '../components/form-inputs/URL-field';
import { FormField } from './types';
import { useVisibilityEvaluator } from '@/hooks/form/useVisibilityEvaluator';

interface FormFieldsProps {
  fields: FormField[];
  form: any;
  className?: string;
}

export function FormFields({ fields, form, className }: FormFieldsProps) {
  const { isVisible } = useVisibilityEvaluator(fields, form.control);
  return (
    <div className={cn('w-full', className)}>
      {fields?.map((field: FormField) => {
        // Optionally hide based on custom visibility logic
        if (!isVisible(field.name)) return null;

        return (
          <ShadcnFormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={() => (
              <FormItem
                className={cn(
                  'w-full min-h-[44px] flex justify-center flex-col',
                  field.className
                )}
              >
                {field.label && (
                  <>
                    {field.type !== 'boolean' && (
                      <FormLabel>
                        {field.label && (
                          <span className="text-[#5D5D5D]"> {field.label}</span>
                        )}
                        {field.validationRules?.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </FormLabel>
                    )}
                  </>
                )}
                <FormControl>
                  {(() => {
                    switch (field && field.type && field.type) {
                      case 'text':
                      case 'number':
                      case 'email':
                      case 'file':
                        return (
                          <InputField
                            field={field}
                            control={form.control}
                            errors={form.formState.errors}
                            register={form.register}
                          />
                        );
                      case 'dropdown':
                      case 'options':
                        return (
                          <SelectField
                            field={field}
                            control={form.control}
                            errors={form.formState.errors}
                            register={form.register}
                          />
                        );
                      case 'phone':
                        return (
                          <PhoneField
                            field={field}
                            control={form.control}
                            errors={form.formState.errors}
                            register={form.register}
                          />
                        );
                      case 'date':
                        return (
                          <DateField
                            field={field}
                            control={form.control}
                            errors={form.formState.errors}
                            register={form.register}
                          />
                        );
                      case 'url':
                        return (
                          <URLField
                            field={field}
                            control={form.control}
                            errors={form.formState.errors}
                            register={form.register}
                          />
                        );

                      case 'multi-select':
                        return (
                          <MultiSelectField
                            field={field}
                            control={form.control}
                            errors={form.formState.errors}
                            register={form.register}
                          />
                        );
                      case 'boolean':
                        return (
                          <BooleanField
                            field={field}
                            control={form.control}
                            errors={form.formState.errors}
                            register={form.register}
                          />
                        );
                      case 'text-area':
                        return (
                          <TextareaField
                            field={field}
                            control={form.control}
                            errors={form.formState.errors}
                            register={form.register}
                          />
                        );

                      default:
                        return <div>Unsupported field type: {field.type}</div>;
                    }
                  })()}
                </FormControl>
                <div className="min-h-[1.25rem] mb-0.5">
                  <FormMessage className="text-sm text-red-500" />
                </div>
              </FormItem>
            )}
          />
        );
      })}
    </div>
  );
}
