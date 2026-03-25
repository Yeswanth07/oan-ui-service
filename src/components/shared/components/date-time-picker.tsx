import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '../../../lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { Button } from '../../ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

export interface FormattedDate {
  date: Date;
  formattedDate: string;
  format: string;
}
type DaySelectionMode = 'single' | 'multiple' | 'range' | 'default';
export interface DateTimePickerProps {
  date?: Date;
  mode?: DaySelectionMode;
  maxDate?: any;
  minDate?: any;
  setDate?: (date: Date | undefined) => void;
  onSelect?: (date: Date | Date[] | DateRange | undefined) => void;
  disableToday?: boolean;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  includeTime?: boolean;
  className?: string;
  formatStr?: string;
  placeholder?: string;
  disabledDates?: (date: Date) => boolean;
  onDateChange?: (date: Date | undefined) => void;
  getFormattedDate?: (date: FormattedDate) => void;
  startYear?: number;
  endYear?: number;
  disabled?: boolean;
  hasError?: boolean;
}
export default function DateTimePicker({
  date,
  setDate,
  onSelect,
  maxDate,
  minDate,
  mode = 'single',
  disableToday = false,
  disablePastDates = false,
  disableFutureDates = false,
  includeTime = false,
  className,
  formatStr = 'yyyy-MM-dd',
  placeholder = 'Pick a date',
  disabledDates,
  onDateChange,
  getFormattedDate,
  hasError,
  /*  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  disabled = false, */
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const displayDate = date ?? '';
  const today = new Date();

  const startMonth = minDate
    ? new Date(new Date(minDate).getFullYear(), 0)
    : new Date(today.getFullYear() - 50, 0);

  const endMonth = maxDate
    ? new Date(new Date(maxDate).getFullYear(), 11)
    : new Date(today.getFullYear() + 50, 11);
  const handleDateSelection = (selected: any) => {
    if (mode === 'single') {
      const date = selected as Date | undefined;
      setDate?.(date);
      onDateChange?.(date);
      if (date && getFormattedDate) {
        getFormattedDate({
          date,
          formattedDate: format(date, formatStr),
          format: formatStr,
        });
      }
      if (date) setOpen(false);
    }

    if (mode === 'range') {
      const range = selected as DateRange | undefined;
      // optional: handle range start/end if needed
      onSelect?.(range as any); // cast to avoid type error, or define a union callback type
    }

    if (mode === 'multiple') {
      const dates = selected as Date[];
      onSelect?.(dates as any);
    }
  };

  const isDateDisabled = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const testDay = new Date(day);
    testDay.setHours(0, 0, 0, 0);

    const isToday = testDay.getTime() === today.getTime();
    const isPast = testDay < today;
    const isFuture = testDay > today;

    if (disabledDates && disabledDates(testDay)) return true;
    if (disableToday && isToday) return true;
    if (disablePastDates && isPast) return true;
    if (disableFutureDates && isFuture) return true;
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (testDay < min) return true;
    }

    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      if (testDay > max) return true;
    }
    return false;
  };
  return (
    <div className={cn('grid gap-2  ', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal h-9',
              !displayDate && 'text-gray-500',
              // ✅ Add error styling
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-50'
                : 'border-gray-200'
            )}
          >
            <CalendarIcon className={cn('mr-2 h-4 w-4')} />
            {displayDate
              ? format(displayDate, includeTime ? 'PPP HH:mm' : 'PPP')
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white border border-[#E7E7E7] rounded-md z-50"
          align="start"
        >
          {/* to do dropdown for month week and time */}
          {mode === 'single' && (
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelection}
              disabled={isDateDisabled}
              captionLayout="dropdown"
              startMonth={startMonth}
              endMonth={endMonth}
            />
          )}

          {mode === 'range' && (
            <Calendar
              mode="range"
              selected={date as any} // Or manage this properly with DateRange
              onSelect={handleDateSelection}
              disabled={isDateDisabled}
              month={date}
              startMonth={startMonth}
              endMonth={endMonth}
            />
          )}

          {mode === 'multiple' && (
            <Calendar
              mode="multiple"
              selected={date as any} // Or manage this with `Date[]`
              onSelect={handleDateSelection}
              disabled={isDateDisabled}
              initialFocus
              month={date}
              startMonth={startMonth}
              endMonth={endMonth}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
