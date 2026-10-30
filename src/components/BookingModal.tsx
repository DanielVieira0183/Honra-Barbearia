import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  Phone,
  Mail,
  Scissors,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Appointment, Barber, BarberService } from '../types';
import {
  createCalendarEvent,
  createWorkspaceTask,
  createOneDayBeforeReminderTask,
  sendBookingConfirmationEmail,
} from '../services/workspace';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: BarberService[];
  barbers: Barber[];
  existingAppointments: Appointment[];
  onAddAppointment: (appointment: Appointment) => void;
  initialSelectedService?: BarberService | null;
  currentUser: User | null;
  onGoogleLogin: () => Promise<void>;
  isLoggingIn: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  barbers,
  existingAppointments,
  onAddAppointment,
  initialSelectedService,
  currentUser,
  onGoogleLogin,
  isLoggingIn,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedService, setSelectedService] = useState<BarberService | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Dados do cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Integração Google Workspace
  const [syncWithCalendar, setSyncWithCalendar] = useState(true);
  const [syncWithTasks, setSyncWithTasks] = useState(true);
  const [syncWithOneDayReminder, setSyncWithOneDayReminder] = useState(true);
  const [syncWithGmail, setSyncWithGmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [reminderInfo, setReminderInfo] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [calendarLink, setCalendarLink] = useState<string | null>(null);

  // Inicializar datas disponíveis (hoje + próximos 14 dias)
  const availableDates = React.useMemo(() => {
    const dates: { dateStr: string; displayDay: string; dayOfWeek: string; isToday: boolean }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const displayDay = `${d.getDate()}/${d.getMonth() + 1}`;
      dates.push({
        dateStr,
        displayDay,
        dayOfWeek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).replace('.', ''),
        isToday: i === 0,
      });
    }
    return dates;
  }, []);

  // Pre-seleção quando o modal abre
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedService) {
        setSelectedService(initialSelectedService);
        setStep(2);
      } else if (!selectedService) {
        setSelectedService(services[0] || null);
        setStep(1);
      }
      if (!selectedDate && availableDates.length > 0) {
        setSelectedDate(availableDates[0].dateStr);
      }
      if (currentUser) {
        if (!clientName && currentUser.displayName) setClientName(currentUser.displayName);
        if (!clientEmail && currentUser.email) setClientEmail(currentUser.email);
      }
    }
  }, [isOpen, initialSelectedService, currentUser, availableDates, services]);

  // Lista padrão de horários de funcionamento (09:00 até 19:30)
  const timeSlots = [
    '09:00', '09:45', '10:30', '11:15', '12:00',
    '13:00', '13:45', '14:30', '15:15', '16:00',
    '16:45', '17:30', '18:15', '19:00', '19:45'
  ];

  // Checar colisão de conflito de horários (item 3.2 do PDF de concepção)
  const isSlotUnavailable = (slotTime: string) => {
    if (!selectedBarber || !selectedDate) return false;
    return existingAppointments.some(
      (app) =>
        app.date === selectedDate &&
        app.time === slotTime &&
        app.status !== 'cancelled' &&
        (selectedBarber.id === 'any' ? false : app.barberId === selectedBarber.id)
    );
  };

  const handleNextStep = () => {
    if (step === 1 && selectedService) setStep(2);
    else if (step === 2 && selectedBarber) setStep(3);
    else if (step === 3 && selectedDate && selectedTime) setStep(4);
  };

  const handlePrevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;
    if (!clientName.trim() || !clientPhone.trim()) return;

    setIsSubmitting(true);
    setSyncMessage(null);

    const targetBarber =
      selectedBarber.id === 'any' ? barbers[0] : selectedBarber;

    const newAppointment: Appointment = {
      id: `NH-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: selectedService.id,
      barberId: targetBarber.id,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || 'cliente@email.com',
      date: selectedDate,
      time: selectedTime,
      durationMinutes: selectedService.durationMinutes,
      notes: notes.trim(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Tentativa de sincronização com Google Workspace caso o usuário esteja logado
    if (currentUser) {
      if (syncWithCalendar) {
        try {
          const calResult = await createCalendarEvent(newAppointment, selectedService, targetBarber);
          newAppointment.googleCalendarEventId = calResult.eventId;
          if (calResult.htmlLink) setCalendarLink(calResult.htmlLink);
          setSyncMessage('Sincronizado com sucesso com Google Calendar!');
        } catch (err: any) {
          console.warn('Aviso Calendar:', err);
        }
      }

      if (syncWithTasks) {
        try {
          const taskResult = await createWorkspaceTask(newAppointment, selectedService, targetBarber);
          newAppointment.googleTaskId = taskResult.taskId;
        } catch (err: any) {
          console.warn('Aviso Tasks:', err);
        }
      }

      if (syncWithOneDayReminder) {
        try {
          const reminderResult = await createOneDayBeforeReminderTask(newAppointment, selectedService, targetBarber);
          newAppointment.googleReminderTaskId = reminderResult.taskId;
          newAppointment.reminderScheduled = true;
          setReminderInfo(`Lembrete automático agendado no Google Tasks para a véspera (${reminderResult.reminderDateStr})`);
        } catch (err: any) {
          console.warn('Aviso Lembrete D-1 Tasks:', err);
        }
      }

      if (syncWithGmail) {
        try {
          const emailResult = await sendBookingConfirmationEmail(
            newAppointment,
            selectedService,
            targetBarber,
            { skipUserConfirm: false }
          );
          newAppointment.gmailMessageId = emailResult.messageId;
          newAppointment.emailSent = true;
          setEmailStatus(`E-mail de confirmação enviado para ${emailResult.recipientEmail} via Gmail API!`);
        } catch (err: any) {
          console.warn('Aviso Gmail:', err);
          setEmailError(err.message || 'Falha ao disparar e-mail de confirmação');
        }
      }
    }

    onAddAppointment(newAppointment);
    setCreatedAppointment(newAppointment);
    setIsSubmitting(false);
    setStep(5); // Tela de Sucesso
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[#17171C] border border-[#2D2D38] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Modal com Stepper */}
        <div className="px-6 py-4 border-b border-[#25252E] flex items-center justify-between bg-[#131317]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Scissors className="w-4 h-4 transform -rotate-45" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#F4F4EE]">
                {step === 5 ? 'Agendamento Confirmado' : 'Agendar Atendimento'}
              </h3>
              {step < 5 && (
                <div className="text-xs text-[#8E8E98]">
                  Passo {step} de 4 ·{' '}
                  {step === 1 && 'Escolha o Serviço'}
                  {step === 2 && 'Escolha o Barbeiro'}
                  {step === 3 && 'Escolha Data & Horário'}
                  {step === 4 && 'Confirme seus Dados'}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E98] hover:text-[#F4F4EE] hover:bg-[#25252E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso */}
        {step < 5 && (
          <div className="w-full bg-[#1F1F27] h-1">
            <div
              className="bg-[#D4AF37] h-1 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}

        {/* Conteúdo Dinâmico por Passo */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* PASSO 1: Seleção de Serviço */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-sm text-[#A1A1AA]">
                Selecione o corte, barba ou combo que você deseja realizar:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service) => {
                  const isSelected = selectedService?.id === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`cursor-pointer p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-sm'
                          : 'bg-[#1C1C22] border-[#292934] hover:border-[#3E3E4C]'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-semibold text-sm text-[#F4F4EE] leading-tight">
                          {service.name}
                        </div>
                        <div className="text-sm font-bold font-mono tabular-nums text-[#D4AF37] whitespace-nowrap">
                          R$ {service.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8E98]">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{service.durationMinutes} minutos</span>
                        {service.popular && (
                          <span className="text-[10px] text-[#D4AF37] font-semibold bg-[#D4AF37]/15 px-1.5 py-0.5 rounded">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#71717A] mt-2 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSO 2: Seleção de Barbeiro */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-sm text-[#A1A1AA]">
                Com qual dos nossos profissionais você deseja ser atendido?
              </div>

              {/* Opção Rápida: Qualquer barbeiro */}
              <div
                onClick={() =>
                  setSelectedBarber({
                    id: 'any',
                    name: 'Primeiro Barbeiro Disponível',
                    role: 'Menor tempo de espera',
                    experienceYears: 10,
                    avatarUrl: '',
                    specialties: ['Agilidade', 'Qualquer corte'],
                    bio: 'Sua reserva será atribuída ao profissional que tiver a vaga mais imediata.',
                    rating: 5.0,
                    reviewCount: 900,
                  })
                }
                className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${
                  selectedBarber?.id === 'any'
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]'
                    : 'bg-[#1C1C22] border-[#292934] hover:border-[#3E3E4C]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#262632] flex items-center justify-center text-[#D4AF37]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#F4F4EE]">
                      Primeiro Barbeiro Disponível
                    </div>
                    <div className="text-xs text-[#8E8E98]">
                      Ideal para quem procura rapidez e máxima flexibilidade de horário
                    </div>
                  </div>
                </div>
                {selectedBarber?.id === 'any' && (
                  <Check className="w-5 h-5 text-[#D4AF37]" />
                )}
              </div>

              {/* Barbeiros Fixos */}
              <div className="grid grid-cols-1 gap-3">
                {barbers.map((barber) => {
                  const isSelected = selectedBarber?.id === barber.id;
                  return (
                    <div
                      key={barber.id}
                      onClick={() => setSelectedBarber(barber)}
                      className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37]'
                          : 'bg-[#1C1C22] border-[#292934] hover:border-[#3E3E4C]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={barber.avatarUrl}
                          alt={barber.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#3E3E4C]"
                        />
                        <div>
                          <div className="font-bold text-sm text-[#F4F4EE]">
                            {barber.name}
                          </div>
                          <div className="text-xs text-[#D4AF37] font-medium">
                            {barber.role} · {barber.experienceYears} anos de exp.
                          </div>
                          <div className="text-xs text-[#8E8E98] mt-1">
                            {barber.specialties.slice(0, 2).join(' · ')}
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-5 h-5 text-[#D4AF37]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSO 3: Seleção de Data e Horário (Validação de Conflito em Tempo Real) */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Seletor de Data Horizontal */}
              <div>
                <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
                  1. Escolha o Dia
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {availableDates.map((item) => {
                    const isSelected = selectedDate === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(item.dateStr)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[70px] border transition-all ${
                          isSelected
                            ? 'bg-[#D4AF37] text-[#121215] border-[#D4AF37] font-bold shadow-md'
                            : 'bg-[#1C1C22] text-[#A1A1AA] border-[#2A2A34] hover:border-[#3E3E4C] hover:text-[#F4F4EE]'
                        }`}
                      >
                        <span className="text-[11px] uppercase">{item.dayOfWeek}</span>
                        <span className="text-base font-bold font-mono mt-0.5">
                          {item.displayDay.split('/')[0]}
                        </span>
                        <span className="text-[10px] opacity-80">
                          {item.isToday ? 'Hoje' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matriz de Horários com Bloqueio de Conflito */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                    2. Escolha o Horário Disponível
                  </label>
                  <div className="flex items-center gap-3 text-xs text-[#71717A]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1C1C22] border border-[#3E3E4C]" />
                      Livre
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-950/60 border border-red-800" />
                      Ocupado
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {timeSlots.map((time) => {
                    const unavailable = isSlotUnavailable(time);
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={unavailable}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2.5 px-2 rounded-lg font-mono text-xs sm:text-sm font-semibold transition-all border ${
                          unavailable
                            ? 'bg-[#181214] text-[#554045] border-[#331c22] cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-[#D4AF37] text-[#121215] border-[#D4AF37] shadow-md shadow-[#D4AF37]/20'
                            : 'bg-[#1C1C22] text-[#E4E4E7] border-[#2A2A34] hover:border-[#D4AF37]/50 hover:bg-[#25252F]'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>

                {selectedTime && (
                  <div className="mt-3 p-3 rounded-lg bg-[#1F1F28] border border-[#2F2F3B] flex items-center justify-between text-xs text-[#A1A1AA]">
                    <span>Horário escolhido:</span>
                    <span className="font-bold text-[#F4F4EE] font-mono text-sm">
                      {selectedDate.split('-').reverse().join('/')} às {selectedTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASSO 4: Identificação do Cliente e Conexão Google Workspace */}
          {step === 4 && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              {/* Resumo do que está sendo agendado */}
              <div className="p-4 rounded-xl bg-[#1C1C24] border border-[#2D2D3A] space-y-2">
                <div className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
                  Resumo da Reserva
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">Serviço:</span>
                  <span className="font-bold text-[#F4F4EE]">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">Barbeiro:</span>
                  <span className="font-bold text-[#F4F4EE]">
                    {selectedBarber?.id === 'any' ? 'Primeiro Disponível' : selectedBarber?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">Data & Horário:</span>
                  <span className="font-bold text-[#F4F4EE] font-mono">
                    {selectedDate.split('-').reverse().join('/')} às {selectedTime} ({selectedService?.durationMinutes} min)
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-[#2B2B38] pt-2">
                  <span className="text-[#A1A1AA]">Total a pagar no local:</span>
                  <span className="font-bold text-[#D4AF37] font-mono text-base">
                    R$ {selectedService?.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Campos do Cliente */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#E4E4E7] mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Carlos Oliveira"
                      className="w-full bg-[#1A1A20] border border-[#2E2E38] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F4F4EE] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1">
                      WhatsApp / Telefone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="w-full bg-[#1A1A20] border border-[#2E2E38] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F4F4EE] focus:border-[#D4AF37] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#E4E4E7] mb-1">
                      E-mail (Para confirmação)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-3" />
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="carlos@email.com"
                        className="w-full bg-[#1A1A20] border border-[#2E2E38] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F4F4EE] focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                    Observações ou Preferências (Opcional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Não passar lâmina na nuca, pele muito sensível"
                    className="w-full bg-[#1A1A20] border border-[#2E2E38] rounded-lg px-3 py-2 text-xs text-[#F4F4EE] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Sincronização Google Workspace (Calendar & Tasks) */}
              <div className="p-4 rounded-xl bg-[#141419] border border-[#292934] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs font-bold text-[#F4F4EE]">
                      Google Workspace Sync
                    </span>
                  </div>
                  {currentUser ? (
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Conectado como {currentUser.displayName?.split(' ')[0]}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={onGoogleLogin}
                      disabled={isLoggingIn}
                      className="text-[11px] text-[#D4AF37] hover:underline font-semibold"
                    >
                      {isLoggingIn ? 'Conectando...' : 'Entrar com Google'}
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs text-[#A1A1AA]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncWithCalendar}
                      onChange={(e) => setSyncWithCalendar(e.target.checked)}
                      className="rounded accent-[#D4AF37] w-4 h-4"
                    />
                    <span>Salvar evento automaticamente no Google Calendar</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncWithTasks}
                      onChange={(e) => setSyncWithTasks(e.target.checked)}
                      className="rounded accent-[#D4AF37] w-4 h-4"
                    />
                    <span>Criar tarefa de atendimento no Google Tasks</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#F4F4EE]">
                    <input
                      type="checkbox"
                      checked={syncWithOneDayReminder}
                      onChange={(e) => setSyncWithOneDayReminder(e.target.checked)}
                      className="rounded accent-[#D4AF37] w-4 h-4"
                    />
                    <span className="font-medium text-[#D4AF37]">
                      Criar lembrete automático 1 dia antes no Google Tasks (véspera às 09:00)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-[#F4F4EE]">
                    <input
                      type="checkbox"
                      checked={syncWithGmail}
                      onChange={(e) => setSyncWithGmail(e.target.checked)}
                      className="rounded accent-[#D4AF37] w-4 h-4"
                    />
                    <span className="font-medium text-[#F4F4EE] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Disparar e-mail de confirmação customizado via Gmail API para o cliente
                    </span>
                  </label>
                </div>
              </div>

              {/* Botões de Ação do Passo 4 */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 rounded-lg border border-[#2E2E38] text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4EE]"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !clientName.trim() || !clientPhone.trim()}
                  className="px-6 py-2.5 rounded-lg bg-[#D4AF37] text-[#121215] font-semibold text-sm hover:bg-[#E5C058] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Confirmando Agendamento...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar Reserva</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASSO 5: Confirmação e Sucesso */}
          {step === 5 && createdAppointment && (
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-serif-display text-2xl font-bold text-[#F4F4EE]">
                  Horário Reservado com Sucesso!
                </h4>
                <p className="text-sm text-[#A1A1AA] mt-1">
                  Seu código de agendamento é{' '}
                  <span className="font-mono font-bold text-[#D4AF37]">
                    #{createdAppointment.id}
                  </span>
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-[#1C1C24] border border-[#2A2A36] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#8E8E98]">Cliente:</span>
                  <span className="font-semibold text-[#F4F4EE]">{createdAppointment.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E98]">Serviço:</span>
                  <span className="font-semibold text-[#F4F4EE]">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E98]">Barbeiro:</span>
                  <span className="font-semibold text-[#F4F4EE]">
                    {barbers.find((b) => b.id === createdAppointment.barberId)?.name || 'Barbeiro Confirmado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E98]">Data e Horário:</span>
                  <span className="font-bold text-[#D4AF37] font-mono">
                    {createdAppointment.date.split('-').reverse().join('/')} às {createdAppointment.time}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#2A2A36] pt-2">
                  <span className="text-[#8E8E98]">Endereço:</span>
                  <span className="text-[#F4F4EE]">Rua Augusta, 1500 · Jardins</span>
                </div>
              </div>

              {syncMessage && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>{syncMessage}</span>
                </div>
              )}

              {reminderInfo && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-xs text-[#F4F4EE]">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{reminderInfo}</span>
                </div>
              )}

              {emailStatus && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{emailStatus}</span>
                </div>
              )}

              {emailError && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800 text-xs text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{emailError}</span>
                </div>
              )}

              {/* Botão de reenvio / envio de confirmação via Gmail se necessário */}
              {currentUser && selectedService && (
                <div>
                  <button
                    type="button"
                    disabled={isResendingEmail}
                    onClick={async () => {
                      setIsResendingEmail(true);
                      setEmailError(null);
                      try {
                        const targetBarber = selectedBarber?.id === 'any' ? barbers[0] : (selectedBarber || barbers[0]);
                        const res = await sendBookingConfirmationEmail(createdAppointment, selectedService, targetBarber);
                        setEmailStatus(`E-mail reenviado para ${res.recipientEmail} via Gmail com sucesso!`);
                      } catch (err: any) {
                        setEmailError(err.message || 'Erro ao enviar e-mail via Gmail');
                      } finally {
                        setIsResendingEmail(false);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1C1C24] hover:bg-[#252530] border border-[#2D2D3A] text-xs text-[#D4AF37] transition-all cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isResendingEmail ? 'Disparando...' : 'Reenviar E-mail de Confirmação (Gmail)'}</span>
                  </button>
                </div>
              )}

              {calendarLink && (
                <div>
                  <a
                    href={calendarLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#D4AF37] hover:underline"
                  >
                    <span>Abrir evento no Google Calendar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/5511999998888?text=Ol%C3%A1!%20Acabei%20de%20agendar%20o%20servi%C3%A7o%20${encodeURIComponent(
                    selectedService?.name || ''
                  )}%20para%20o%20dia%20${createdAppointment.date}%20%C3%A0s%20${createdAppointment.time}%20(C%C3%B3digo%20${createdAppointment.id}).`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#25D366] text-[#121215] font-bold text-xs hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Salvar Comprovante no WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#272732] text-[#F4F4EE] text-xs font-semibold hover:bg-[#343442] transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer dos Passos 1 a 3 */}
        {step < 4 && (
          <div className="px-6 py-4 border-t border-[#25252E] flex items-center justify-between bg-[#131317]">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 rounded-lg border border-[#2E2E38] text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4EE] flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={
                (step === 1 && !selectedService) ||
                (step === 2 && !selectedBarber) ||
                (step === 3 && (!selectedDate || !selectedTime))
              }
              onClick={handleNextStep}
              className="px-5 py-2 rounded-lg bg-[#D4AF37] text-[#121215] text-xs font-semibold hover:bg-[#E5C058] disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <span>Continuar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
