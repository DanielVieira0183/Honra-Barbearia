import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { Barber, BarberService, Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  barbers: Barber[];
  services: BarberService[];
  onAddReview: (review: Review) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  barbers,
  services,
  onAddReview,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [clientName, setClientName] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState(barbers[0]?.id || '');
  const [selectedServiceName, setSelectedServiceName] = useState(services[0]?.name || '');
  const [comment, setComment] = useState('');

  // Cálculo da média e distribuição
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !comment.trim()) return;

    const chosenBarber = barbers.find((b) => b.id === selectedBarberId) || barbers[0];

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      clientName: clientName.trim(),
      barberId: chosenBarber.id,
      barberName: chosenBarber.name,
      serviceName: selectedServiceName,
      rating: selectedRating,
      comment: comment.trim(),
      date: 'Hoje',
      verified: true,
    };

    onAddReview(newReview);
    setClientName('');
    setComment('');
    setIsModalOpen(false);
  };

  return (
    <section id="avaliacoes" className="py-20 border-b border-[#26262B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
              Opinião de Quem Confia
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#F4F4EE]">
              Avaliações dos Clientes
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 max-w-xl">
              Transparência total sobre a experiência, pontualidade e o talento de cada barbeiro da nossa equipe.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#121215] font-semibold text-xs sm:text-sm hover:bg-[#E5C058] active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/15"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Deixar Minha Avaliação</span>
          </button>
        </div>

        {/* Resumo de Notas (KPI Strip & Distribution) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 p-6 sm:p-8 rounded-2xl bg-[#17171C] border border-[#272730]">
          {/* Média Geral */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center lg:border-r lg:border-[#272730] pr-0 lg:pr-8">
            <div className="font-serif-display text-6xl font-bold font-mono text-[#F4F4EE] tabular-nums">
              {averageRating}
            </div>
            <div className="flex items-center gap-1 my-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(Number(averageRating))
                      ? 'fill-[#D4AF37] text-[#D4AF37]'
                      : 'text-[#3E3E4C]'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-[#8E8E98]">
              Baseado em <strong className="text-[#F4F4EE] font-mono">{totalReviews}</strong> avaliações reais
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% de clientes verificados</span>
            </div>
          </div>

          {/* Barras de Distribuição das Estrelas */}
          <div className="lg:col-span-8 flex flex-col justify-center space-y-2.5">
            {starCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 w-12 text-[#E4E4E7] shrink-0 font-mono">
                  <span>{star}</span>
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                </div>
                <div className="flex-1 h-2 rounded-full bg-[#24242E] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#C5A059] rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[#8E8E98] tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Avaliações em Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#17171C] border border-[#272730] rounded-2xl p-6 flex flex-col justify-between hover:border-[#383846] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= rev.rating
                            ? 'fill-[#D4AF37] text-[#D4AF37]'
                            : 'text-[#363644]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#71717A] font-mono">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#23232C]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-[#F4F4EE]">
                      <span>{rev.clientName}</span>
                      {rev.verified && (
                        <span title="Cliente verificado">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#8E8E98] mt-0.5">
                      Cortou com <strong className="text-[#D4AF37]">{rev.barberName}</strong>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] bg-[#22222B] px-2 py-1 rounded max-w-[110px] truncate text-right">
                    {rev.serviceName}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Deixar Nova Avaliação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181820] border border-[#2E2E3A] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#292934] mb-4">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#F4F4EE]">
                  Deixar Minha Avaliação
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Compartilhe sua experiência sobre o atendimento e o barbeiro.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#8E8E98] hover:text-[#F4F4EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seletor Interativo de 1 a 5 estrelas */}
              <div>
                <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
                  1. Sua Nota (1 a 5 Estrelas) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = (hoverRating ?? selectedRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setSelectedRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                        title={`${star} estrela${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            filled
                              ? 'fill-[#D4AF37] text-[#D4AF37]'
                              : 'text-[#3E3E4C]'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-sm font-bold font-mono text-[#F4F4EE] ml-2">
                    {hoverRating ?? selectedRating} de 5
                  </span>
                </div>
              </div>

              {/* Barbeiro Atendente */}
              <div>
                <label className="block text-xs font-medium text-[#E4E4E7] mb-1">
                  Qual barbeiro realizou seu atendimento? *
                </label>
                <select
                  value={selectedBarberId}
                  onChange={(e) => setSelectedBarberId(e.target.value)}
                  className="w-full bg-[#1A1A22] border border-[#2E2E38] rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#F4F4EE] focus:border-[#D4AF37] focus:outline-none"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Serviço Recebido */}
              <div>
                <label className="block text-xs font-medium text-[#E4E4E7] mb-1">
                  Qual serviço você realizou? *
                </label>
                <select
                  value={selectedServiceName}
                  onChange={(e) => setSelectedServiceName(e.target.value)}
                  className="w-full bg-[#1A1A22] border border-[#2E2E38] rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#F4F4EE] focus:border-[#D4AF37] focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nome do Cliente */}
              <div>
                <label className="block text-xs font-medium text-[#E4E4E7] mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Gustavo Silva"
                  className="w-full bg-[#1A1A22] border border-[#2E2E38] rounded-lg px-3 py-2.5 text-xs sm:text-sm text-[#F4F4EE] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {/* Comentário */}
              <div>
                <label className="block text-xs font-medium text-[#E4E4E7] mb-1">
                  Seu Comentário sobre o Atendimento e Resultado *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte o que achou da pontualidade, da precisão do corte, do ambiente..."
                  className="w-full bg-[#1A1A22] border border-[#2E2E38] rounded-lg px-3 py-2 text-xs sm:text-sm text-[#F4F4EE] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#8E8E98] hover:text-[#F4F4EE]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!clientName.trim() || !comment.trim()}
                  className="px-5 py-2.5 rounded-lg bg-[#D4AF37] text-[#121215] font-semibold text-xs sm:text-sm hover:bg-[#E5C058] disabled:opacity-50 transition-all shadow-md shadow-[#D4AF37]/20"
                >
                  Publicar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
