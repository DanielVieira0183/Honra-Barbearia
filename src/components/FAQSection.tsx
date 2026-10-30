import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  HelpCircle,
  Calendar,
  Clock,
  Award,
  CreditCard,
  Bell,
  Search,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Scissors
} from 'lucide-react';

export interface FAQItem {
  id: string;
  category: 'agendamento' | 'atendimento' | 'fidelidade' | 'pagamentos';
  question: string;
  answer: string;
  highlights?: string[];
  actionLabel?: string;
  actionType?: 'booking' | 'profile' | 'team';
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'reschedule',
    category: 'agendamento',
    question: 'Como faço para reagendar ou cancelar meu horário?',
    answer:
      'Você pode reagendar ou cancelar seu agendamento de forma rápida e autônoma diretamente no painel do cliente (clicando no seu perfil ou na Central de Notificações). Também é possível entrar em contato com nossa equipe. Pedimos a gentileza de avisar com pelo menos 2 horas de antecedência para que outro cavalheiro possa aproveitar a vaga.',
    highlights: [
      'Reagendamento 100% online pelo perfil',
      'Avisar com até 2h de antecedência',
      'Notificação imediata da alteração enviada ao seu navegador'
    ],
    actionLabel: 'Ver Agendamentos no Perfil',
    actionType: 'profile'
  },
  {
    id: 'walk-ins',
    category: 'atendimento',
    question: 'Vocês atendem sem agendamento prévio (walk-ins)?',
    answer:
      'Sim, recebemos clientes sem horário marcado conforme a disponibilidade imediata da nossa bancada. No entanto, para evitar filas e garantir atendimento com o barbeiro da sua preferência no horário exato, recomendamos fortemente agendar previamente pelo nosso sistema online em menos de 1 minuto.',
    highlights: [
      'Atendimento sujeito a encaixe na fila de espera',
      'Agendamento online garante cadeira no horário pontual',
      'Acesso ao lounge com café espresso ou cerveja artesanal'
    ],
    actionLabel: 'Garantir Horário Agora',
    actionType: 'booking'
  },
  {
    id: 'loyalty-program',
    category: 'fidelidade',
    question: 'Como funciona o Clube de Fidelidade Navalha & Honra?',
    answer:
      'A cada corte, barba ou serviço realizado, você acumula pontos automaticamente na sua conta vinculada. Ao atingir 1.000 pontos, você pode resgatar um corte ou barboterapia premium 100% gratuito! Conforme você sobe de categoria (Membro Clássico, Cavalheiro Prata e Patrono Ouro VIP), você desbloqueia benefícios como prioridade na agenda, bebidas premium e descontos exclusivos em pomadas.',
    highlights: [
      '100 pontos garantidos a cada serviço',
      '1.000 pontos = Corte ou Barba grátis',
      'Acompanhe seu saldo em tempo real no menu do perfil'
    ],
    actionLabel: 'Consultar Meus Pontos',
    actionType: 'profile'
  },
  {
    id: 'reminders-push',
    category: 'agendamento',
    question: 'Como funcionam os lembretes automáticos e notificações push?',
    answer:
      'Ao agendar conosco, nosso sistema oferece confirmações e lembretes inteligentes: você recebe imediatamente um e-mail de confirmação customizado com o resumo completo e voucher de atendimento via Gmail API, além de alerta push no navegador 50 minutos antes e sincronização opcional com Google Calendar e Google Tasks (1 dia de antecedência).',
    highlights: [
      'E-mail de confirmação customizado oficial via Gmail',
      'Lembrete push automático no computador ou celular',
      'Integração com Google Calendar e Google Tasks (D-1)',
      'Histórico completo na Central de Notificações'
    ],
    actionLabel: 'Agendar com Lembrete',
    actionType: 'booking'
  },
  {
    id: 'payment-methods',
    category: 'pagamentos',
    question: 'Quais são as formas de pagamento aceitas?',
    answer:
      'Aceitamos pagamentos via Pix instantâneo, cartões de crédito e débito de todas as principais bandeiras (Visa, Mastercard, Elo, American Express), dinheiro em espécie e vouchers de resgate do Clube de Fidelidade. Pagamentos por Pix concedem pontos de fidelidade em dobro!',
    highlights: [
      'Pix instantâneo (pontos de fidelidade em dobro)',
      'Cartões de crédito (parcelamento disponível para combos) e débito',
      'Resgate de saldo do Clube de Fidelidade'
    ]
  },
  {
    id: 'arrival-time',
    category: 'atendimento',
    question: 'Com quanta antecedência devo chegar à barbearia?',
    answer:
      'Recomendamos chegar de 5 a 10 minutos antes do horário agendado. Dessa forma, você pode relaxar em nossas poltronas de couro, saborear um café espresso moído na hora ou uma cerveja gelada artesanal de cortesia enquanto o mestre barbeiro prepara a sua bancada higienizada.',
    highlights: [
      'Chegada recomendada: 5 a 10 minutos antes',
      'Bebida de boas-vindas cortesia no Lounge VIP',
      'Tolerância de atraso de até 10 minutos'
    ]
  },
  {
    id: 'choose-barber',
    category: 'atendimento',
    question: 'Posso escolher um barbeiro específico para o meu corte?',
    answer:
      'Com certeza! Cada um dos nossos mestres (Marcos "Navalha de Ouro", Diego "Fade Master" e André Rossi) possui especialidades distintas em visagismo, degradê e barboterapia tradicional. Durante o agendamento, você tem total liberdade para escolher o profissional da sua confiança.',
    highlights: [
      'Escolha livre no fluxo de agendamento online',
      'Consulte a bio e portfólio de cada barbeiro na seção Equipe',
      'Mesmo padrão de excelência em todas as cadeiras'
    ],
    actionLabel: 'Conhecer a Equipe',
    actionType: 'team'
  }
];

interface FAQSectionProps {
  onOpenBooking: () => void;
  onOpenProfile?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onOpenBooking,
  onOpenProfile
}) => {
  // Expandir primeiro item por padrão
  const [openIds, setOpenIds] = useState<string[]>(['reschedule']);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    setOpenIds(FAQ_DATA.map((item) => item.id));
  };

  const handleCollapseAll = () => {
    setOpenIds([]);
  };

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'todos' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.highlights?.some((h) => h.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categories = [
    { id: 'todos', label: 'Todas as Perguntas' },
    { id: 'agendamento', label: 'Agendamento & Prazos' },
    { id: 'atendimento', label: 'Atendimento & Chegada' },
    { id: 'fidelidade', label: 'Clube de Fidelidade' },
    { id: 'pagamentos', label: 'Pagamentos' }
  ];

  const handleAction = (type?: 'booking' | 'profile' | 'team') => {
    if (type === 'booking') {
      onOpenBooking();
    } else if (type === 'profile' && onOpenProfile) {
      onOpenProfile();
    } else if (type === 'team') {
      const el = document.getElementById('equipe');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="faq" className="py-20 border-b border-[#26262B] bg-[#121215]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header da Seção */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Tire Suas Dúvidas
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#F4F4EE]">
            Perguntas Frequentes
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] mt-3 leading-relaxed">
            Tudo o que você precisa saber sobre nossos agendamentos, cancelamentos, 
            atendimento sem hora marcada e o Clube de Fidelidade Navalha & Honra.
          </p>
        </div>

        {/* Barra de Busca e Filtro Rápido */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pergunta (ex: 'reagendar', 'walk-in', 'pontos', 'pagamento')..."
              className="w-full pl-11 pr-4 py-3 bg-[#18181D] border border-[#2B2B34] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl text-sm text-[#F4F4EE] placeholder-[#71717A] outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#A1A1AA] hover:text-[#F4F4EE] bg-[#22222A] px-2 py-0.5 rounded cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Categorias Pills + Toggle Todos */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#D4AF37] text-[#121215] font-semibold shadow-md shadow-[#D4AF37]/20'
                        : 'bg-[#18181D] hover:bg-[#202027] text-[#A1A1AA] hover:text-[#E4E4E7] border border-[#26262E]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#71717A]">
              <button
                onClick={handleExpandAll}
                className="hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Expandir tudo
              </button>
              <span>•</span>
              <button
                onClick={handleCollapseAll}
                className="hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Recolher
              </button>
            </div>
          </div>
        </div>

        {/* Lista Accordion */}
        <div className="space-y-3">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl bg-[#17171C] border border-[#272730]">
              <HelpCircle className="w-10 h-10 text-[#71717A] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#F4F4EE]">Nenhuma dúvida encontrada</p>
              <p className="text-xs text-[#71717A] mt-1">
                Tente buscar com outros termos ou limpe o filtro de categorias.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todos');
                }}
                className="mt-4 px-3.5 py-1.5 text-xs bg-[#24242D] hover:bg-[#2E2E39] text-[#D4AF37] rounded-lg transition-colors cursor-pointer"
              >
                Ver todas as perguntas
              </button>
            </div>
          ) : (
            filteredFAQs.map((faq) => {
              const isOpen = openIds.includes(faq.id);

              return (
                <div
                  key={faq.id}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-[#18181D] border-[#D4AF37]/40 shadow-lg shadow-black/30'
                      : 'bg-[#151519] border-[#25252D] hover:border-[#383844]'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isOpen
                            ? 'bg-[#D4AF37] text-[#121215]'
                            : 'bg-[#22222A] text-[#A1A1AA]'
                        }`}
                      >
                        {faq.category === 'agendamento' && <Calendar className="w-4 h-4" />}
                        {faq.category === 'atendimento' && <Clock className="w-4 h-4" />}
                        {faq.category === 'fidelidade' && <Award className="w-4 h-4" />}
                        {faq.category === 'pagamentos' && <CreditCard className="w-4 h-4" />}
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-[#F4F4EE] leading-snug">
                        {faq.question}
                      </span>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                        isOpen
                          ? 'border-[#D4AF37] text-[#D4AF37] rotate-180 bg-[#D4AF37]/10'
                          : 'border-[#2A2A35] text-[#71717A] bg-[#1A1A22]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Conteúdo Expandido com animação simples */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-[#A1A1AA] border-t border-[#23232C]/80 mt-1">
                      <p className="leading-relaxed mb-4">{faq.answer}</p>

                      {faq.highlights && faq.highlights.length > 0 && (
                        <div className="mb-4 bg-[#121215]/60 rounded-lg p-3.5 border border-[#23232A] space-y-2">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            Pontos Principais:
                          </div>
                          <ul className="space-y-1.5">
                            {faq.highlights.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-[#D4D4D8]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {faq.actionLabel && (
                        <button
                          onClick={() => handleAction(faq.actionType)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-xs font-semibold text-[#D4AF37] transition-all cursor-pointer"
                        >
                          {faq.actionLabel}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Card Rodapé de Suporte e Agendamento Direto */}
        <div className="mt-12 bg-gradient-to-r from-[#17171C] via-[#1D1D24] to-[#17171C] border border-[#2C2C36] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37]">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F4F4EE]">
                Ainda tem alguma dúvida especial?
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
                Nossa equipe está pronta para atendê-lo pelo WhatsApp ou agendar seu atendimento exclusivo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenBooking}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B08D23] hover:from-[#DFBE4E] hover:to-[#BFA034] text-[#121215] text-xs sm:text-sm font-bold shadow-md shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <Scissors className="w-4 h-4 transform -rotate-45" />
              Agendar Horário
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
