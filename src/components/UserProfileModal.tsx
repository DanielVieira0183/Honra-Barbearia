import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Crown,
  Calendar,
  Clock,
  Phone,
  Scissors,
  LogOut,
  Gift,
  CheckCircle,
  AlertCircle,
  Mail,
  Smartphone,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Appointment, Barber, BarberService, LoyaltyAccount } from '../types';
import { LoyaltyPointsCard } from './LoyaltyPointsCard';
import { sendBookingConfirmationEmail } from '../services/workspace';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  loyalty: LoyaltyAccount;
  onRedeemFreeHaircut: () => void;
  onOpenBooking: () => void;
  onGoogleLogout: () => void;
  appointments: Appointment[];
  barbers: Barber[];
  services: BarberService[];
  onCancelAppointment: (id: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  loyalty,
  onRedeemFreeHaircut,
  onOpenBooking,
  onGoogleLogout,
  appointments,
  barbers,
  services,
  onCancelAppointment,
}) => {
  const [activeTab, setActiveTab] = useState<'loyalty' | 'appointments'>('loyalty');
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);

  const handleSendEmailFromProfile = async (app: Appointment, svc?: BarberService, brb?: Barber) => {
    if (!svc || !brb) return;
    setSendingEmailId(app.id);
    setEmailStatusMsg(null);
    try {
      const res = await sendBookingConfirmationEmail(app, svc, brb);
      setEmailStatusMsg(`E-mail de confirmação enviado para ${res.recipientEmail} via Gmail API com sucesso!`);
    } catch (err: any) {
      setEmailStatusMsg(err.message || 'Erro ao enviar e-mail via Gmail');
    } finally {
      setSendingEmailId(null);
    }
  };

  if (!isOpen) return null;

  // Filtrar agendamentos do usuário pelo e-mail ou nome
  const userEmail = user?.email?.toLowerCase() || '';
  const userName = user?.displayName?.toLowerCase() || '';

  const userAppointments = appointments.filter((app) => {
    if (userEmail && app.clientEmail?.toLowerCase() === userEmail) return true;
    if (userName && app.clientName?.toLowerCase().includes(userName.split(' ')[0])) return true;
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-[#17171C] border border-[#2D2D38] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Perfil do Usuário */}
        <div className="p-6 bg-[#131317] border-b border-[#262630] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Usuário'}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#242430] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <UserIcon className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#F4F4EE]">
                  {user?.displayName || 'Cliente Navalha & Honra'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>{loyalty.tier}</span>
                </span>
              </div>
              <p className="text-xs text-[#8E8E98] mt-0.5 font-mono">
                {user?.email || 'Conectado via Google Workspace'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E98] hover:text-[#F4F4EE] hover:bg-[#25252E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas: Clube de Fidelidade & Meus Agendamentos */}
        <div className="flex items-center border-b border-[#24242E] bg-[#15151B] px-6">
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'loyalty'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#8E8E98] hover:text-[#F4F4EE]'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Clube de Fidelidade & Pontos</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-mono">
              {loyalty.points} pts
            </span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#8E8E98] hover:text-[#F4F4EE]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Meus Agendamentos</span>
            {userAppointments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#272734] text-[#E4E4E7] text-[10px] font-mono">
                {userAppointments.length}
              </span>
            )}
          </button>
        </div>

        {/* Conteúdo da Aba */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'loyalty' ? (
            <LoyaltyPointsCard
              loyalty={loyalty}
              onRedeemFreeHaircut={onRedeemFreeHaircut}
              onOpenBooking={() => {
                onClose();
                onOpenBooking();
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#8E8E98] uppercase font-semibold">
                  Histórico de Atendimentos do Cliente
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#121215] text-xs font-semibold hover:bg-[#E5C058] transition-colors flex items-center gap-1.5"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Novo Agendamento</span>
                </button>
              </div>

              {emailStatusMsg && (
                <div className="p-3 rounded-lg bg-[#141E18] border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>{emailStatusMsg}</span>
                  </div>
                  <button
                    onClick={() => setEmailStatusMsg(null)}
                    className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {userAppointments.length === 0 ? (
                <div className="py-12 text-center bg-[#191922] border border-[#272734] rounded-2xl p-6">
                  <Calendar className="w-10 h-10 text-[#71717A] mx-auto mb-2" />
                  <div className="text-sm font-bold text-[#F4F4EE]">
                    Nenhum agendamento encontrado
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs mx-auto">
                    Você ainda não possui horários agendados com seu e-mail cadastrado.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBooking();
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-[#D4AF37] text-[#121215] text-xs font-semibold hover:bg-[#E5C058] transition-colors"
                  >
                    Agendar Primeiro Atendimento
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAppointments.map((app) => {
                    const svc = services.find((s) => s.id === app.serviceId);
                    const brb = barbers.find((b) => b.id === app.barberId);

                    return (
                      <div
                        key={app.id}
                        className="p-4 rounded-xl bg-[#1C1C24] border border-[#2B2B38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#D4AF37]">#{app.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                app.status === 'confirmed'
                                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                                  : app.status === 'completed'
                                  ? 'bg-[#292938] text-[#D4AF37]'
                                  : 'bg-red-950/60 text-red-400'
                              }`}
                            >
                              {app.status === 'confirmed'
                                ? 'Confirmado'
                                : app.status === 'completed'
                                ? 'Concluído'
                                : 'Cancelado'}
                            </span>
                          </div>

                          <div className="font-bold text-sm text-[#F4F4EE] mt-1">
                            {svc?.name || 'Serviço Barbearia'}
                          </div>

                          <div className="text-[11px] text-[#A1A1AA] mt-0.5 flex flex-wrap items-center gap-2">
                            <span>Barbeiro: <strong className="text-[#E4E4E7]">{brb?.name}</strong></span>
                            <span>·</span>
                            <span className="font-mono">
                              {app.date.split('-').reverse().join('/')} às {app.time}
                            </span>
                            <span>·</span>
                            <span className="font-mono text-[#D4AF37] font-semibold">
                              R$ {(svc?.price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {app.status === 'confirmed' && (
                            <button
                              onClick={() => handleSendEmailFromProfile(app, svc, brb)}
                              disabled={sendingEmailId === app.id}
                              title="Disparar e-mail de confirmação customizado via Gmail"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              <Mail className="w-3 h-3" />
                              <span>{sendingEmailId === app.id ? 'Enviando...' : (app.emailSent ? 'Reenviar E-mail' : 'Enviar E-mail')}</span>
                            </button>
                          )}

                          {app.status === 'confirmed' && (
                            <a
                              href={`https://wa.me/5511999998888?text=${encodeURIComponent(
                                `💈 *LEMBRETE DE AGENDAMENTO - NAVALHA & HONRA*\n\n` +
                                `Olá! Gostaria de confirmar e solicitar o lembrete da minha reserva:\n` +
                                `• *Código:* #${app.id}\n` +
                                `• *Cliente:* ${app.clientName}\n` +
                                `• *Serviço:* ${svc?.name} (${svc?.durationMinutes} min)\n` +
                                `• *Barbeiro:* ${brb?.name}\n` +
                                `• *Data:* ${app.date.split('-').reverse().join('/')} às ${app.time}\n` +
                                `• *Valor:* R$ ${(svc?.price || 0).toFixed(2)}\n` +
                                `• *Local:* Rua Augusta, 1500 · Jardins, São Paulo - SP`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Abrir WhatsApp com detalhes pré-formatados do agendamento"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Lembrete WhatsApp</span>
                            </a>
                          )}

                          {app.status === 'confirmed' && (
                            <a
                              href={`sms:+5511999998888?body=${encodeURIComponent(
                                `Navalha & Honra: Solicitacao de lembrete para reserva #${app.id}.\n` +
                                `Cliente: ${app.clientName}\n` +
                                `Servico: ${svc?.name || 'Serviço'}\n` +
                                `Barbeiro: ${brb?.name || 'Barbeiro'}\n` +
                                `Data: ${app.date.split('-').reverse().join('/')} as ${app.time}\n` +
                                `Local: Rua Augusta, 1500 - Jardins, SP.`
                              )}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8]/10 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Abrir aplicativo de SMS do dispositivo com mensagem pré-formatada"
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>Lembrete SMS</span>
                            </a>
                          )}

                          {app.status === 'confirmed' && (
                            <button
                              onClick={() => onCancelAppointment(app.id)}
                              className="px-3 py-1.5 rounded-lg border border-red-800/60 text-red-400 hover:bg-red-950/40 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer do Perfil */}
        <div className="p-4 bg-[#131317] border-t border-[#25252E] flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onGoogleLogout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Desconectar Conta Google</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#272734] text-[#E4E4E7] hover:bg-[#343444] font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
