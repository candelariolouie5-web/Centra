import React from "react";

export const Field = ({ label, value }: any) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);

export const Placeholder = ({ text }: any) => (
  <p className="text-sm text-gray-400">{text}</p>
);

export const FieldBlock = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?: string;
}) => {
  const inputId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          id={inputId}
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg px-3 py-2.5 text-sm
                     bg-gray-50 text-gray-900
                     border border-gray-200
                     placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                     transition resize-none"
        />
      ) : (
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg px-3 py-2.5 text-sm
                     bg-gray-50 text-gray-900
                     border border-gray-200
                     placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                     transition"
        />
      )}
    </div>
  );
};

export const Th = ({ children, className = "" }: any) => (
  <th
    className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${className}`}
  >
    {children}
  </th>
);

export const Td = ({ children }: any) => (
  <td className="px-4 py-3 text-sm text-gray-800">{children}</td>
);

export const SectionLabel = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <div className="mb-2">
    <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
      {title}
    </p>
    {subtitle && (
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    )}
  </div>
);

export const ActionChips = ({
  options,
  onSelect,
}: {
  options: string[];
  onSelect?: (option: string) => void;
}) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {options.map((o) => (
      <button
        key={o}
        onClick={() => onSelect?.(o)}
        className="px-3 py-1.5 rounded-full text-xs font-medium
                   border border-violet-200
                   bg-violet-50 text-violet-700
                   hover:bg-violet-100 hover:border-violet-300
                   transition"
      >
        + {o}
      </button>
    ))}
  </div>
);