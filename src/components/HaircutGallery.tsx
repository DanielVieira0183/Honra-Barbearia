import React, { useState } from 'react';
import { Heart, Share2, Scissors, Check, Copy } from 'lucide-react';
import { GalleryItem } from '../types';

interface HaircutGalleryProps {
  galleryItems: GalleryItem[];
  onBookWithStyle: (item: GalleryItem) => void;
}

export const HaircutGallery: React.FC<HaircutGalleryProps> = ({
  galleryItems,
  onBookWithStyle,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [likesState, setLikesState] = useState<Record<string, number>>(
    galleryItems.reduce((acc, item) => ({ ...acc, [item.id]: item.likes }), {})
  );
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [shareItem, setShareItem] = useState<GalleryItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const filters = ['todos', 'Degradê Baixo', 'Barba Clássica', 'Corte Clássico', 'Degradê & Navalha'];

  const filteredItems =
    selectedFilter === 'todos'
      ? galleryItems
      : galleryItems.filter((item) =>
          item.style.toLowerCase().includes(selectedFilter.toLowerCase())
        );

  const handleLike = (id: string) => {
    setUserLiked((prev) => {
      const already = !!prev[id];
      setLikesState((curr) => ({
        ...curr,
        [id]: curr[id] + (already ? -1 : 1),
      }));
      return { ...prev, [id]: !already };
    });
  };

  const handleCopyLink = () => {
    if (!shareItem) return;
    const url = `${window.location.origin}/#galeria-${shareItem.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <section id="galeria" className="py-20 border-b border-[#26262B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
              Inspiração & Precisão
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#F4F4EE]">
              Galeria de Cortes & Estilos
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 max-w-xl">
              Navegue pelos trabalhos realizados por nossos mestres barbeiros. Escolha sua referência
              e agende para recriar o visual.
            </p>
          </div>

          {/* Filtros de Estilos */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#18181D] border border-[#2A2A32] rounded-xl self-start md:self-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all capitalize whitespace-nowrap ${
                  selectedFilter === filter
                    ? 'bg-[#D4AF37] text-[#121215] font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F4F4EE] hover:bg-[#22222A]'
                }`}
              >
                {filter === 'todos' ? 'Todos os Estilos' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Fotos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-[#17171C] rounded-2xl overflow-hidden border border-[#282832] hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Imagem com Overlay */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#1E1E26]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent opacity-80" />

                {/* Tag de Estilo */}
                <div className="absolute top-3 left-3 text-[11px] font-semibold text-[#D4AF37] bg-[#121215]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#D4AF37]/20">
                  {item.style}
                </div>

                {/* Curtida rápida */}
                <button
                  onClick={() => handleLike(item.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                    userLiked[item.id]
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-[#121215]/70 text-white hover:text-rose-400'
                  }`}
                  title="Curtir visual"
                >
                  <Heart
                    className={`w-4 h-4 ${userLiked[item.id] ? 'fill-rose-400 text-rose-400' : ''}`}
                  />
                </button>
              </div>

              {/* Detalhes e Ações */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8E8E98] mb-1.5">
                    <span>Barbeiro: <strong className="text-[#E4E4E7]">{item.barberName}</strong></span>
                    <span className="font-mono text-[#D4AF37]">{likesState[item.id]} curtidas</span>
                  </div>

                  <h3 className="font-bold text-base text-[#F4F4EE] group-hover:text-[#D4AF37] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#252530] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setShareItem(item)}
                    className="p-2 rounded-lg bg-[#202028] text-[#A1A1AA] hover:text-[#D4AF37] hover:bg-[#2A2A34] transition-colors text-xs flex items-center gap-1.5 border border-[#2E2E3A]"
                    title="Compartilhar corte"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartilhar</span>
                  </button>

                  <button
                    onClick={() => onBookWithStyle(item)}
                    className="px-3.5 py-2 rounded-lg bg-[#D4AF37] text-[#121215] font-semibold text-xs hover:bg-[#E5C058] active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Quero Este Corte</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Compartilhamento Social */}
      {shareItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181F] border border-[#2E2E3A] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h4 className="font-serif-display text-lg font-bold text-[#F4F4EE] mb-1">
              Compartilhar Estilo
            </h4>
            <p className="text-xs text-[#A1A1AA] mb-4">
              Envie a foto de &quot;{shareItem.title}&quot; para amigos ou salve sua inspiração:
            </p>

            <div className="space-y-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Olha esse corte de cabelo "${shareItem.title}" feito pelo barbeiro ${shareItem.barberName} na barbearia Navalha & Honra! ${window.location.origin}/#galeria`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] text-[#121215] font-bold text-xs hover:bg-[#20ba5a] transition-colors"
              >
                <span>Enviar pelo WhatsApp</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Incrível esse estilo "${shareItem.title}" na Navalha & Honra! #barbearia #estilomasculino`
                )}&url=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1DA1F2] text-white font-bold text-xs hover:bg-[#1a8cd8] transition-colors"
              >
                <span>Compartilhar no X / Twitter</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#242430] border border-[#343444] text-[#E4E4E7] font-semibold text-xs hover:bg-[#2F2F3E] transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copiado com Sucesso!' : 'Copiar Link Direto'}</span>
              </button>
            </div>

            <button
              onClick={() => setShareItem(null)}
              className="mt-5 w-full py-2 text-xs font-semibold text-[#8E8E98] hover:text-[#F4F4EE]"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
