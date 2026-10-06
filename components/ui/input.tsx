import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-mogu-wine"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-mogu-wine",
          "placeholder:text-mogu-gray-400",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          error
            ? "border-mogu-error focus:ring-mogu-error/30 focus:border-mogu-error"
            : "border-mogu-pink focus:ring-mogu-red/25 focus:border-mogu-red",
          "disabled:opacity-50 disabled:bg-mogu-gray-50",
          className
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-mogu-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-sm text-mogu-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-mogu-wine"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-mogu-wine",
          "placeholder:text-mogu-gray-400",
          "transition-colors duration-150 resize-y min-h-[100px]",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          error
            ? "border-mogu-error focus:ring-mogu-error/30 focus:border-mogu-error"
            : "border-mogu-pink focus:ring-mogu-red/25 focus:border-mogu-red",
          "disabled:opacity-50 disabled:bg-mogu-gray-50",
          className
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-mogu-error" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-sm text-mogu-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}