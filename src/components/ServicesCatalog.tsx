import React, { useState, useMemo } from 'react';
import { Clock, Scissors, Share2, Search, X, Star } from 'lucide-react';
import { BarberService, ServiceCategory } from '../types';

interface ServicesCatalogProps {
  services: BarberService[];
  onSelectServiceToBook: (service: BarberService) => void;
  onShareService: (service: BarberService) => void;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({
  services,
  onSelectServiceToBook,
  onShareService,
}) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'favoritos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado dos serviços favoritos persistido no localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nh_barber_favorite_services');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (serviceId: string, serviceName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIds((prev) => {
      const isFav = prev.includes(serviceId);
      const next = isFav ? prev.filter((id) => id !== serviceId) : [serviceId, ...prev];
      try {
        localStorage.setItem('nh_barber_favorite_services', JSON.stringify(next));
      } catch (err) {
        console.warn('Erro ao salvar favoritos no localStorage:', err);
      }
      setToastMessage(
        isFav
          ? `"${serviceName}" removido dos favoritos`
          : `★ "${serviceName}" favoritado! Destacado no topo.`
      );
      setTimeout(() => setToastMessage(null), 3000);
      return next;
    });
  };

  const categories: { id: ServiceCategory | 'favoritos'; label: string }[] = [
    { id: 'todos', label: 'Todos os Serviços' },
    ...(favoriteIds.length > 0
      ? [{ id: 'favoritos' as const, label: `★ Favoritos (${favoriteIds.length})` }]
      : []),
    { id: 'corte', label: 'Cortes' },
    { id: 'barba', label: 'Barba & Rosto' },
    { id: 'combo', label: 'Combos VIP' },
    { id: 'acabamento', label: 'Acabamentos & Cuidados' },
  ];

  // Filtragem e ordenação: Serviços favoritados aparecem SEMPRE no topo da lista
  const filteredAndSortedServices = useMemo(() => {
    const list = services.filter((s) => {
      // Filtro especial de favoritos
      if (activeCategory === 'favoritos' && !favoriteIds.includes(s.id)) {
        return false;
      }
      // Filtro por categoria
      if (activeCategory !== 'todos' && activeCategory !== 'favoritos' && s.category !== activeCategory) {
        return false;
      }
      // Filtro por termo de busca no nome ou descrição
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = s.name.toLowerCase().includes(q);
        const matchDesc = s.description.toLowerCase().includes(q);
        return matchName || matchDesc;
      }
      return true;
    });

    // Ordenação: favoritos vêm primeiro no topo da lista
    return [...list].sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 1 : 0;
      const bFav = favoriteIds.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    });
  }, [services, activeCategory, searchQuery, favoriteIds]);

  return (
    <section id="servicos" className="py-20 border-b border-[#26262B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho de Seção */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
              Menu de Experiências & Rituais
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#F4F4EE]">
              Catálogo de Serviços
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 max-w-xl">
              Técnicas artesanais de corte, barboterapia com toalha quente e tratamentos capilares
              com transparência de tempo e valor.
            </p>
          </div>

          {/* Abas de Categorias */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#18181D] border border-[#2A2A32] rounded-xl self-start lg:self-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-[#D4AF37] text-[#121215] shadow-sm font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F4F4EE] hover:bg-[#22222A]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de Pesquisa de Serviços */}
        <div className="mb-10 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar serviço por nome ou descrição (ex: degradê, toalha quente, ozônio)..."
              className="w-full bg-[#18181E] border border-[#2A2A34] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#F4F4EE] placeholder-[#71717A] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 rounded-md text-[#71717A] hover:text-[#F4F4EE] hover:bg-[#252530] transition-colors"
                title="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="text-xs text-[#8E8E98] mt-2">
              Mostrando resultados para &ldquo;<strong className="text-[#D4AF37]">{searchQuery}</strong>&rdquo;
              {filteredAndSortedServices.length > 0 && ` (${filteredAndSortedServices.length} serviço${filteredAndSortedServices.length > 1 ? 's' : ''} encontrado${filteredAndSortedServices.length > 1 ? 's' : ''})`}
            </div>
          )}
        </div>

        {/* Notificação Toast Flutuante de Favoritos */}
        {toastMessage && (
          <div className="mb-6 p-3 rounded-xl bg-[#1D1B13] border border-[#D4AF37]/50 text-xs text-[#D4AF37] flex items-center justify-between shadow-lg shadow-black/40 animate-fade-in max-w-md">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-[#D4AF37]" />
              <span className="font-medium text-[#F4F4EE]">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#A1A1AA] hover:text-[#F4F4EE] ml-3 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Grid de Serviços */}
        {filteredAndSortedServices.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#17171C] border border-[#272730] rounded-2xl max-w-lg mx-auto">
            <Search className="w-10 h-10 text-[#71717A] mx-auto mb-3" />
            <h3 className="font-serif-display text-lg font-bold text-[#F4F4EE]">
              Nenhum serviço encontrado
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1.5 max-w-xs mx-auto">
              Não encontramos nenhum serviço correspondente a &ldquo;{searchQuery}&rdquo; na categoria selecionada.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('todos');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-[#24242E] text-[#D4AF37] border border-[#343442] hover:bg-[#2E2E3C] text-xs font-semibold transition-colors cursor-pointer"
            >
              Limpar filtros e ver todos os serviços
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedServices.map((service) => {
              const isFavorite = favoriteIds.includes(service.id);

              return (
                <div
                  key={service.id}
                  className={`group relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 ${
                    isFavorite
                      ? 'bg-gradient-to-b from-[#1E1C1F] via-[#1A1920] to-[#16161B] border-2 border-[#D4AF37]/60 shadow-lg shadow-[#D4AF37]/5 ring-1 ring-[#D4AF37]/20'
                      : 'bg-[#17171C] border border-[#272730] hover:border-[#D4AF37]/50'
                  }`}
                >
                  {/* Top-Right Badges & Botão de Favoritar */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                    {isFavorite && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#121215] bg-[#D4AF37] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-[#121215]" />
                        Destaque Favorito
                      </span>
                    )}

                    {service.badge && !isFavorite && (
                      <div className="text-[11px] font-semibold tracking-wider uppercase text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20">
                        {service.badge}
                      </div>
                    )}

                    {/* Botão de Favoritar Serviço com Tooltip */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(service.id, service.name, e)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isFavorite
                          ? 'bg-[#D4AF37] text-[#121215] border-[#D4AF37] shadow-sm hover:scale-105'
                          : 'bg-[#202027]/80 border-[#2E2E38] text-[#71717A] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#282834]'
                      }`}
                      title={isFavorite ? 'Remover dos favoritos' : 'Favoritar serviço (destaca no topo da lista)'}
                      aria-label={isFavorite ? `Remover ${service.name} dos favoritos` : `Favoritar ${service.name}`}
                    >
                      <Star className={`w-4 h-4 ${isFavorite ? 'fill-[#121215] text-[#121215]' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#8E8E98] mb-3">
                      <div className="flex items-center gap-1 text-[#A1A1AA]">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="tabular-nums font-mono">{service.durationMinutes} min</span>
                      </div>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{service.category}</span>
                      {isFavorite && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#D4AF37] font-semibold flex items-center gap-0.5">
                            ★ Seu Favorito
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#F4F4EE] group-hover:text-[#D4AF37] transition-colors pr-28">
                      {service.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#A1A1AA] mt-2.5 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#25252E] flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] text-[#71717A] uppercase font-semibold">Valor</div>
                      <div className="text-2xl font-bold font-mono tabular-nums text-[#F4F4EE]">
                        R$ {service.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onShareService(service)}
                        className="p-2.5 rounded-lg bg-[#202027] text-[#A1A1AA] hover:text-[#D4AF37] hover:bg-[#2A2A34] transition-colors border border-[#2E2E38] cursor-pointer"
                        title="Compartilhar este serviço"
                        aria-label={`Compartilhar ${service.name}`}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onSelectServiceToBook(service)}
                        className="px-4 py-2.5 rounded-lg bg-[#D4AF37] text-[#121215] font-semibold text-xs sm:text-sm hover:bg-[#E5C058] active:scale-95 transition-all shadow-md shadow-[#D4AF37]/10 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Agendar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
