"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      expand={false}
      richColors
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
          success:
            "group-[.toast]:bg-green-50 group-[.toast]:text-green-900 group-[.toast]:border-green-200",
          error:
            "group-[.toast]:bg-red-50 group-[.toast]:text-red-900 group-[.toast]:border-red-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
