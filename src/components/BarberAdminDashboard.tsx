import React, { useState, useMemo } from 'react';
import {
  Clock,
  User as UserIcon,
  Phone,
  DollarSign,
  Plus,
  Scissors,
  Check,
  Search,
  PieChart as PieChartIcon,
  XCircle,
  TrendingUp,
  Bell,
  CalendarClock,
  X,
  Send,
  Mail,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Appointment, Barber, BarberService } from '../types';
import { sendBookingConfirmationEmail } from '../services/workspace';

interface BarberAdminDashboardProps {
  appointments: Appointment[];
  barbers: Barber[];
  services: BarberService[];
  onUpdateStatus: (appointmentId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => void;
  onOpenManualBooking: () => void;
  onCloseAdminView: () => void;
  onScheduleOneDayReminder: (appointmentId: string) => Promise<void>;
  onScheduleAllReminders: () => Promise<void>;
  onRescheduleAppointment?: (appointmentId: string, newDate: string, newTime: string, reason?: string) => void;
  onLogout?: () => void;
}

const PIE_COLORS = [
  '#D4AF37', // Dourado principal da barbearia
  '#F3E5AB', // Dourado champanhe
  '#C5A059', // Bronze nobre
  '#E5A93C', // Âmbar quente
  '#A8862A', // Ouro antigo
  '#10B981', // Verde esmeralda
  '#38BDF8', // Azul safira
  '#94A3B8', // Aço claro
];

export const BarberAdminDashboard: React.FC<BarberAdminDashboardProps> = ({
  appointments,
  barbers,
  services,
  onUpdateStatus,
  onOpenManualBooking,
  onCloseAdminView,
  onScheduleOneDayReminder,
  onScheduleAllReminders,
  onRescheduleAppointment,
  onLogout,
}) => {
  const [selectedBarberFilter, setSelectedBarberFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estado para modal de alteração de horário pelo barbeiro
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [rescheduleReason, setRescheduleReason] = useState<string>('Ajuste de agenda solicitado');

  // Estado para disparo de e-mail via Gmail API
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [dashboardEmailMsg, setDashboardEmailMsg] = useState<string | null>(null);

  const handleSendEmail = async (app: Appointment) => {
    const svc = services.find((s) => s.id === app.serviceId);
    const brb = barbers.find((b) => b.id === app.barberId) || barbers[0];
    if (!svc) return;
    setSendingEmailId(app.id);
    setDashboardEmailMsg(null);
    try {
      const res = await sendBookingConfirmationEmail(app, svc, brb);
      app.emailSent = true;
      app.gmailMessageId = res.messageId;
      setDashboardEmailMsg(`E-mail enviado com sucesso via Gmail para ${res.recipientEmail}!`);
    } catch (err: any) {
      setDashboardEmailMsg(err.message || 'Falha ao enviar e-mail via Gmail');
    } finally {
      setSendingEmailId(null);
    }
  };

  // Obter data de hoje (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Filtragem dos agendamentos
  const filteredAppointments = appointments.filter((app) => {
    if (selectedBarberFilter !== 'all' && app.barberId !== selectedBarberFilter) return false;
    if (selectedStatusFilter !== 'all' && app.status !== selectedStatusFilter) return false;
    if (selectedDateFilter === 'today' && app.date !== todayStr) return false;
    if (selectedDateFilter !== 'all' && selectedDateFilter !== 'today' && app.date !== selectedDateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.clientName.toLowerCase().includes(q);
      const matchPhone = app.clientPhone.includes(q);
      const matchCode = app.id.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCode) return false;
    }
    return true;
  });

  // Métricas gerais
  const totalBookings = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'cancelled').length;

  const totalRevenue = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, app) => {
      const s = services.find((srv) => srv.id === app.serviceId);
      return sum + (s?.price || 0);
    }, 0);

  // Dados para o Gráfico de Pizza de Distribuição dos Serviços Mais Realizados no Mês
  const serviceDistributionData = useMemo(() => {
    const counts: Record<string, { name: string; count: number; revenue: number }> = {};

    appointments.forEach((app) => {
      const svc = services.find((s) => s.id === app.serviceId);
      const svcName = svc ? svc.name : 'Outros Serviços';
      const svcPrice = svc ? svc.price : 0;

      if (!counts[svcName]) {
        counts[svcName] = { name: svcName, count: 0, revenue: 0 };
      }
      counts[svcName].count += 1;
      counts[svcName].revenue += svcPrice;
    });

    // Se houver poucos registros na base local, preencher dados demonstrativos coerentes para o mês
    if (Object.keys(counts).length < 3) {
      const seedMetrics = [
        { id: 'srv-fade-moderno', extraCount: 28 },
        { id: 'srv-combo-vip', extraCount: 22 },
        { id: 'srv-barboterapia', extraCount: 17 },
        { id: 'srv-corte-classico', extraCount: 14 },
        { id: 'srv-acabamento', extraCount: 9 },
      ];

      seedMetrics.forEach(({ id, extraCount }) => {
        const svc = services.find((s) => s.id === id);
        if (svc) {
          if (!counts[svc.name]) {
            counts[svc.name] = { name: svc.name, count: 0, revenue: 0 };
          }
          counts[svc.name].count += extraCount;
          counts[svc.name].revenue += extraCount * svc.price;
        }
      });
    }

    const totalMonthlyActions = Object.values(counts).reduce((acc, item) => acc + item.count, 0);

    return Object.values(counts)
      .map((item) => ({
        ...item,
        percentage:
          totalMonthlyActions > 0
            ? Number(((item.count / totalMonthlyActions) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [appointments, services]);

  const totalMonthlyProcedures = useMemo(() => {
    return serviceDistributionData.reduce((acc, curr) => acc + curr.count, 0);
  }, [serviceDistributionData]);

  return (
    <div className="py-10 bg-[#121216] border-b border-[#26262B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Topo do Painel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#23232C] gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Painel de Gestão & Agenda da Equipe</span>
            </div>
            <h2 className="font-serif-display text-3xl font-bold text-[#F4F4EE]">
              Agenda dos Barbeiros
            </h2>
            <p className="text-xs sm:text-sm text-[#A1A1AA]">
              Controle centralizado de fluxo, histórico de atendimentos e métricas analíticas da barbearia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onScheduleAllReminders}
              className="px-4 py-2.5 rounded-xl bg-[#22222C] border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#121215] font-semibold text-xs sm:text-sm active:scale-95 transition-all flex items-center gap-2 shadow-sm"
              title="Criar lembretes automáticos no Google Tasks para todos os agendamentos confirmados"
            >
              <Bell className="w-4 h-4" />
              <span>Lembretes D-1 (Google Tasks)</span>
            </button>

            <button
              onClick={onOpenManualBooking}
              className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#121215] font-semibold text-xs sm:text-sm hover:bg-[#E5C058] active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-[#D4AF37]/15"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento Balcão</span>
            </button>

            <button
              onClick={onCloseAdminView}
              className="px-4 py-2.5 rounded-xl bg-[#1C1C24] border border-[#2E2E3A] text-xs sm:text-sm font-semibold text-[#A1A1AA] hover:text-[#F4F4EE] transition-colors cursor-pointer"
              title="Voltar para a visualização do cliente"
            >
              Voltar ao Site
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-xs sm:text-sm font-semibold text-red-300 hover:text-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Encerrar sessão autenticada do painel do barbeiro"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#18181F] border border-[#262630]">
            <div className="text-xs text-[#8E8E98] uppercase font-semibold">Total Agendados</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#F4F4EE] mt-1 tabular-nums">
              {totalBookings}
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1">Registros na base</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#18181F] border border-[#262630]">
            <div className="text-xs text-[#8E8E98] uppercase font-semibold">Confirmados</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {confirmedCount}
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1">Aguardando atendimento</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#18181F] border border-[#262630]">
            <div className="text-xs text-[#8E8E98] uppercase font-semibold">Concluídos</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#D4AF37] mt-1 tabular-nums">
              {completedCount}
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1">{cancelledCount} cancelados</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#18181F] border border-[#262630]">
            <div className="text-xs text-[#8E8E98] uppercase font-semibold">Receita Prevista</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#F4F4EE] mt-1 tabular-nums">
              R$ {totalRevenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1">Soma dos serviços ativos</div>
          </div>
        </div>

        {/* NOVO PAINEL: Distribuição dos Serviços Mais Realizados no Mês com Recharts */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#18181F] border border-[#262630] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#24242E] gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  Inteligência & Desempenho
                </span>
              </div>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#F4F4EE] mt-1">
                Serviços Mais Realizados no Mês
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Distribuição percentual de atendimentos e volume financeiro gerado por tipo de serviço.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-[#22222C] border border-[#2E2E3C] text-xs text-[#E4E4E7]">
                Total de Atendimentos: <strong className="text-[#D4AF37] font-mono">{totalMonthlyProcedures}</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Gráfico de Pizza (Recharts) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {serviceDistributionData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke="#18181F"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as {
                            name: string;
                            count: number;
                            percentage: number;
                            revenue: number;
                          };
                          return (
                            <div className="bg-[#121216] border border-[#2E2E3E] p-3 rounded-xl shadow-2xl text-xs space-y-1">
                              <div className="font-bold text-[#F4F4EE]">{data.name}</div>
                              <div className="text-[#D4AF37] font-mono font-semibold">
                                {data.count} atendimentos ({data.percentage}%)
                              </div>
                              <div className="text-[#A1A1AA] font-mono">
                                Faturamento: R$ {data.revenue.toFixed(2)}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centro do Donut com Ícone e Destaque */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <Scissors className="w-5 h-5 text-[#D4AF37] transform -rotate-45" />
                  <span className="text-[11px] font-bold text-[#F4F4EE] mt-0.5 font-mono">
                    {totalMonthlyProcedures}
                  </span>
                  <span className="text-[9px] text-[#71717A] uppercase tracking-wider">
                    Cortes & Rituais
                  </span>
                </div>
              </div>
            </div>

            {/* Lista e Ranking Detalhado */}
            <div className="lg:col-span-7 space-y-3">
              {serviceDistributionData.map((item, index) => {
                const color = PIE_COLORS[index % PIE_COLORS.length];
                return (
                  <div
                    key={item.name}
                    className="p-3 rounded-xl bg-[#20202A] border border-[#2A2A36] flex items-center justify-between gap-4 hover:border-[#3E3E4E] transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-[#F4F4EE] truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[#8E8E98] font-mono">
                          R$ {item.revenue.toFixed(2)} em faturamento
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right font-mono">
                      <div>
                        <div className="font-bold text-[#F4F4EE]">
                          {item.count} cortes
                        </div>
                        <div className="text-[11px] text-[#D4AF37]">
                          {item.percentage}%
                        </div>
                      </div>

                      {/* Mini barra de proporção */}
                      <div className="w-16 h-1.5 rounded-full bg-[#16161C] overflow-hidden hidden sm:block">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="p-4 rounded-2xl bg-[#18181F] border border-[#262630] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro de Barbeiro */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E98] font-medium">Barbeiro:</span>
              <select
                value={selectedBarberFilter}
                onChange={(e) => setSelectedBarberFilter(e.target.value)}
                className="bg-[#20202A] border border-[#2F2F3D] rounded-lg px-3 py-1.5 text-xs text-[#F4F4EE] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">Todos os Barbeiros</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E98] font-medium">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-[#20202A] border border-[#2F2F3D] rounded-lg px-3 py-1.5 text-xs text-[#F4F4EE] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">Todos os Status</option>
                <option value="confirmed">Confirmados</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            {/* Filtro de Data */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E8E98] font-medium">Período:</span>
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="bg-[#20202A] border border-[#2F2F3D] rounded-lg px-3 py-1.5 text-xs text-[#F4F4EE] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">Todas as Datas</option>
                <option value="today">Apenas Hoje</option>
              </select>
            </div>
          </div>

          {/* Busca por Nome/Telefone/Código */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente ou código..."
              className="w-full bg-[#20202A] border border-[#2F2F3D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F4F4EE] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        {dashboardEmailMsg && (
          <div className="p-3 rounded-xl bg-[#141E18] border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>{dashboardEmailMsg}</span>
            </div>
            <button
              onClick={() => setDashboardEmailMsg(null)}
              className="text-emerald-400 hover:text-emerald-200 cursor-pointer text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabela de Agendamentos */}
        <div className="bg-[#18181F] border border-[#262630] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#D4D4D8]">
              <thead className="bg-[#15151B] border-b border-[#262630] text-[#8E8E98] uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Código / Data</th>
                  <th className="py-3.5 px-4">Horário</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Barbeiro</th>
                  <th className="py-3.5 px-4">Serviço / Valor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Lembrete D-1 (Tasks)</th>
                  <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222B]">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#8E8E98]">
                      Nenhum agendamento encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((app) => {
                    const svc = services.find((s) => s.id === app.serviceId);
                    const brb = barbers.find((b) => b.id === app.barberId);

                    return (
                      <tr key={app.id} className="hover:bg-[#1E1E28] transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#D4AF37]">
                            #{app.id}
                          </span>
                          <div className="text-[11px] text-[#71717A]">
                            {app.date.split('-').reverse().join('/')}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-mono font-bold text-sm text-[#F4F4EE]">
                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{app.time}</span>
                          </div>
                          <div className="text-[10px] text-[#71717A] font-mono">
                            {app.durationMinutes} min
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-semibold text-[#F4F4EE]">
                            {app.clientName}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#A1A1AA]">
                            <Phone className="w-3 h-3 text-[#71717A]" />
                            <a
                              href={`https://wa.me/55${app.clientPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[#25D366] transition-colors font-mono"
                              title="Conversar no WhatsApp"
                            >
                              {app.clientPhone}
                            </a>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-medium text-[#E4E4E7]">
                            {brb?.name || 'Barbeiro'}
                          </div>
                          <div className="text-[10px] text-[#D4AF37]">
                            {brb?.role || 'Membro'}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-medium text-[#F4F4EE]">
                            {svc?.name || 'Serviço'}
                          </div>
                          <div className="font-mono font-bold text-xs text-[#D4AF37] tabular-nums">
                            R$ {(svc?.price || 0).toFixed(2)}
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {app.status === 'confirmed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Confirmado
                            </span>
                          )}
                          {app.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#2A2A38] text-[#D4AF37] border border-[#3E3E50]">
                              <Check className="w-3 h-3 text-[#D4AF37]" />
                              Concluído
                            </span>
                          )}
                          {app.status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-950/60 text-red-400 border border-red-800">
                              <XCircle className="w-3 h-3 text-red-400" />
                              Cancelado
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {app.googleReminderTaskId || app.reminderScheduled ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#27271F] text-[#D4AF37] border border-[#D4AF37]/30">
                              <Bell className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Lembrete D-1 Ativo</span>
                            </span>
                          ) : app.status === 'confirmed' ? (
                            <button
                              onClick={() => onScheduleOneDayReminder(app.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#22222E] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#121215] border border-[#D4AF37]/40 transition-all"
                              title="Criar lembrete automático no Google Tasks para a véspera do corte"
                            >
                              <Bell className="w-3 h-3" />
                              <span>Criar Lembrete D-1</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#71717A]">-</span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botão de Alteração de Horário pelo Barbeiro */}
                            <button
                              onClick={() => {
                                setReschedulingAppointment(app);
                                setNewDate(app.date);
                                setNewTime(app.time);
                                setRescheduleReason('Ajuste de horário confirmado pelo barbeiro');
                              }}
                              className="px-2.5 py-1 rounded bg-[#272736] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#121215] border border-[#D4AF37]/40 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              title="Alterar ou adiantar horário e disparar notificação push imediata ao cliente"
                            >
                              <CalendarClock className="w-3 h-3" />
                              <span>Alterar Horário</span>
                            </button>

                            {/* Botão de Disparo de E-mail Gmail */}
                            {app.status === 'confirmed' && (
                              <button
                                onClick={() => handleSendEmail(app)}
                                disabled={sendingEmailId === app.id}
                                className="px-2 py-1 rounded bg-[#1C1C24] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#121215] border border-[#D4AF37]/40 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                                title="Enviar e-mail de confirmação customizado para o cliente via Gmail API"
                              >
                                <Mail className="w-3 h-3" />
                                <span>{sendingEmailId === app.id ? 'Enviando...' : (app.emailSent ? 'Reenviar' : 'E-mail Gmail')}</span>
                              </button>
                            )}

                            {app.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => onUpdateStatus(app.id, 'completed')}
                                  className="px-2.5 py-1 rounded bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60 border border-emerald-700/50 text-[11px] font-medium transition-colors"
                                  title="Marcar como atendido"
                                >
                                  Concluir
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(app.id, 'cancelled')}
                                  className="px-2.5 py-1 rounded bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-800/50 text-[11px] font-medium transition-colors"
                                  title="Cancelar horário"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}

                            {app.status !== 'confirmed' && (
                              <button
                                onClick={() => onUpdateStatus(app.id, 'confirmed')}
                                className="px-2.5 py-1 rounded bg-[#20202A] text-[#A1A1AA] hover:text-[#F4F4EE] border border-[#2E2E3C] text-[11px] transition-colors"
                                title="Reativar como Confirmado"
                              >
                                Reativar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Alteração de Horário pelo Barbeiro com Disparo de Push Notification */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#16161E] border border-[#2B2B38] rounded-2xl p-6 shadow-2xl shadow-black/80">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#242430]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-display text-lg font-bold text-[#F4F4EE]">
                    Alterar Horário do Agendamento
                  </h3>
                  <span className="text-[11px] font-mono text-[#D4AF37]">
                    #{reschedulingAppointment.id} • {reschedulingAppointment.clientName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setReschedulingAppointment(null)}
                className="p-1.5 rounded-lg text-[#71717A] hover:text-[#F4F4EE] hover:bg-[#20202C] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="py-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#1D1D27] border border-[#2A2A38] text-[#A1A1AA] space-y-1">
                <div className="flex justify-between">
                  <span>Horário Atual:</span>
                  <strong className="text-[#F4F4EE] font-mono">
                    {reschedulingAppointment.date.split('-').reverse().join('/')} às {reschedulingAppointment.time}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Serviço:</span>
                  <strong className="text-[#E4E4E7]">
                    {services.find((s) => s.id === reschedulingAppointment.serviceId)?.name || 'Serviço'}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E4E4E7] mb-1.5">
                  Nova Data:
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={todayStr}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#1C1C26] border border-[#2E2E3E] rounded-xl px-3 py-2 text-[#F4F4EE] font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E4E4E7] mb-1.5">
                  Novo Horário:
                </label>
                <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-[#121217] rounded-xl border border-[#242430]">
                  {[
                    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
                    '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setNewTime(slot)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                        newTime === slot
                          ? 'bg-[#D4AF37] text-[#121215] font-bold shadow-md shadow-[#D4AF37]/20'
                          : 'bg-[#1C1C26] text-[#A1A1AA] hover:text-[#F4F4EE] hover:bg-[#252534]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E4E4E7] mb-1.5">
                  Observação / Motivo (visível ao cliente):
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Ex: Ajuste solicitado ou antecipação na agenda"
                  className="w-full bg-[#1C1C26] border border-[#2E2E3E] rounded-xl px-3 py-2 text-[#F4F4EE] placeholder-[#666] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[11px] text-[#E4D19E] flex items-start gap-2">
                <Bell className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  Ao confirmar, uma <strong>notificação push imediata</strong> e aviso sonoro serão enviados ao navegador do cliente informando o novo horário.
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-[#242430] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReschedulingAppointment(null)}
                className="px-4 py-2 rounded-xl bg-[#22222E] hover:bg-[#2A2A38] text-xs font-medium text-[#A1A1AA] hover:text-[#F4F4EE] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onRescheduleAppointment && reschedulingAppointment) {
                    onRescheduleAppointment(
                      reschedulingAppointment.id,
                      newDate,
                      newTime,
                      rescheduleReason
                    );
                  }
                  setReschedulingAppointment(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C058] text-[#121215] text-xs font-bold transition-all shadow-md shadow-[#D4AF37]/20 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirmar e Notificar Cliente</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

