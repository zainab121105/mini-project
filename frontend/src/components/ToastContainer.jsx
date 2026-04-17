import React from 'react';
import { useToast } from '../context/ToastContext';

export default function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = "bg-slate-800 border-slate-700";
        let icon = "💬";
        
        if (toast.type === "success") {
          bgColor = "bg-emerald-600 border-emerald-500 shadow-emerald-900/20";
          icon = "✅";
        } else if (toast.type === "error") {
          bgColor = "bg-rose-600 border-rose-500 shadow-rose-900/20";
          icon = "❌";
        }

        return (
          <div 
            key={toast.id} 
            className={`min-w-64 max-w-sm flex items-center gap-3 px-5 py-3 rounded-2xl text-white shadow-2xl border pointer-events-auto transform duration-300 active:scale-95 ${bgColor}`}
          >
            <span className="text-lg">{icon}</span>
            <p className="text-sm font-semibold tracking-wide drop-shadow-md">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
