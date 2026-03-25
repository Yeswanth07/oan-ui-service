
// src/lib/hooks/useVisibilityEvaluator.ts

import { Condition, FormField } from '@/components/shared/dynamic-form/types';
import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';

export function useVisibilityEvaluator(fields: FormField[], control: any) {
  // Watch all fields that have visibility conditions dependent on them
  const watchedFields = useWatch({ control });

  const evaluateCondition = (
    condition: Condition,
    fieldValue: any
  ): boolean => {
    const { expression, value: expectedValue } = condition;

    switch (expression) {
      case 'answered':
      case 'exists':
        return (
          fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
        );

      case 'not_answered':
        return (
          fieldValue === undefined || fieldValue === null || fieldValue === ''
        );

      case '=':
        return fieldValue === expectedValue;

      case '!=':
        return fieldValue !== expectedValue;

      case '>':
        return Number(fieldValue) > Number(expectedValue);

      case '>=':
        return Number(fieldValue) >= Number(expectedValue);

      case '<':
        return Number(fieldValue) < Number(expectedValue);

      case '<=':
        return Number(fieldValue) <= Number(expectedValue);

      default:
        return true;
    }
  };

  const evaluateVisibility = (field: FormField): boolean => {
    if (!field.visibilityConditions) return true;

    const visibilityConfig = field.visibilityConditions as any;

    // Handle both old and new structure
    const conditions = visibilityConfig.conditions || [];
    const rule = visibilityConfig.conditionsRule || 'all';

    if (conditions.length === 0) return true;

    const results = conditions.map((condition: Condition) => {
      const dependentFieldName = condition.name;
      const dependentFieldValue = watchedFields[dependentFieldName!];
      return evaluateCondition(condition, dependentFieldValue);
    });

    // Apply rule: 'all' = AND, 'any' = OR
    return rule === 'all' ? results.every(Boolean) : results.some(Boolean);
  };

  const visibilityMap = useMemo(() => {
    const map = new Map<string, boolean>();
    fields.forEach((field) => {
      map.set(field.name, evaluateVisibility(field));
    });
    return map;
  }, [fields, watchedFields]);

  return {
    isVisible: (fieldName: string) => visibilityMap.get(fieldName) ?? true,
  };
}
