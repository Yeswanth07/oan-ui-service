import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '../../ui/badge';
import { CheckIcon, ChevronDown, WandSparkles, XIcon } from 'lucide-react';
import { Separator } from '../../ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

const multiSelectVariants = cva(
  'm-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300',
  {
    variants: {
      variant: {
        default:
          'border-foreground/10 text-foreground bg-card hover:bg-card/80',
        secondary:
          'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        inverted: 'inverted',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

/**
 * Props for MultiSelectLimited component
 */
interface MultiSelectLimitedProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  options?: any[];
  optionLabel?: string;
  optionValue?: string;
  apiUrl?: string;
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  maxSelectionLimit?: number; // NEW: Maximum number of items that can be selected
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
  noResultText?: string;
  returnType?: 'string' | 'object';
  showLimitMessage?: boolean; // NEW: Whether to show limit message
}

export const MultiSelectLimited = React.forwardRef<
  HTMLButtonElement,
  MultiSelectLimitedProps
>(
  (
    {
      options = [],
      optionLabel,
      optionValue,
      apiUrl,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = 'Select options',
      returnType = 'object',
      animation = 0,
      maxCount = 3,
      maxSelectionLimit = 3, // Default max selection limit
      modalPopover = false,
      asChild = false,
      className,
      noResultText = 'No options found',
      showLimitMessage = true,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [apiOptions, setApiOptions] = React.useState<
      { label: string; value: string }[]
    >([]);
    console.log(asChild);


    const isObjectType = returnType === 'object';

    // Fetch options from API if apiUrl is provided
    React.useEffect(() => {
      if (!apiUrl) {
        setApiOptions([]);
        return;
      }

      const fetchOptions = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
          setApiOptions(data);
        } catch (error) {
          console.error('Error fetching options:', error);
          setApiOptions([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOptions();
    }, [apiUrl]);

    // Use API options if available, otherwise use static options
    const displayOptions: any[] = apiUrl ? apiOptions : options;

    const getValue = (item: any) =>
      isObjectType && optionValue
        ? item[optionValue]
        : typeof item === 'object' && optionValue
          ? item[optionValue]
          : item;

    const getLabel = (item: any) =>
      isObjectType && optionLabel
        ? item[optionLabel]
        : typeof item === 'object' && optionLabel
          ? item[optionLabel]
          : item;

    const toggleOption = (option: any) => {
      const value = getValue(option);
      if (!value) return;

      let newSelectedValues;

      if (returnType === 'object') {
        const exists = selectedValues.some(
          (item) => typeof item === 'object' && getValue(item) === value
        );

        if (exists) {
          // Deselecting - always allowed
          newSelectedValues = selectedValues.filter(
            (item) => getValue(item) !== value
          );
        } else {
          // Selecting - check limit
          if (selectedValues.length >= maxSelectionLimit) {
            return; // Don't allow selection beyond limit
          }
          newSelectedValues = [...selectedValues, option];
        }
      } else {
        const exists = selectedValues.includes(value);

        if (exists) {
          // Deselecting - always allowed
          newSelectedValues = selectedValues.filter((val) => val !== value);
        } else {
          // Selecting - check limit
          if (selectedValues.length >= maxSelectionLimit) {
            return; // Don't allow selection beyond limit
          }
          newSelectedValues = [...selectedValues, value];
        }
      }

      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === displayOptions.length) {
        handleClear();
      } else {
        // Limit "Select All" to maxSelectionLimit
        const limitedOptions = displayOptions.slice(0, maxSelectionLimit);
        const allValues = limitedOptions.map((option) =>
          typeof option === 'object' ? getValue(option) : option
        );
        setSelectedValues(allValues);
        onValueChange(allValues);
      }
    };

    const isSelected = (option: any) => {
      const value = getValue(option);
      return selectedValues.some((item) =>
        returnType === 'object' ? getValue(item) === value : item === value
      );
    };

    // Check if option should be disabled
    const isOptionDisabled = (option: any) => {
      // Don't disable if already selected (allow deselection)
      if (isSelected(option)) return false;

      // Disable if limit reached
      return selectedValues.length >= maxSelectionLimit;
    };

    return (
      <div className="w-full">
        <Popover
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          modal={modalPopover}
        >
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              {...props}
              onClick={handleTogglePopover}
              disabled={isLoading}
              className={cn(
                'relative flex w-full p-1 rounded-md border border-gray-200 min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto',
                selectedValues.length > 0 && 'pr-20',
                className
              )}
            >
              {selectedValues.length > 0 ? (
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-wrap items-center">
                    {selectedValues.slice(0, maxCount).map((value) => {
                      const label = isObjectType
                        ? getLabel(value)
                        : getLabel(
                            displayOptions.find(
                              (opt) => getValue(opt) === value
                            )
                          );

                      return (
                        <Badge
                          key={getValue(value)}
                          className={cn(
                            isAnimating ? 'animate-bounce' : '',
                            multiSelectVariants({ variant }),
                            'text-[#683BD4] border-[#683BD4]'
                          )}
                          style={{ animationDuration: `${animation}s` }}
                        >
                          {label}

                          <button
                            className="h-4 w-4 cursor-pointer text-[#683BD4] border-[#683BD4]"
                            onClick={(event: React.MouseEvent) => {
                              event.stopPropagation();
                              toggleOption(value);
                            }}
                          >
                            X
                          </button>
                        </Badge>
                      );
                    })}
                    {selectedValues.length > maxCount && (
                      <Badge
                        className={cn(
                          'bg-transparent hover:bg-transparent',
                          isAnimating ? 'animate-bounce' : '',
                          'text-[#683BD4] border-[#683BD4]',
                          multiSelectVariants({ variant })
                        )}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {`+ ${selectedValues.length - maxCount} more`}
                        <button
                          className="h-4 w-4 cursor-pointer text-[#683BD4] border-[#683BD4]"
                          onClick={(event: React.MouseEvent) => {
                            event.stopPropagation();
                            clearExtraOptions();
                          }}
                        >
                          X
                        </button>
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between absolute right-1 top-1/2 -translate-y-1/2">
                    <XIcon
                      className="h-4 mx-2 cursor-pointer text-muted-foreground"
                      onClick={(event: React.MouseEvent) => {
                        event.stopPropagation();
                        event.preventDefault();
                        handleClear();
                      }}
                    />
                    <Separator
                      orientation="vertical"
                      className="flex min-h-6 h-full"
                    />
                    <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full mx-auto">
                  <span className="text-sm text-gray-500 mx-3">
                    {isLoading ? 'Loading...' : placeholder}
                  </span>
                  <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-white border border-[#E7E7E7] rounded-md"
            align="start"
            onEscapeKeyDown={() => setIsPopoverOpen(false)}
          >
            <Command>
              <CommandList>
                <CommandEmpty>{noResultText}</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    key="all"
                    onSelect={toggleAll}
                    className="cursor-pointer"
                    disabled={selectedValues.length >= maxSelectionLimit}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        selectedValues.length === displayOptions.length ||
                          selectedValues.length === maxSelectionLimit
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className="h-4 w-4 text-white" />
                    </div>
                    <span>(Select All)</span>
                  </CommandItem>
                  {displayOptions.map((option) => {
                    const disabled = isOptionDisabled(option);
                    return (
                      <CommandItem
                        key={getValue(option)}
                        onSelect={() => !disabled && toggleOption(option)}
                        className={cn(
                          'cursor-pointer',
                          disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        disabled={disabled}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected(option)
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <CheckIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className={disabled ? 'text-gray-400' : ''}>
                          {getLabel(option)}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <div className="flex items-center justify-between">
                    {selectedValues.length > 0 && (
                      <>
                        <CommandItem
                          onSelect={handleClear}
                          className="flex-1 justify-center cursor-pointer"
                        >
                          Clear
                        </CommandItem>
                        <Separator
                          orientation="vertical"
                          className="flex min-h-6 h-full"
                        />
                      </>
                    )}
                    <CommandItem
                      onSelect={() => setIsPopoverOpen(false)}
                      className="flex-1 justify-center cursor-pointer max-w-full"
                    >
                      Close
                    </CommandItem>
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
          {animation > 0 && selectedValues.length > 0 && (
            <WandSparkles
              className={cn(
                'cursor-pointer my-2 text-foreground bg-background w-3 h-3',
                isAnimating ? '' : 'text-muted-foreground'
              )}
              onClick={() => setIsAnimating(!isAnimating)}
            />
          )}
        </Popover>

        {/* Show limit message */}
        {showLimitMessage && selectedValues.length >= maxSelectionLimit && (
          <p className="text-xs text-amber-600 mt-1">
            Maximum {maxSelectionLimit} options can be selected
          </p>
        )}
      </div>
    );
  }
);

MultiSelectLimited.displayName = 'MultiSelectLimited';
