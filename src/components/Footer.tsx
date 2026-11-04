import React from 'react';
import { Scissors, Clock, MapPin, Phone, Instagram, Facebook, Calendar, Mail } from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking }) => {
  return (
    <footer id="contato" className="bg-[#0E0E12] border-t border-[#222228] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#202028]">
          {/* Coluna 1: Marca & Filosofia */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8E7422] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0E0E12] rounded-[7px] flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-[#D4AF37] transform -rotate-45" />
                </div>
              </div>
              <div>
                <span className="font-serif-display text-lg font-bold text-[#F4F4EE]">
                  Navalha & Honra
                </span>
                <div className="text-[10px] text-[#D4AF37] tracking-wider uppercase font-semibold">
                  Est. 2014
                </div>
              </div>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              O ponto de encontro do homem que aprecia o respeito à tradição clássica, pontualidade
              impecável e os melhores rituais de estética masculina de São Paulo.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#121215] font-semibold text-xs hover:bg-[#E5C058] transition-colors"
              >
                Agendar Horário Online
              </button>
            </div>
          </div>

          {/* Coluna 2: Horários de Atendimento */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Horário de Funcionamento</span>
            </div>
            <ul className="space-y-2 text-xs text-[#D4D4D8]">
              <li className="flex justify-between py-1 border-b border-[#1C1C22]">
                <span className="text-[#8E8E98]">Segunda a Sexta</span>
                <span className="font-mono font-medium">09:00 - 20:00</span>
              </li>
              <li className="flex justify-between py-1 border-b border-[#1C1C22]">
                <span className="text-[#8E8E98]">Sábado</span>
                <span className="font-mono font-medium">08:30 - 19:30</span>
              </li>
              <li className="flex justify-between py-1">
                <span className="text-[#8E8E98]">Domingo & Feriados</span>
                <span className="text-[#71717A]">Fechado para descanso</span>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Localização & Rotas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Nossa Barbearia</span>
            </div>
            <p className="text-xs text-[#D4D4D8] leading-relaxed">
              Rua Augusta, 1500 · Jardins<br />
              São Paulo - SP, 01412-100<br />
              <span className="text-[#71717A]">Estacionamento com manobrista no local</span>
            </p>
            <a
              href="https://maps.google.com/?q=Rua+Augusta+1500+Sao+Paulo"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline pt-1"
            >
              <span>Ver rota no Google Maps</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Coluna 4: Contatos & Social */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
              <Phone className="w-4 h-4" />
              <span>Contato & Dúvidas</span>
            </div>
            <ul className="space-y-2 text-xs text-[#D4D4D8]">
              <li>
                <a
                  href="https://wa.me/5561996324598"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-[#25D366] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#25D366]" />
                  <span>WhatsApp: (11) 99999-8888</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-[#A1A1AA]">
                <Mail className="w-3.5 h-3.5 text-[#71717A]" />
                <span>contato@navalhaehonra.com.br</span>
              </li>
            </ul>

            <div className="pt-2 flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#181820] text-[#A1A1AA] hover:text-[#E1306C] border border-[#242430] transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#181820] text-[#A1A1AA] hover:text-[#1877F2] border border-[#242430] transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Linha Inferior de Direitos */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A] gap-4">
          <div>
            © {new Date().getFullYear()} Navalha & Honra Barbearia Ltda. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-4">
            <a href="#servicos" className="hover:text-[#F4F4EE] transition-colors">
              Catálogo
            </a>
            <a href="#galeria" className="hover:text-[#F4F4EE] transition-colors">
              Galeria
            </a>
            <a href="#avaliacoes" className="hover:text-[#F4F4EE] transition-colors">
              Avaliações
            </a>
            <a href="#blog" className="hover:text-[#F4F4EE] transition-colors">
              Blog
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
