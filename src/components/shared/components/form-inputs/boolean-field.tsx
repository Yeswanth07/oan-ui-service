import { Controller } from 'react-hook-form';
import { Label } from '../../../ui/label';
import { FieldProps } from '../../dynamic-form/types';
import { Checkbox } from '@/components/ui/checkbox';

export function BooleanField({ field, control }: FieldProps) {
  return (
    <Controller
      name={field.name}
      control={control}
      defaultValue={false}
      render={({ field: controllerField }) => (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={!!controllerField.value}
              onCheckedChange={(checked) => controllerField.onChange(checked)}
              className="border-gray-300 text-white rounded-md checked:bg-[#6C5DD3] checked:border-[#6C5DD3]"
            />
            <Label
              htmlFor={field.name}
              className="text-sm text-gray-700 font-normal cursor-pointer"
            >
              {field.label}
              {field.validationRules?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </Label>
          </div>
          {field.helpText && (
            <p className="text-xs text-gray-500 mt-0.5">{field.helpText}</p>
          )}
        </div>
      )}
    />
  );
}

export default BooleanField;
