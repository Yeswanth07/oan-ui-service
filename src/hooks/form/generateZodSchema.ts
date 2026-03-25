
// src/utils/generateZodSchema.ts

import { FormField } from '@/components/shared/dynamic-form/types';
import { z } from 'zod';

export function generateZodSchema(fields: FormField[]) {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    const isRequired = field.validationRules?.required ?? false;
    const label = field.label || field.name;
    let validator: z.ZodTypeAny;

    // ===== TYPE-BASED VALIDATION =====

    switch (field.type) {
      // --- TEXT & TEXTAREA ---
      case 'text':
      case 'textarea': {
        let stringValidator = z.string().trim();

        // Custom: minLength
        if (field.validationRules?.minLength !== undefined) {
          stringValidator = stringValidator.min(
            field.validationRules.minLength,
            {
              message: `${label} must be at least ${field.validationRules.minLength} characters`,
            }
          );
        }

        // Custom: maxLength
        if (field.validationRules?.maxLength !== undefined) {
          stringValidator = stringValidator.max(
            field.validationRules.maxLength,
            {
              message: `${label} must be at most ${field.validationRules.maxLength} characters`,
            }
          );
        }

        // Custom: pattern (regex)
        if (field.validationRules?.pattern !== undefined) {
          stringValidator = stringValidator.regex(
            new RegExp(field.validationRules.pattern),
            {
              message: `${label} has invalid format`,
            }
          );
        }

        // Required validation
        if (isRequired) {
          validator = stringValidator.min(1, {
            message: `${label} is required`,
          });
        } else {
          validator = stringValidator.optional();
        }

        break;
      }

      // --- EMAIL ---
      case 'email': {
        const emailValidator = z.string().email({
          message: `${label} must be a valid email`,
        });

        if (isRequired) {
          validator = emailValidator.min(1, {
            message: `${label} is required`,
          });
        } else {
          validator = emailValidator.optional();
        }

        break;
      }

      // --- PHONE ---
      case 'phone': {
        let phoneValidator = z.string();

        // Custom: pattern validation
        if (field.validationRules?.pattern) {
          phoneValidator = phoneValidator.regex(
            new RegExp(field.validationRules.pattern),
            {
              message: `${label} must be a valid phone number`,
            }
          );
        }

        if (isRequired) {
          validator = phoneValidator.min(1, {
            message: `${label} is required`,
          });
        } else {
          validator = phoneValidator.optional();
        }

        break;
      }

      // --- URL ---
      case 'url': {
        const urlValidator = z.string().url({
          message: `${label} must be a valid URL`,
        });

        if (isRequired) {
          validator = urlValidator.min(1, {
            message: `${label} is required`,
          });
        } else {
          validator = urlValidator.optional();
        }

        break;
      }

      // --- NUMBER ---
      case 'number': {
        let numberValidator = z.number();

        // Custom: min
        if (field.validationRules?.min !== undefined) {
          numberValidator = numberValidator.min(field.validationRules.min, {
            message: `${label} must be at least ${field.validationRules.min}`,
          });
        }

        // Custom: max
        if (field.validationRules?.max !== undefined) {
          numberValidator = numberValidator.max(field.validationRules.max, {
            message: `${label} must be at most ${field.validationRules.max}`,
          });
        }

        if (!isRequired) {
          validator = numberValidator.optional();
        } else {
          validator = numberValidator;
        }

        break;
      }

      // --- DATE ---
      case 'date': {
        if (isRequired) {
          validator = z.union([z.string(), z.date()]).refine(
            (val) => {
              if (typeof val === 'string') return val.trim() !== '';
              return val !== null && val !== undefined;
            },
            {
              message: `${label} is required`,
            }
          );
        } else {
          validator = z.union([z.string(), z.date()]).optional();
        }

        break;
      }

      // --- DROPDOWN / SELECT ---
      case 'dropdown':
      case 'options': {
        if (isRequired) {
          validator = z.any().refine(
            (val) => {
              if (val === undefined || val === null) return false;
              if (typeof val === 'string' && val.trim() === '') return false;
              if (typeof val === 'object' && Object.keys(val).length === 0)
                return false;
              return true;
            },
            {
              message: `${label} is required`,
            }
          );
        } else {
          validator = z.any().optional();
        }

        break;
      }

      // --- MULTI-SELECT ---
      case 'multi-select':
      case 'p-multiSelect': {
        if (isRequired) {
          validator = z.array(z.any()).min(1, {
            message: `${label} requires at least one selection`,
          });
        } else {
          validator = z.array(z.any()).optional();
        }

        break;
      }

      // --- BOOLEAN / CHECKBOX ---
      case 'boolean':
      case 'checkbox': {
        validator = z.boolean().optional();
        break;
      }

      // --- DEFAULT ---
      default: {
        if (isRequired) {
          validator = z.any().refine(
            (val) => {
              if (val === undefined || val === null) return false;
              if (typeof val === 'string' && val.trim() === '') return false;
              if (Array.isArray(val) && val.length === 0) return false;
              return true;
            },
            {
              message: `${label} is required`,
            }
          );
        } else {
          validator = z.any().optional();
        }
      }
    }

    schemaShape[field.name] = validator;
  });

  return z.object(schemaShape);
}
