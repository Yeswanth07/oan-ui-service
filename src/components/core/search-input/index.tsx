
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export type SearchInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  value?: string;
  onChange?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  debounce?: number | false;
  icon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: number | string;
  placeholder?: string;
  sanitize?: (value: string) => string;
  showLoading?: boolean;
  showClear?: boolean;
};

export type SearchInputHandle = {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
  input?: HTMLInputElement | null;
};

const defaultSanitize = (v: string) => {
  const str = String(v ?? '');
  // Remove control characters (0–31 and 127) without using a regex literal
  return str
    .split('')
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code > 31 && code !== 127; // keep only printable characters
    })
    .join('')
    .trim();
};
const pxOrValue = (v?: string | number) =>
  v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v;

export const SearchInput = forwardRef<SearchInputHandle, SearchInputProps>(
  (props, ref) => {
    const {
      value: controlledValue,
      onChange,
      onDebouncedChange,
      onSubmit,
      debounce = 350,
      icon,
      containerClassName = '',
      inputClassName = '',
      width = '100%',
      height = 44,
      borderRadius = 8,
      placeholder = 'Search',
      sanitize = defaultSanitize,
      showLoading = false,
      showClear = true,
      name,
      id,
      ...rest
    } = props;

    const isControlled = controlledValue !== undefined;
    const [rawValue, setRawValue] = useState<string>(
      () => controlledValue ?? ''
    );

    useEffect(() => {
      if (isControlled) setRawValue(controlledValue ?? '');
    }, [controlledValue, isControlled]);

    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(
      ref,
      () => ({
        focus: () => inputRef.current?.focus(),
        clear: () => {
          if (!isControlled) setRawValue('');
          onChange?.('');
          onDebouncedChange?.('');
          if (inputRef.current) inputRef.current.value = '';
          inputRef.current?.focus();
        },
        getValue: () => (isControlled ? (controlledValue ?? '') : rawValue),
        input: inputRef.current,
      }),
      [rawValue, controlledValue, isControlled, onChange, onDebouncedChange]
    );

    const debounceMs = debounce === false ? 0 : (debounce ?? 350);
    const debTimeout = useRef<number | undefined>(undefined);

    useEffect(() => {
      if (debounceMs === 0) {
        onDebouncedChange?.(
          sanitize(isControlled ? (controlledValue ?? '') : rawValue)
        );
        return;
      }
      if (debTimeout.current) window.clearTimeout(debTimeout.current);
      debTimeout.current = window.setTimeout(() => {
        onDebouncedChange?.(
          sanitize(isControlled ? (controlledValue ?? '') : rawValue)
        );
      }, debounceMs);
      return () => {
        if (debTimeout.current) window.clearTimeout(debTimeout.current);
      };
    }, [
      rawValue,
      controlledValue,
      isControlled,
      onDebouncedChange,
      debounceMs,
      sanitize,
    ]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const typed = e.target.value;
      if (!isControlled) setRawValue(typed);
      onChange?.(typed);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit?.(sanitize(isControlled ? (controlledValue ?? '') : rawValue));
      } else if (e.key === 'Escape') {
        if (!isControlled) setRawValue('');
        onChange?.('');
        onDebouncedChange?.('');
        inputRef.current?.blur();
      }

      props.onKeyDown?.(e);
    };

    const handleClear = () => {
      if (!isControlled) setRawValue('');
      onChange?.('');
      onDebouncedChange?.('');
      inputRef.current?.focus();
    };

    const resolvedIcon = icon ?? <Search className="w-5 h-5 text-gray-400" />;

    // Determine border radius class
    const borderRadiusClass =
      typeof borderRadius === 'number'
        ? `rounded-[${borderRadius}px]`
        : 'rounded-lg';

    return (
      <div
        className={clsx('relative w-full', containerClassName)}
        style={{ width: pxOrValue(width) ?? '100%' }}
      >
        {/* Absolute left icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-gray-400">
          {resolvedIcon}
        </span>

        {/* Input Field - Using Tailwind for height and padding */}
        <Input
          {...(rest as any)}
          id={id}
          name={name}
          ref={inputRef}
          value={isControlled ? controlledValue : rawValue}
          onChange={handleChange as any}
          onKeyDown={handleKeyDown as any}
          placeholder={placeholder}
          aria-label={placeholder}
          className={clsx(
            'w-full',
            'bg-white text-[#6D6D6D] placeholder-gray-400',
            'border border-gray-200',
            'focus:outline-none focus:ring-1 focus:ring-[#6c47ff] focus:border-[#6c47ff]',
            'transition-all duration-200',
            'pl-10 pr-10', // Padding for icons on both sides
            'py-2', // Vertical padding
            borderRadiusClass,
            inputClassName
          )}
          style={{
            height: pxOrValue(height) ?? '44px',
            minHeight: pxOrValue(height) ?? '44px',
          }}
        />

        {/* Right-side controls (clear / loader) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : null}

          {showClear &&
            !showLoading &&
            (isControlled ? Boolean(controlledValue) : rawValue.length > 0) && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={handleClear}
                className="p-1 rounded hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
export default SearchInput;
