import { useState } from "react";

export default function NavGroup({ icon: Icon, label, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-4 py-2.5 text-sm text-gray-200 bg-gray-900 hover:bg-gray-600 transition-colors"
      >
        <span className="flex items-center gap-3">
          {Icon ? <Icon /> : null}
          {label}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
      </button>

      <div
        className={`ml-6 overflow-hidden transition-[max-height,opacity] duration-300 ${
          open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-l border-white/10 pl-4">{children}</div>
      </div>
    </div>
  );
}
