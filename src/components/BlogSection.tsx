import React, { useState } from 'react';
import { BookOpen, Clock, ArrowRight, X, Scissors, User as UserIcon } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogSectionProps {
  posts: BlogPost[];
  onBookFromArticle: (serviceId: string) => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  posts,
  onBookFromArticle,
}) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="py-20 border-b border-[#26262B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
              Conhecimento & Estilo
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#F4F4EE]">
              Blog Navalha & Honra
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 max-w-xl">
              Artigos, dicas de especialistas e tendências para você manter o cabelo e a barba impecáveis
              entre uma visita e outra.
            </p>
          </div>
        </div>

        {/* Grid dos 3 Artigos Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="cursor-pointer group flex flex-col justify-between bg-[#17171C] border border-[#272730] hover:border-[#D4AF37]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/50"
            >
              <div>
                {/* Imagem de Capa */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1E1E26]">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 text-[11px] font-semibold text-[#D4AF37] bg-[#121215]/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#D4AF37]/20">
                    {post.category}
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-[#8E8E98] mb-2.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{post.readTime} de leitura</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.date}</span>
                  </div>

                  <h3 className="font-serif-display text-xl font-bold text-[#F4F4EE] group-hover:text-[#D4AF37] transition-colors leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#A1A1AA] mt-3 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Autor & CTA */}
              <div className="p-6 pt-0 border-t border-[#23232C] mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 pt-4">
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-8 h-8 rounded-full object-cover border border-[#3E3E4C]"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#E4E4E7]">{post.author}</div>
                    <div className="text-[10px] text-[#71717A]">{post.authorRole}</div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                  <span>Ler artigo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Modal Leitor de Artigo Completo */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="relative bg-[#17171C] border border-[#2E2E3A] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Imagem de Capa do Modal */}
            <div className="relative h-56 sm:h-64 overflow-hidden shrink-0">
              <img
                src={selectedPost.coverImage}
                alt={selectedPost.title}
                className="w-full h-full object-cover filter brightness-[0.85]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17171C] via-[#17171C]/40 to-transparent" />

              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title="Fechar artigo"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider bg-[#121215]/80 px-2.5 py-1 rounded border border-[#D4AF37]/30">
                  {selectedPost.category}
                </span>
                <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-white mt-2 leading-tight">
                  {selectedPost.title}
                </h3>
              </div>
            </div>

            {/* Corpo do Artigo */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1">
              {/* Autor info bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#252530] text-xs text-[#8E8E98]">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPost.authorAvatar}
                    alt={selectedPost.author}
                    className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/40"
                  />
                  <div>
                    <div className="font-bold text-sm text-[#F4F4EE]">{selectedPost.author}</div>
                    <div className="text-[#A1A1AA]">{selectedPost.authorRole}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div>{selectedPost.date}</div>
                  <div className="text-[#D4AF37] font-medium">{selectedPost.readTime}</div>
                </div>
              </div>

              {/* Parágrafos de Conteúdo */}
              <div className="space-y-4 text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Tags do post */}
              <div className="pt-4 flex flex-wrap gap-2">
                {selectedPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded bg-[#202028] text-[#A1A1AA] border border-[#2B2B38]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Box de Ação Direta no final do Artigo */}
              <div className="mt-6 p-5 rounded-xl bg-[#1C1C24] border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-[#F4F4EE]">
                    Gostou das dicas do especialista?
                  </div>
                  <div className="text-xs text-[#A1A1AA] mt-0.5">
                    Agende seu horário com nossos mestres barbeiros e coloque seu visual em dia.
                  </div>
                </div>

                <button
                  onClick={() => {
                    const svcId = selectedPost.relatedServiceId;
                    setSelectedPost(null);
                    onBookFromArticle(svcId);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#D4AF37] text-[#121215] font-semibold text-xs sm:text-sm hover:bg-[#E5C058] active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Scissors className="w-4 h-4" />
                  <span>Agendar Atendimento</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
