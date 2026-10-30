import React from 'react';
import { Star, Scissors, Award, Calendar } from 'lucide-react';
import { Barber } from '../types';

interface TeamSectionProps {
  barbers: Barber[];
  onSelectBarberToBook: (barber: Barber) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  barbers,
  onSelectBarberToBook,
}) => {
  return (
    <section id="equipe" className="py-20 border-b border-[#26262B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
            Nossos Mestres
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#F4F4EE]">
            Especialistas em Visual & Barba
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] mt-3 leading-relaxed">
            Profissionais certificados internacionalmente, apaixonados pela arte da navalha e dedicados
            a realçar o que há de melhor em cada cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {barbers.map((barber) => (
            <div
              key={barber.id}
              className="group bg-[#17171C] border border-[#272730] rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Foto com Overlay */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#1E1E26]">
                  <img
                    src={barber.avatarUrl}
                    alt={barber.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-100 contrast-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17171C] via-transparent to-transparent opacity-75" />

                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#121215]/85 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold font-mono text-[#D4AF37] border border-[#D4AF37]/20">
                    <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
                    <span>{barber.rating.toFixed(2)}</span>
                  </div>

                  <div className="absolute bottom-3 left-4">
                    <div className="text-xs font-semibold text-[#D4AF37]">
                      {barber.experienceYears} Anos de Experiência
                    </div>
                  </div>
                </div>

                {/* Dados do Barbeiro */}
                <div className="p-6">
                  <h3 className="font-serif-display text-xl font-bold text-[#F4F4EE]">
                    {barber.name}
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
                          className="text-[11px] px-2 py-0.5 rounded bg-[#21212B] text-[#D4D4D8] border border-[#2D2D3A]"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-[#22222B] hover:bg-[#D4AF37] text-[#F4F4EE] hover:text-[#121215] font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-[#30303D] hover:border-[#D4AF37]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Agendar com {barber.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
