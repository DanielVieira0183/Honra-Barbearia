import React from 'react';
import { Heart, MessageCircle, Instagram, Facebook, Phone, ExternalLink } from 'lucide-react';
import { SocialPost } from '../types';

interface SocialFeedSectionProps {
  posts: SocialPost[];
}

export const SocialFeedSection: React.FC<SocialFeedSectionProps> = ({ posts }) => {
  return (
    <section className="py-20 border-b border-[#26262B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
              Conecte-se Conosco
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#F4F4EE]">
              Nosso Feed no Instagram & Redes
            </h2>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 max-w-xl">
              Acompanhe a rotina da barbearia, lançamentos de estilos exclusivos e transformações diárias.
              Siga nosso perfil oficial <strong>@navalhaehonra</strong>.
            </p>
          </div>

          {/* Links Sociais Principais */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202028] border border-[#2D2D38] hover:border-[#E1306C] text-[#E4E4E7] hover:text-[#E1306C] text-xs font-semibold transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span>@navalhaehonra</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202028] border border-[#2D2D38] hover:border-[#1877F2] text-[#E4E4E7] hover:text-[#1877F2] text-xs font-semibold transition-colors"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="https://wa.me/5511999998888"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202028] border border-[#2D2D38] hover:border-[#25D366] text-[#E4E4E7] hover:text-[#25D366] text-xs font-semibold transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Grid do Feed Social */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative bg-[#17171C] border border-[#262630] rounded-2xl overflow-hidden hover:border-[#D4AF37]/40 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Foto do Post */}
              <div className="relative aspect-square overflow-hidden bg-[#1E1E26]">
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="flex items-center gap-4 text-white text-xs font-bold font-mono">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-white" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      {post.comments}
                    </span>
                  </div>
                </div>

                <div className="absolute top-3 left-3 bg-[#121215]/85 backdrop-blur-md px-2.5 py-0.5 rounded text-[11px] font-semibold text-[#D4AF37] border border-[#D4AF37]/20">
                  {post.serviceTag}
                </div>
              </div>

              {/* Legenda & Metadata */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-[#D4D4D8] line-clamp-2 leading-relaxed">
                  {post.caption}
                </p>

                <div className="pt-3 mt-3 border-t border-[#23232C] flex items-center justify-between text-[11px] text-[#71717A]">
                  <span className="flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-[#E1306C]" />
                    <span>Instagram</span>
                  </span>
                  <span>{post.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
