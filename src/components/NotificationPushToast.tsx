import React, { useState, useEffect } from 'react';
import { Bell, X, Scissors, Clock, ArrowRight } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationPushToastProps {
  onOpenCenter: () => void;
}

export const NotificationPushToast: React.FC<NotificationPushToastProps> = ({ onOpenCenter }) => {
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    const handleNotification = (event: any) => {
      const notif: AppNotification = event.detail;
      if (notif) {
        setActiveToast(notif);
      }
    };

    window.addEventListener('nh:new-notification', handleNotification);
    return () => {
      window.removeEventListener('nh:new-notification', handleNotification);
    };
  }, []);

  // Auto-dismiss após 7 segundos
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  const isReschedule = activeToast.type === 'reschedule';
  const isUpcoming = activeToast.type === 'upcoming';

  return (
    <div className="fixed top-24 right-4 sm:right-6 z-50 max-w-sm w-full animate-slide-in pointer-events-auto">
      <div className="relative bg-[#1A1A24]/95 backdrop-blur-xl border border-[#D4AF37]/50 rounded-2xl p-4 shadow-2xl shadow-black/60 overflow-hidden ring-1 ring-white/10">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isReschedule
                ? 'bg-amber-500/20 border-amber-500/40 text-[#D4AF37]'
                : isUpcoming
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]'
            }`}
          >
            {isReschedule ? (
              <Scissors className="w-5 h-5" />
            ) : isUpcoming ? (
              <Clock className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-[#D4AF37]">
                Navalha & Honra • Push
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#F4F4EE] leading-tight">
              {activeToast.title}
            </h4>
            <p className="text-[11px] text-[#C4C4CC] mt-1 leading-snug line-clamp-3">
              {activeToast.message}
            </p>

            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveToast(null);
                  onOpenCenter();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37] hover:text-[#E5C058] transition-colors"
              >
                <span>Ver na Central</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="absolute top-3 right-3 p-1 rounded-lg text-[#71717A] hover:text-[#F4F4EE] hover:bg-[#262634] transition-colors"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
