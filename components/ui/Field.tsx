import type { ReactNode } from "react";

export default function Field({
  label,
  children,
  help,
  required,
}: {
  label: string;
  children: ReactNode;
  help?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required ? <span className="text-red-500 ml-1">*</span> : null}
      </label>
      {children}
      {help ? <p className="text-xs text-slate-500 mt-1">{help}</p> : null}
    </div>
  );
}
