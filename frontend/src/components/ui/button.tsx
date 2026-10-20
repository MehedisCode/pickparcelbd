"use client";

export function Button({
  children,
  tone = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button
      type="button"
      className={`button ${tone} focus-visible:ring-2 focus-visible:ring-brand-orange ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
