/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm as useTanstackFormBase } from "@tanstack/react-form";
import * as React from "react";
import type { z } from "zod";

import {
  FieldDescription as BaseFieldDescription,
  FieldError as BaseFieldError,
  FieldLabel as BaseFieldLabel,
  Field,
  FieldContent,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * Type helper to extract all possible deep keys from an object type
 * Supports nested objects and arrays with index access
 * Based on TanStack Form's DeepKeys implementation
 *
 * @example
 * type User = { name: string; emails: { address: string }[] }
 * type Keys = DeepKeys<User>
 * // "name" | "emails" | "emails.0" | "emails.0.address" | "emails[0]" | "emails[0].address"
 */
export type DeepKeys<T> = T extends object
  ? {
      [K in keyof T & (string | number)]: T[K] extends any[]
        ?
            | `${K}`
            | `${K}.${number}`
            | `${K}.${number}.${DeepKeys<T[K][number]> & string}`
            | `${K}[${number}]`
            | `${K}[${number}].${DeepKeys<T[K][number]> & string}`
        : T[K] extends object
          ? `${K}` | `${K}.${DeepKeys<T[K]> & string}`
          : `${K}`;
    }[keyof T & (string | number)]
  : never;

/**
 * Type for TanStack Form API with generic form data
 * Uses a branded type approach to preserve type information through the wrapper
 */
export type FormApi<TFormData = any> = {
  __brand: "FormApi";
  __formData: TFormData;
} & Record<string, any>;

/**
 * Helper type to extract form data type from FormApi
 */
type InferFormData<T> = T extends { __formData: infer U } ? U : any;

/**
 * Helper type to extract the value type at a given path
 * Based on TanStack Form's DeepValue implementation
 */
type DeepValue<TData, TPath> = TPath extends `${infer Key}.${infer Rest}`
  ? Key extends keyof TData
    ? DeepValue<TData[Key], Rest>
    : never
  : TPath extends `${infer Key}[${number}]`
    ? Key extends keyof TData
      ? TData[Key] extends (infer Item)[]
        ? Item
        : never
      : never
    : TPath extends `${infer Key}[${number}].${infer Rest}`
      ? Key extends keyof TData
        ? TData[Key] extends (infer Item)[]
          ? DeepValue<Item, Rest>
          : never
        : never
      : TPath extends keyof TData
        ? TData[TPath]
        : never;

/**
 * Simplified Field API type with essential properties
 * This is a typed version of TanStack Form's FieldApi with the most commonly used properties
 */
export type FieldApiType<TValue = any> = {
  name: string;
  state: {
    value: TValue;
    meta: {
      isTouched: boolean;
      isDirty: boolean;
      isValidating: boolean;
      errors: (string | { message?: string })[];
    };
  };
  handleChange: (value: TValue) => void;
  handleBlur: () => void;
  pushValue?: (value: any) => void;
  removeValue?: (index: number) => void;
};

/**
 * Hook to create a TanStack form with Zod validation
 * Returns a type-safe FormApi with inferred form data type
 *
 * @example
 * const form = useForm({
 *   schema: z.object({ email: z.string().email() }),
 *   defaultValues: { email: '' },
 *   onSubmit: async (values) => console.log(values),
 * })
 * // form is typed as FormApi<{ email: string }>
 */
export function useForm<TSchema extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  validationMode = "onBlur",
}: {
  schema: TSchema;
  defaultValues: z.infer<TSchema>;
  onSubmit: (values: z.infer<TSchema>) => void | Promise<void>;
  validationMode?: "onChange" | "onBlur" | "onSubmit";
}): FormApi<z.infer<TSchema>> {
  return useTanstackFormBase({
    defaultValues,
    validators: {
      [validationMode]: schema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as z.infer<TSchema>);
    },
  }) as unknown as FormApi<z.infer<TSchema>>;
}

/**
 * Form wrapper component that provides form context and handles submission
 *
 * @example
 * <Form form={form}>
 *   <FormField form={form} name="email">
 *     {(field) => (
 *       <FormItem field={field}>
 *         <FormLabel>Email</FormLabel>
 *         <FormControl>
 *           <Input
 *             value={field.state.value}
 *             onChange={(e) => field.handleChange(e.target.value)}
 *             onBlur={field.handleBlur}
 *           />
 *         </FormControl>
 *         <FormMessage />
 *       </FormItem>
 *     )}
 *   </FormField>
 * </Form>
 */
export function Form({
  form,
  children,
  className,
  disabled,
  ...props
}: {
  form: FormApi;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
} & Omit<React.ComponentProps<"form">, "onSubmit">) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className={className}
      {...props}
    >
      <fieldset
        disabled={disabled ?? form.state.isSubmitting}
        className={className}
      >
        {children}
      </fieldset>
    </form>
  );
}

/**
 * Field wrapper component that connects to form and provides field API
 * Automatically infers form data type from the form parameter for type-safe field names!
 *
 * @example
 * const form = useForm({ schema: z.object({ email: z.string(), teamName: z.string() }), ... })
 *
 * <FormField form={form} name="email"> // ✅ Valid - type automatically inferred!
 * <FormField form={form} name="teamName"> // ✅ Valid - autocomplete works!
 * <FormField form={form} name="teamNam"> // ❌ TypeScript error - typo caught at compile time!
 *
 * @example
 * // With arrays
 * const form = useForm({ schema: z.object({ users: z.array(z.object({ email: z.string() })) }), ... })
 * <FormField form={form} name="users"> // ✅ Valid
 * <FormField form={form} name="users[0].email"> // ✅ Valid - supports nested paths!
 */
export function FormField<
  TForm extends FormApi,
  TName extends DeepKeys<InferFormData<TForm>> = DeepKeys<InferFormData<TForm>>,
>({
  form,
  name,
  mode,
  children,
}: {
  form: TForm;
  name: TName;
  mode?: "value" | "array";
  children: (
    field: FieldApiType<DeepValue<InferFormData<TForm>, TName>>,
  ) => React.ReactNode;
}) {
  const FormFieldComponent = (form as any).Field;
  return (
    <FormFieldComponent name={name} mode={mode}>
      {children}
    </FormFieldComponent>
  );
}

type FormItemContextValue = {
  field: any;
  form: FormApi;
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

const useFormItem = () => {
  const context = React.useContext(FormItemContext);

  if (!context) {
    throw new Error("FormItem components must be used within FormItem");
  }

  return context;
};

/**
 * Container for form field with error state and accessibility
 * Uses Field component from @/components/ui/field with TanStack Form integration
 *
 * @example
 * <FormItem field={field} form={form}>
 *   <FormLabel>Email</FormLabel>
 *   <FormControl>
 *     <Input {...getInputFieldProps(field)} />
 *   </FormControl>
 *   <FormDescription>Enter your email</FormDescription>
 *   <FormMessage />
 * </FormItem>
 */
export function FormItem({
  field,
  form,
  className,
  orientation,
  children,
  ...props
}: {
  field: any;
  form: FormApi;
  children: React.ReactNode;
  className?: string;
  orientation?: "vertical" | "horizontal" | "responsive";
} & Omit<React.ComponentProps<typeof Field>, "orientation">) {
  const id = React.useId();
  const hasSubmitted = form.state.submissionAttempts > 0;
  const isInvalid =
    hasSubmitted &&
    field.state.meta.isTouched &&
    field.state.meta.errors.length > 0;

  return (
    <FormItemContext.Provider value={{ field, form, id }}>
      <Field
        data-invalid={isInvalid}
        orientation={orientation}
        className={className}
        {...props}
      >
        {children}
      </Field>
    </FormItemContext.Provider>
  );
}

/**
 * Label for form field - uses FieldLabel with TanStack Form integration
 */
export function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof BaseFieldLabel>) {
  const { field, form, id } = useFormItem();
  const hasSubmitted = form.state.submissionAttempts > 0;
  const isInvalid =
    hasSubmitted &&
    field.state.meta.isTouched &&
    field.state.meta.errors.length > 0;

  return (
    <BaseFieldLabel
      data-error={!!isInvalid}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={`${id}-form-item`}
      {...props}
    />
  );
}

/**
 * Control wrapper for form field input
 * Simply passes through children - field props should be spread directly on inputs
 */
export function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Description text for form field - uses FieldDescription with TanStack Form integration
 */
export function FormDescription({
  className,
  ...props
}: React.ComponentProps<typeof BaseFieldDescription>) {
  const { id } = useFormItem();

  return (
    <BaseFieldDescription
      id={`${id}-form-item-description`}
      className={className}
      {...props}
    />
  );
}

/**
 * Error message for form field - uses FieldError with TanStack Form integration
 */
export function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseFieldError>) {
  const { field, form, id } = useFormItem();
  const hasSubmitted = form.state.submissionAttempts > 0;
  const shouldShowError =
    hasSubmitted &&
    field.state.meta.isTouched &&
    field.state.meta.errors.length > 0;

  if (!shouldShowError && !children) {
    return null;
  }

  // Convert TanStack Form errors to the format expected by FieldError
  const errors = shouldShowError
    ? field.state.meta.errors.map((error: any) => {
        if (typeof error === "string") {
          return { message: error };
        }
        return error;
      })
    : undefined;

  return (
    <BaseFieldError
      id={`${id}-form-item-message`}
      errors={errors}
      className={className}
      {...props}
    >
      {children}
    </BaseFieldError>
  );
}

/**
 * Helper to get field state (isInvalid, errors, etc.)
 *
 * @example
 * const { isInvalid, errors } = getFieldState(field, form)
 */
export function getFieldState(field: any, form?: FormApi) {
  const hasSubmitted = form ? form.state.submissionAttempts > 0 : false;
  const isInvalid =
    hasSubmitted &&
    field.state.meta.isTouched &&
    field.state.meta.errors.length > 0;
  return {
    isInvalid,
    errors: field.state.meta.errors,
    isTouched: field.state.meta.isTouched,
    isDirty: field.state.meta.isDirty,
    isValidating: field.state.meta.isValidating,
  };
}

/**
 * Helper to get field props for native input elements (input, textarea)
 *
 * @example
 * <Input {...getInputFieldProps(field)} type="email" />
 */
export function getInputFieldProps(field: any) {
  const { isInvalid } = getFieldState(field);
  return {
    name: field.name,
    value: field.state.value ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      field.handleChange(e.target.value),
    onBlur: field.handleBlur,
    "aria-invalid": isInvalid,
  };
}

/**
 * Helper to get field props for controlled components (Select)
 *
 * @example
 * <Select {...getControlledFieldProps(field)}>
 *   <SelectTrigger><SelectValue /></SelectTrigger>
 *   <SelectContent>...</SelectContent>
 * </Select>
 */
export function getControlledFieldProps(field: any) {
  const { isInvalid } = getFieldState(field);
  return {
    name: field.name,
    value: field.state.value,
    onValueChange: (value: string) => field.handleChange(value),
    "aria-invalid": isInvalid,
  };
}

/**
 * Helper to get field props for checkbox components
 *
 * @example
 * <Checkbox {...getCheckboxFieldProps(field)} />
 */
export function getCheckboxFieldProps(field: any) {
  const { isInvalid } = getFieldState(field);
  return {
    name: field.name,
    checked: field.state.value,
    onCheckedChange: (checked: boolean) => {
      field.handleChange(checked);
      // Trigger blur to validate immediately after change
      field.handleBlur();
    },
    "aria-invalid": isInvalid,
  };
}

/**
 * Helper to get field props for switch components
 *
 * @example
 * <Switch {...getSwitchFieldProps(field)} />
 */
export function getSwitchFieldProps(field: any) {
  return getCheckboxFieldProps(field);
}

/**
 * Helper to get field props for textarea elements
 * Alias for getInputFieldProps since they share the same signature
 *
 * @example
 * <Textarea {...getTextareaFieldProps(field)} />
 */
export function getTextareaFieldProps(field: any) {
  return getInputFieldProps(field);
}

/**
 * Helper to get field props for Select components
 * Alias for getControlledFieldProps with better naming for selects
 *
 * @example
 * <Select {...getSelectFieldProps(field)}>
 *   <SelectTrigger><SelectValue /></SelectTrigger>
 *   <SelectContent>...</SelectContent>
 * </Select>
 */
export function getSelectFieldProps(field: any) {
  return getControlledFieldProps(field);
}

/**
 * Helper to get field props for RadioGroup components
 *
 * @example
 * <RadioGroup {...getRadioGroupFieldProps(field)}>
 *   <RadioGroupItem value="option1" />
 *   <RadioGroupItem value="option2" />
 * </RadioGroup>
 */
export function getRadioGroupFieldProps(field: any) {
  const { isInvalid } = getFieldState(field);
  return {
    name: field.name,
    value: field.state.value,
    onValueChange: (value: string) => {
      field.handleChange(value);
      // Trigger blur to validate immediately after change
      field.handleBlur();
    },
    "aria-invalid": isInvalid,
  };
}

/**
 * Re-export Field components for direct use in custom layouts
 * These can be used when you need more control over the form layout
 * and don't need the TanStack Form context integration
 *
 * @example
 * // Direct usage without context
 * <FormField form={form} name="email">
 *   {(field) => {
 *     const { isInvalid } = getFieldState(field, form)
 *     return (
 *       <Field data-invalid={isInvalid} orientation="horizontal">
 *         <FieldLabel htmlFor="email">Email</FieldLabel>
 *         <FieldContent>
 *           <Input {...getInputFieldProps(field)} id="email" />
 *           <FieldDescription>Enter your email address</FieldDescription>
 *           <FieldError errors={field.state.meta.errors} />
 *         </FieldContent>
 *       </Field>
 *     )
 *   }}
 * </FormField>
 */
export {
  Field,
  FieldContent,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
};
