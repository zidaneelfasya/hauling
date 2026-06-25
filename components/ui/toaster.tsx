"use client";

import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border pointer-events-auto transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            t.type === "success"
              ? "bg-emerald-950 border-emerald-800 text-emerald-100"
              : t.type === "error"
              ? "bg-rose-950 border-rose-800 text-rose-100"
              : t.type === "warning"
              ? "bg-amber-950 border-amber-800 text-amber-100"
              : "bg-slate-950 border-slate-800 text-slate-100"
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400" />}
            {t.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-400" />}
            {t.type === "info" && <Info className="h-5 w-5 text-sky-400" />}
          </div>
          <div className="flex-1">
            {t.title && <h4 className="font-semibold text-sm">{t.title}</h4>}
            <p className="text-xs opacity-90">{t.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
