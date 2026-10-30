import { AppNotification, Appointment } from '../types';

const STORAGE_KEY = 'nh_notifications_history';
const SETTINGS_KEY = 'nh_notifications_settings';

export interface NotificationSettings {
  soundEnabled: boolean;
  upcomingRemindersEnabled: boolean;
  scheduleChangesEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  upcomingRemindersEnabled: true,
  scheduleChangesEnabled: true,
};

// Obter configurações de notificação
export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Salvar configurações
export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Erro ao salvar configurações de notificação:', e);
  }
}

// Tocar chime luxuoso elegante usando Web Audio API
export function playNotificationChime(): void {
  const settings = getNotificationSettings();
  if (!settings.soundEnabled) return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;

    // Primeiro tom suave (D5 - 587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Segundo tom harmônico (A5 - 880 Hz) para efeito "sino de barbearia nobre"
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.08);
    gain2.gain.setValueAtTime(0.22, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn('Áudio de notificação não pôde ser reproduzido:', err);
  }
}

// Registrar o Service Worker de forma segura
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (err) {
    console.warn('Falha ao registrar Service Worker:', err);
    return null;
  }
}

// Obter status de permissão do navegador
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Solicitar permissão de notificações ao usuário
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Erro ao solicitar permissão de notificação:', err);
    return 'denied';
  }
}

// Obter histórico de notificações
export function getNotificationHistory(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Salvar notificação no histórico e despachar evento in-app
export function saveNotification(item: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
  const newNotification: AppNotification = {
    ...item,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  const history = getNotificationHistory();
  const updated = [newNotification, ...history].slice(0, 50); // manter até 50 no histórico

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Falha ao salvar no storage de notificações:', e);
  }

  // Notificar componentes em tempo real através de evento personalizado
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('nh:new-notification', { detail: newNotification })
    );
  }

  return newNotification;
}

// Marcar como lida
export function markNotificationAsRead(id: string): void {
  const history = getNotificationHistory();
  const updated = history.map((n) => (n.id === id ? { ...n, read: true } : n));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nh:notifications-updated'));
  } catch {}
}

// Marcar todas como lidas
export function markAllNotificationsAsRead(): void {
  const history = getNotificationHistory();
  const updated = history.map((n) => ({ ...n, read: true }));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('nh:notifications-updated'));
  } catch {}
}

// Limpar histórico
export function clearNotificationHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('nh:notifications-updated'));
  } catch {}
}

// Disparar notificação no navegador (Web Push / Service Worker / Notification API)
export async function sendBrowserPushNotification(
  title: string,
  options: NotificationOptions & { appointmentId?: string }
): Promise<boolean> {
  // 1. Tocar chime sonoro
  playNotificationChime();

  // 2. Verificar suporte
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  // 3. Se a permissão for concedida, exibir no navegador
  if (Notification.permission === 'granted') {
    try {
      // Tentar via Service Worker para melhor experiência push em background
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await (registration as any).showNotification(title, {
            icon: '/assets/barbers/marcos.jpg',
            badge: '/assets/barbers/marcos.jpg',
            vibrate: [200, 100, 200],
            ...options,
          });
          return true;
        }
      }
    } catch (swErr) {
      console.warn('Tentando fallback para new Notification:', swErr);
    }

    try {
      // Fallback para new Notification direto
      new Notification(title, {
        icon: '/assets/barbers/marcos.jpg',
        ...options,
      });
      return true;
    } catch (e) {
      console.warn('Erro ao disparar new Notification:', e);
    }
  }

  return false;
}

// Notificar agendamento próximo
export async function triggerUpcomingAppointmentAlert(
  appointment: Appointment,
  serviceName: string,
  barberName: string,
  minutesUntil?: number
): Promise<AppNotification> {
  const timeDesc = minutesUntil !== undefined
    ? `em aproximadamente ${minutesUntil} minutos (${appointment.time})`
    : `hoje às ${appointment.time}`;

  const title = '⏰ Seu horário na Navalha & Honra está próximo!';
  const message = `Olá ${appointment.clientName}, seu atendimento de ${serviceName} com o barbeiro ${barberName} está marcado para ${timeDesc}. Não se atrase!`;

  // Salvar no histórico
  const saved = saveNotification({
    title,
    message,
    type: 'upcoming',
    appointmentId: appointment.id,
    metadata: {
      clientName: appointment.clientName,
      serviceName,
      barberName,
      newTime: appointment.time,
      date: appointment.date,
    },
  });

  // Enviar push notification no navegador
  await sendBrowserPushNotification(title, {
    body: message,
    tag: `nh-upcoming-${appointment.id}`,
    data: { appointmentId: appointment.id },
  });

  return saved;
}

// Notificar alteração de horário confirmada pelo barbeiro
export async function triggerScheduleChangeAlert(
  appointment: Appointment,
  barberName: string,
  serviceName: string,
  oldTime: string,
  newTime: string,
  newDate?: string
): Promise<AppNotification> {
  const dateFormatted = newDate ? newDate.split('-').reverse().join('/') : appointment.date.split('-').reverse().join('/');
  const title = '✂️ Alteração de Horário Confirmada!';
  const message = `O barbeiro ${barberName} confirmou a alteração do seu agendamento de ${serviceName} para ${dateFormatted} às ${newTime} (horário anterior: ${oldTime}).`;

  // Salvar no histórico
  const saved = saveNotification({
    title,
    message,
    type: 'reschedule',
    appointmentId: appointment.id,
    metadata: {
      clientName: appointment.clientName,
      serviceName,
      barberName,
      oldTime,
      newTime,
      date: newDate || appointment.date,
    },
  });

  // Enviar push notification no navegador
  await sendBrowserPushNotification(title, {
    body: message,
    tag: `nh-reschedule-${appointment.id}-${Date.now()}`,
    data: { appointmentId: appointment.id },
  });

  return saved;
}

// Notificar confirmação ou mudança de status geral
export async function triggerStatusChangeAlert(
  appointment: Appointment,
  barberName: string,
  serviceName: string,
  newStatus: 'confirmed' | 'completed' | 'cancelled'
): Promise<AppNotification> {
  let title = '💈 Atualização no seu Agendamento';
  let message = `Seu horário de ${serviceName} com ${barberName} foi atualizado.`;

  if (newStatus === 'confirmed') {
    title = '✅ Agendamento Confirmado!';
    message = `Seu barbeiro ${barberName} confirmou sua sessão de ${serviceName} para o dia ${appointment.date.split('-').reverse().join('/')} às ${appointment.time}.`;
  } else if (newStatus === 'completed') {
    title = '⭐ Atendimento Concluído!';
    message = `Obrigado pela preferência, ${appointment.clientName}! Seus pontos de fidelidade foram creditados.`;
  } else if (newStatus === 'cancelled') {
    title = '⚠️ Agendamento Cancelado';
    message = `O agendamento #${appointment.id} de ${serviceName} foi cancelado. Entre em contato para reagendar.`;
  }

  const saved = saveNotification({
    title,
    message,
    type: 'status_change',
    appointmentId: appointment.id,
    metadata: {
      clientName: appointment.clientName,
      serviceName,
      barberName,
      newStatus,
      newTime: appointment.time,
      date: appointment.date,
    },
  });

  await sendBrowserPushNotification(title, {
    body: message,
    tag: `nh-status-${appointment.id}-${Date.now()}`,
    data: { appointmentId: appointment.id },
  });

  return saved;
}
