import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';
import { FormFields } from '../dynamic-form/form-fields';
import { FormField } from '../dynamic-form/types';
import { generateZodSchema } from '@/hooks/form/generateZodSchema';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type LazyModalProps<TPayload extends Record<string, any> = any> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields?: FormField[];
  initial?: Partial<TPayload>;
  onSave: (payload: Partial<TPayload>) => Promise<void> | void;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
  closeOnSave?: boolean;
};

export default function LazyFormModal<
  TPayload extends Record<string, any> = any,
>({
  open,
  onOpenChange,
  fields = [],
  initial = {},
  onSave,
  title = 'Edit',
  submitLabel = 'Save',
  className,
  closeOnSave = true,
}: LazyModalProps<TPayload>) {
  const schema = useMemo(() => generateZodSchema(fields), [fields]);

  const defaultValues = useMemo(() => {
    const dv: Record<string, any> = {};
    for (const f of fields) {
      dv[f.name] =
        (initial && (initial as any)[f.name]) ?? f.value ?? undefined;
    }
    for (const k of Object.keys(initial || {})) {
      if (!(k in dv)) dv[k] = (initial as any)[k];
    }
    return dv;
  }, [fields, initial]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  });

  const { reset, handleSubmit, formState } = form;

  useEffect(() => {
    if (open) {
      reset(defaultValues, { keepDefaultValues: true });
    } else {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const submitHandler = async (values: Record<string, any>) => {
    const payload: Record<string, any> = {};
    for (const [k, v] of Object.entries(values)) {
      if (typeof v === 'string' && v.trim() === '') payload[k] = null;
      else payload[k] = v;
    }

    try {
      await Promise.resolve(onSave(payload as Partial<TPayload>));
      if (closeOnSave) {
        onOpenChange(false);
        reset(defaultValues);
      }
    } catch (err) {
      console.error('LazyFormModal onSave error', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* flex-col and overflow-hidden so header/footer don't scroll */}
      <DialogContent
        className={cn(
          'max-w-[90vw] w-full sm:max-w-md xl:max-w-lg bg-white',
          /* Important layout classes */
          'flex flex-col  max-h-[80vh]',
          className
        )}
      >
        {/* Sticky header (always visible) */}
        <DialogHeader className="sticky top-0 z-20 ">
          <DialogTitle className="text-lg xl:text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          {/* The scrollable area: flex-1 with overflow-auto */}
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex-1 overflow-auto"
          >
            {/* Provide inner padding so content doesn't hide under header/footer */}
            <div className="px-4 pt-4  xl:pt-6 ">
              <FormFields fields={fields} form={form} />
            </div>

            {/* Footer is outside the scrolling content so it stays visible.
                We still render it inside the form so submit button works naturally. */}
            <DialogFooter className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-sm  px-4 py-3">
              <div className="w-full">
                <Button
                  type="submit"
                  className="w-full text-white rounded-xl text-sm xl:text-base h-10 xl:h-12 cursor-pointer"
                  disabled={formState.isSubmitting}
                >
                  {formState.isSubmitting ? 'Saving...' : submitLabel}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
