import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { Loader2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type Option = string | number | Record<string, any>;

export type DynamicSelectProps = {
  options?: Option[];
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  defaultValue?: string | number | object | null;
  onValueChange?: (value: any) => void;
  asyncOptions?: () => Promise<Option[]>;
  className?: string;
  isLoading?: boolean;
  clearable?: boolean;
  noResultText?: string;
  disabled?: any;
  dataKey?: string;
  invalid?: boolean;
  ariaDescribedBy?: string | undefined;
};

export default function DynamicSelect({
  options,
  optionLabel,
  optionValue,
  placeholder = 'Select an option',
  defaultValue = null,
  onValueChange,
  asyncOptions,
  className,
  isLoading = false,
  clearable = false,
  noResultText = 'No results found.',
  disabled,
  dataKey,
  invalid,
  ariaDescribedBy,
}: DynamicSelectProps) {
  const [allOptions, setAllOptions] = useState<Option[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('');

  // load options (static or async)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (asyncOptions) {
        try {
          const data = await asyncOptions();
          if (mounted) setAllOptions(data || []);
        } catch (err) {
          console.error('DynamicSelect asyncOptions failed', err);
          if (mounted) setAllOptions([]);
        }
      } else if (options) {
        if (mounted) setAllOptions(options);
      } else {
        if (mounted) setAllOptions([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [asyncOptions, options]);

  // helpers to extract value / label from option
  const getOptionValue = useCallback(
    (option: Option): string => {
      if (option === null || option === undefined) return '';
      if (typeof option === 'string' || typeof option === 'number') {
        return String(option);
      }
      const val =
        (option as any)[optionValue ?? dataKey ?? 'value'] ??
        (option as any).value ??
        (option as any).id;
      return val === undefined || val === null ? '' : String(val);
    },
    [optionValue, dataKey]
  );

  const getOptionLabel = useCallback(
    (option: Option): ReactNode => {
      if (option === null || option === undefined) return '';
      if (typeof option === 'string' || typeof option === 'number') {
        return String(option);
      }
      const label =
        (option as any)[optionLabel ?? 'label'] ??
        (option as any).label ??
        (option as any).name;
      return label === undefined || label === null ? '' : String(label);
    },
    [optionLabel]
  );

  // when defaultValue or options change, compute selectedValue
  useEffect(() => {
    // if default is primitive, use it
    if (defaultValue === null || defaultValue === undefined) {
      setSelectedValue('');
      return;
    }
    // if optionValue is provided and defaultValue is primitive -> use directly
    if (
      optionValue &&
      (typeof defaultValue === 'string' || typeof defaultValue === 'number')
    ) {
      setSelectedValue(String(defaultValue));
      return;
    }

    // if defaultValue is an object (e.g. edit mode), try to map to option value
    if (typeof defaultValue === 'object') {
      const fromObj = getOptionValue(defaultValue as Option);
      if (fromObj) {
        setSelectedValue(fromObj);
        return;
      }
    }

    // fallback: try to find matching option by comparing labels/values
    const found = allOptions.find((o) => {
      try {
        return getOptionValue(o) === String(defaultValue);
      } catch {
        return false;
      }
    });
    if (found) {
      setSelectedValue(getOptionValue(found));
      return;
    }

    setSelectedValue(String(defaultValue ?? ''));
  }, [defaultValue, allOptions, getOptionValue, optionValue]);

  const handleSelect = useCallback(
    (value: string) => {
      setSelectedValue(value);
      if (!onValueChange) return;

      if (optionValue) {
        // caller expects primitive value
        onValueChange(value === '' ? null : value);
        return;
      }

      // caller expects object (or null)
      const selectedOption = allOptions.find(
        (o) => getOptionValue(o) === value
      );
      onValueChange(selectedOption ?? null);
    },
    [allOptions, getOptionValue, onValueChange, optionValue]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue('');
    if (onValueChange) onValueChange(null);
  };

  return (
    <div className={cn('grid gap-2 relative w-full', className)}>
      <Select
        value={selectedValue}
        onValueChange={(v) => handleSelect(v)}
        disabled={isLoading || disabled}
      >
        <SelectTrigger
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={ariaDescribedBy}
          className={cn(
            'w-full h-10 rounded-md border bg-white px-3 text-left flex items-center justify-between',
            // default / success styling
            invalid
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20',
            isLoading ? 'opacity-80' : '',
            'data-[placeholder]:text-gray-400'
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : (
            <SelectValue
              placeholder={placeholder}
              className="text-sm text-left truncate"
            />
          )}
        </SelectTrigger>

        <SelectContent className="w-full min-w-[180px] max-h-64 overflow-auto border-gray-200 bg-white ">
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Loading...</span>
            </div>
          ) : allOptions.length > 0 ? (
            allOptions.map((option, idx) => {
              const value = getOptionValue(option);
              const label = getOptionLabel(option);
              return (
                <SelectItem key={`${value}-${idx}`} value={value || ''}>
                  <div className="truncate">{label}</div>
                </SelectItem>
              );
            })
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {noResultText}
            </div>
          )}
        </SelectContent>
      </Select>

      {clearable && selectedValue && !isLoading && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 bg-white top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Clear selection"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}
