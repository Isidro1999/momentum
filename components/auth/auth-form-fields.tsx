import type { InputHTMLAttributes } from "react";

const inputClassName =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthField({
  id,
  label,
  error,
  className,
  ...props
}: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        className={className ? `${inputClassName} ${className}` : inputClassName}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface AuthSubmitButtonProps {
  children: string;
  loading?: boolean;
  disabled?: boolean;
}

export function AuthSubmitButton({
  children,
  loading = false,
  disabled = false,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Procesando…" : children}
    </button>
  );
}

export function AuthFormError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
      role="alert"
    >
      {message}
    </div>
  );
}

export function AuthFormSuccess({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800"
      role="status"
    >
      {message}
    </div>
  );
}
