import React from 'react';
import { Scissors, Star, Clock, MapPin, Calendar, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onExploreServices,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-[#26262B]">
      {/* Background radial gradient decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-30">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna Texto / Conteúdo */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1C1C22] border border-[#2E2E36] text-xs text-[#D4AF37] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>Agendamento Online 24 Horas · Vagas em Tempo Real</span>
            </div>

            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F4F4EE] leading-[1.15] text-balance">
              Tradição em Cada Detalhe,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059]">
                Precisão em Cada Corte
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Descubra o padrão clássico da barbearia artesanal aliado à conveniência moderna.
              Escolha seu barbeiro, reserve seu horário sem ligações ou esperas no WhatsApp e
              sincronize tudo automaticamente no Google Calendar e Tasks.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#D4AF37] text-[#121215] font-semibold text-base hover:bg-[#E5C058] active:scale-[0.98] transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
              >
                <Scissors className="w-5 h-5" />
                <span>Agendar Atendimento</span>
              </button>
              <button
                onClick={onExploreServices}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#18181D] text-[#E4E4E7] border border-[#2E2E36] font-medium text-base hover:border-[#D4AF37]/50 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>Conhecer Serviços & Valores</span>
              </button>
            </div>

            {/* Quick Proof Badges */}
            <div className="pt-6 border-t border-[#222228] grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#1C1C22] text-[#D4AF37]">
                  <Star className="w-4 h-4 fill-[#D4AF37]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F4F4EE] tabular-nums">4.98 de 5.0</div>
                  <div className="text-xs text-[#71717A]">+1.200 avaliações</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#1C1C22] text-[#D4AF37]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F4F4EE]">Hora Marcada</div>
                  <div className="text-xs text-[#71717A]">Sem atrasos na cadeira</div>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#1C1C22] text-[#D4AF37]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F4F4EE]">Google Workspace</div>
                  <div className="text-xs text-[#71717A]">Calendar & Tasks integrados</div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Imagem / Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Moldura da imagem com borda dourada suave */}
              <div className="relative rounded-2xl overflow-hidden border border-[#2E2E38] shadow-2xl bg-[#18181D]">
                <img
                  src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1000&q=80"
                  alt="Barbeiro profissional cuidando de corte navalhado"
                  className="w-full h-[420px] object-cover filter brightness-[0.92] contrast-[1.05]"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent opacity-80" />

                {/* Floating Card: Próximo horário disponível */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#18181D]/90 backdrop-blur-md p-4 rounded-xl border border-[#2E2E38] shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#262630] flex items-center justify-center text-[#D4AF37]">
                        <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <div className="text-xs text-[#A1A1AA]">Disponibilidade de Hoje</div>
                        <div className="text-sm font-bold text-[#F4F4EE]">Marcos Silveira · 15:30</div>
                      </div>
                    </div>
                    <button
                      onClick={onOpenBooking}
                      className="px-3 py-1.5 text-xs font-semibold rounded bg-[#D4AF37] text-[#121215] hover:bg-[#E5C058] transition-colors"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>

              {/* Distintivo de Localização Nobre */}
              <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-2 bg-[#1C1C24] border border-[#2E2E38] rounded-lg px-3 py-2 shadow-lg text-xs text-[#E4E4E7]">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Rua Augusta, 1500 · Jardins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
