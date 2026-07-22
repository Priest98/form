import React from "react";

export const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, className = "", variant = "primary", ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50 disabled:pointer-events-none ring-offset-white h-10 py-2 px-6 uppercase tracking-wider text-xs";
  const variants: any = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm",
    outline: "border border-slate-200 hover:bg-slate-50",
    secondary: "bg-slate-100 text-slate-600 hover:bg-slate-200",
    ghost: "hover:bg-slate-100 hover:text-slate-900"
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export const Input = ({ className = "", ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border-transparent bg-slate-50 px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`} {...props} />
);

export const Textarea = ({ className = "", ...props }: any) => (
  <textarea className={`flex min-h-[80px] w-full rounded-md border-transparent bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`} {...props} />
);

export const Label = ({ children, className = "", ...props }: any) => (
  <label className={`text-xs font-semibold uppercase tracking-wider text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
);
