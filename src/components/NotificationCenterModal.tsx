import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Scissors,
  Send,
  Sparkles,
} from 'lucide-react';
import { AppNotification, Appointment, Barber, BarberService } from '../types';
import {
  getNotificationHistory,
  getNotificationPermission,
  requestNotificationPermission,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotificationHistory,
  getNotificationSettings,
  saveNotificationSettings,
  playNotificationChime,
  triggerUpcomingAppointmentAlert,
  triggerScheduleChangeAlert,
} from '../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  barbers: Barber[];
  services: BarberService[];
  onOpenBooking: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  appointments,
  barbers,
  services,
  onOpenBooking,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Carregar histórico e permissão
  const refreshNotifications = () => {
    setNotifications(getNotificationHistory());
    setPermission(getNotificationPermission());
    const settings = getNotificationSettings();
    setSoundEnabled(settings.soundEnabled);
  };

  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleNew = () => refreshNotifications();
    window.addEventListener('nh:new-notification', handleNew);
    window.addEventListener('nh:notifications-updated', handleNew);
    return () => {
      window.removeEventListener('nh:new-notification', handleNew);
      window.removeEventListener('nh:notifications-updated', handleNew);
    };
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const res = await requestNotificationPermission();
      setPermission(res);
      playNotificationChime();
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    saveNotificationSettings({
      ...getNotificationSettings(),
      soundEnabled: next,
    });
    if (next) {
      playNotificationChime();
    }
  };

  // Testar alerta de horário próximo
  const handleTestUpcomingNotification = async () => {
    const targetApp = appointments.find((a) => a.status === 'confirmed') || appointments[0];
    if (targetApp) {
      const barber = barbers.find((b) => b.id === targetApp.barberId);
      const service = services.find((s) => s.id === targetApp.serviceId);
      await triggerUpcomingAppointmentAlert(
        targetApp,
        service?.name || 'Corte Imperial & Barba',
        barber?.name || 'Marcos Silveira',
        25
      );
    } else {
      // Dummy appointment
      const dummyApp: Appointment = {
        id: 'NH-TEST-1',
        serviceId: 'srv-1',
        barberId: 'barber-marcos',
        clientName: 'Você',
        clientPhone: '(11) 99999-9999',
        clientEmail: 'cliente@email.com',
        date: new Date().toISOString().split('T')[0],
        time: '15:30',
        durationMinutes: 45,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
      await triggerUpcomingAppointmentAlert(dummyApp, 'Corte Clássico Navalha', 'Marcos Silveira', 30);
    }
    refreshNotifications();
  };

  // Testar alerta de horário alterado pelo barbeiro
  const handleTestRescheduleNotification = async () => {
    const targetApp = appointments.find((a) => a.status === 'confirmed') || appointments[0];
    if (targetApp) {
      const barber = barbers.find((b) => b.id === targetApp.barberId);
      const service = services.find((s) => s.id === targetApp.serviceId);
      await triggerScheduleChangeAlert(
        targetApp,
        barber?.name || 'Diego Santos',
        service?.name || 'Barboterapia Tradicional',
        targetApp.time,
        '16:45',
        targetApp.date
      );
    } else {
      const dummyApp: Appointment = {
        id: 'NH-TEST-2',
        serviceId: 'srv-2',
        barberId: 'barber-diego',
        clientName: 'Você',
        clientPhone: '(11) 99999-9999',
        clientEmail: 'cliente@email.com',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        durationMinutes: 45,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      };
      await triggerScheduleChangeAlert(dummyApp, 'Diego Santos', 'Barba Terapia VIP', '14:00', '15:30');
    }
    refreshNotifications();
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);

      if (diffMin < 1) return 'Agora mesmo';
      if (diffMin < 60) return `Há ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Há ${diffHours} h`;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recentemente';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#141418] border border-[#272730] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#24242C] bg-[#181820]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display text-xl font-bold text-[#F4F4EE]">
                  Central de Notificações Push
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37] text-[#121215]">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Alertas em tempo real sobre proximidade de horário e confirmações dos barbeiros.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled
                  ? 'bg-[#22222C] text-[#D4AF37] border-[#D4AF37]/30 hover:bg-[#2A2A38]'
                  : 'bg-[#1C1C22] text-[#71717A] border-[#2E2E38] hover:text-[#A1A1AA]'
              }`}
              title={soundEnabled ? 'Silenciar avisos sonoros' : 'Ativar avisos sonoros (chime)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#8E8E98] hover:text-[#F4F4EE] hover:bg-[#202028] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Permission Banner */}
        <div className="p-4 bg-[#1A1A22] border-b border-[#24242C]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {permission === 'granted' ? (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : permission === 'denied' ? (
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#F4F4EE]">
                    Notificações no Navegador:
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      permission === 'granted'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                        : permission === 'denied'
                        ? 'bg-red-950/60 text-red-300 border border-red-800/80'
                        : 'bg-[#2E2E3C] text-[#D4AF37] border border-[#3E3E50]'
                    }`}
                  >
                    {permission === 'granted'
                      ? 'ATIVADAS ✓'
                      : permission === 'denied'
                      ? 'BLOQUEADAS'
                      : 'PENDENTE'}
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                  {permission === 'granted'
                    ? 'Seu navegador exibirá alertas flutuantes no desktop/celular mesmo com a aba em segundo plano.'
                    : permission === 'denied'
                    ? 'As notificações estão desativadas nas permissões do navegador. Avisos aparecerão no banner do app.'
                    : 'Permita as notificações para receber avisos imediatos quando seu barbeiro alterar a agenda.'}
                </p>
              </div>
            </div>

            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                disabled={isRequestingPermission}
                className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#D4AF37] text-[#121215] font-semibold text-xs hover:bg-[#E5C058] active:scale-95 transition-all shadow-md shadow-[#D4AF37]/15 disabled:opacity-50"
              >
                {isRequestingPermission ? 'Solicitando...' : 'Ativar no Navegador'}
              </button>
            )}
          </div>
        </div>

        {/* Quick Testing Bar & Filters */}
        <div className="px-6 py-3 bg-[#16161C] border-b border-[#24242C] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Test Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[#8E8E98] text-[11px] font-medium hidden sm:inline">Simular:</span>
            <button
              onClick={handleTestUpcomingNotification}
              className="px-2.5 py-1.5 rounded-lg bg-[#22222C] hover:bg-[#2A2A38] text-[#E4E4E7] border border-[#323240] hover:border-[#D4AF37]/50 text-[11px] font-medium transition-all flex items-center gap-1.5"
              title="Disparar notificação de horário de agendamento próximo"
            >
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Horário Próximo</span>
            </button>
            <button
              onClick={handleTestRescheduleNotification}
              className="px-2.5 py-1.5 rounded-lg bg-[#22222C] hover:bg-[#2A2A38] text-[#E4E4E7] border border-[#323240] hover:border-[#D4AF37]/50 text-[11px] font-medium transition-all flex items-center gap-1.5"
              title="Disparar notificação de confirmação de alteração pelo barbeiro"
            >
              <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Barbeiro Alterou</span>
            </button>
          </div>

          {/* Filtering & Bulk actions */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#1E1E26] p-0.5 rounded-lg border border-[#2B2B36]">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  filter === 'all' ? 'bg-[#D4AF37] text-[#121215]' : 'text-[#A1A1AA] hover:text-[#F4F4EE]'
                }`}
              >
                Todas ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  filter === 'unread' ? 'bg-[#D4AF37] text-[#121215]' : 'text-[#A1A1AA] hover:text-[#F4F4EE]'
                }`}
              >
                Não Lidas ({unreadCount})
              </button>
            </div>

            {notifications.length > 0 && (
              <>
                <button
                  onClick={() => markAllNotificationsAsRead()}
                  className="p-1.5 text-[#A1A1AA] hover:text-[#D4AF37] rounded hover:bg-[#22222C] transition-colors"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => clearNotificationHistory()}
                  className="p-1.5 text-[#A1A1AA] hover:text-red-400 rounded hover:bg-[#22222C] transition-colors"
                  title="Limpar histórico"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {displayedNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1C1C24] border border-[#292934] flex items-center justify-center text-[#71717A] mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm text-[#F4F4EE]">Nenhuma notificação por aqui</h4>
              <p className="text-xs text-[#8E8E98] max-w-xs mx-auto mt-1">
                Quando seu horário estiver próximo ou seu barbeiro confirmar uma alteração na agenda, você verá o aviso aqui.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={handleTestUpcomingNotification}
                  className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37]/25 transition-all"
                >
                  Testar Alerta Agora
                </button>
              </div>
            </div>
          ) : (
            displayedNotifications.map((notif) => {
              const isReschedule = notif.type === 'reschedule';
              const isUpcoming = notif.type === 'upcoming';

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-[#181820]/70 border-[#262630] hover:border-[#343440]'
                      : 'bg-[#1E1E28] border-[#D4AF37]/40 shadow-lg shadow-black/20 hover:border-[#D4AF37]/70'
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#D4AF37] ring-4 ring-[#D4AF37]/20" />
                  )}

                  <div className="flex items-start gap-3.5 pr-4">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isReschedule
                          ? 'bg-amber-500/15 border-amber-500/30 text-[#D4AF37]'
                          : isUpcoming
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                      }`}
                    >
                      {isReschedule ? (
                        <Scissors className="w-4 h-4" />
                      ) : isUpcoming ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#F4F4EE]">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[#71717A] font-mono">
                          {formatTimestamp(notif.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-[#D1D1D6] mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.metadata && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                          {notif.metadata.serviceName && (
                            <span className="px-2 py-0.5 rounded bg-[#252532] text-[#E4E4E7] border border-[#323242]">
                              {notif.metadata.serviceName}
                            </span>
                          )}
                          {notif.metadata.barberName && (
                            <span className="px-2 py-0.5 rounded bg-[#252532] text-[#D4AF37] border border-[#323242]">
                              Barbeiro: {notif.metadata.barberName}
                            </span>
                          )}
                          {notif.metadata.newTime && (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-mono font-semibold">
                              Horário: {notif.metadata.newTime}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#24242C] bg-[#16161E] flex items-center justify-between">
          <span className="text-[11px] text-[#8E8E98]">
            Notificações sincronizadas com navegador e dispositivos conectados.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#22222C] hover:bg-[#2A2A38] text-xs font-semibold text-[#E4E4E7] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
