import React, { useState } from 'react';
import { Star, Calendar, Heart, Sparkles, Check } from 'lucide-react';
import { Barber } from '../types';

interface TeamSectionProps {
  barbers: Barber[];
  onSelectBarberToBook: (barber: Barber) => void;
  favoriteBarberIds?: string[];
  onToggleFavorite?: (barberId: string) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  barbers,
  onSelectBarberToBook,
  favoriteBarberIds,
  onToggleFavorite,
}) => {
  // Estado local com fallback para persistência em localStorage
  const [localFavorites, setLocalFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nh_barber_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const favorites = favoriteBarberIds ?? localFavorites;

  const handleToggle = (barberId: string) => {
    if (onToggleFavorite) {
      onToggleFavorite(barberId);
    } else {
      setLocalFavorites((prev) => {
        const next = prev.includes(barberId)
          ? prev.filter((id) => id !== barberId)
          : [...prev, barberId];
        try {
          localStorage.setItem('nh_barber_favorites', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  return (
    <section id="equipe" className="py-20 border-b border-[#26262B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1C22] border border-[#2E2E36] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              Nossos Mestres
            </span>
            {favorites.length > 0 && (
              <span className="text-[11px] text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full font-medium ml-1">
                ⭐ {favorites.length} {favorites.length === 1 ? 'favorito' : 'favoritos'}
              </span>
            )}
          </div>

          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#F4F4EE]">
            Especialistas em Visual & Barba
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] mt-3 leading-relaxed">
            Profissionais certificados internacionalmente, apaixonados pela arte da navalha.
            Marque seu barbeiro de preferência como favorito para encontrá-lo com destaque sempre que voltar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {barbers.map((barber) => {
            const isFav = favorites.includes(barber.id);

            return (
              <div
                key={barber.id}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  isFav
                    ? 'bg-gradient-to-b from-[#1E1E26] to-[#17171C] border-2 border-[#D4AF37] shadow-xl shadow-[#D4AF37]/10 ring-1 ring-[#D4AF37]/40 scale-[1.01]'
                    : 'bg-[#17171C] border border-[#272730] hover:border-[#D4AF37]/50'
                }`}
              >
                <div>
                  {/* Foto com Overlay e Botões */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#1E1E26]">
                    <img
                      src={barber.avatarUrl}
                      alt={barber.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-100 contrast-[1.02]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17171C] via-transparent to-transparent opacity-80" />

                    {/* Botão de Marcar / Desmarcar Favorito */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(barber.id);
                      }}
                      title={isFav ? 'Remover dos favoritos' : 'Marcar como barbeiro favorito'}
                      aria-label={isFav ? `Remover ${barber.name} dos favoritos` : `Marcar ${barber.name} como favorito`}
                      className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer ${
                        isFav
                          ? 'bg-[#D4AF37] text-[#121215] font-bold shadow-[#D4AF37]/40 ring-2 ring-[#FFF0B8]'
                          : 'bg-[#121215]/80 text-[#E4E4E7] hover:text-[#D4AF37] hover:bg-[#121215] border border-[#3A3A46]'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          isFav ? 'fill-[#121215] scale-110' : 'fill-transparent hover:scale-110'
                        }`}
                      />
                      <span className="text-[11px] tracking-tight">
                        {isFav ? 'Favorito' : 'Favoritar'}
                      </span>
                    </button>

                    {/* Avaliação das Estrelas */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#121215]/85 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold font-mono text-[#D4AF37] border border-[#D4AF37]/20">
                      <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
                      <span>{barber.rating.toFixed(2)}</span>
                    </div>

                    {/* Anos de Experiência */}
                    <div className="absolute bottom-3 left-4">
                      <div className="text-xs font-semibold text-[#D4AF37]">
                        {barber.experienceYears} Anos de Experiência
                      </div>
                    </div>
                  </div>

                  {/* Dados do Barbeiro */}
                  <div className="p-6">
                    {/* Selo de Destaque para Barbeiro Favorito */}
                    {isFav && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold mb-3 animate-fade-in">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                        <span>Seu Barbeiro de Preferência</span>
                        <Check className="w-3 h-3 text-[#D4AF37] ml-0.5" />
                      </div>
                    )}

                    <h3 className="font-serif-display text-xl font-bold text-[#F4F4EE] flex items-center justify-between">
                      <span>{barber.name}</span>
                      {isFav && <span className="text-base" title="Barbeiro Favorito">⭐</span>}
                    </h3>
                    <div className="text-xs text-[#A1A1AA] font-medium mt-0.5">
                      {barber.role}
                    </div>

                    <p className="text-xs sm:text-sm text-[#A1A1AA] mt-3 leading-relaxed">
                      {barber.bio}
                    </p>

                    <div className="mt-4 pt-4 border-t border-[#23232C]">
                      <div className="text-[11px] font-semibold text-[#8E8E98] uppercase tracking-wider mb-2">
                        Especialidades:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {barber.specialties.map((spec) => (
                          <span
                            key={spec}
                            className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                              isFav
                                ? 'bg-[#2A261A] text-[#F3E5AB] border-[#D4AF37]/30'
                                : 'bg-[#21212B] text-[#D4D4D8] border-[#2D2D3A]'
                            }`}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => onSelectBarberToBook(barber)}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFav
                        ? 'bg-[#D4AF37] hover:bg-[#E5C058] text-[#121215] font-bold shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]'
                        : 'bg-[#22222B] hover:bg-[#D4AF37] text-[#F4F4EE] hover:text-[#121215] border border-[#30303D] hover:border-[#D4AF37]'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>
                      {isFav
                        ? `Agendar com seu Favorito (${barber.name.split(' ')[0]})`
                        : `Agendar com ${barber.name.split(' ')[0]}`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
