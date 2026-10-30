import React, { useState } from 'react';
import {
  Award,
  Crown,
  Gift,
  Scissors,
  Sparkles,
  Check,
  ChevronRight,
  Copy,
  Clock,
  Star,
} from 'lucide-react';
import { LoyaltyAccount } from '../types';

interface LoyaltyPointsCardProps {
  loyalty: LoyaltyAccount;
  onRedeemFreeHaircut: () => void;
  onOpenBooking: () => void;
}

export const LoyaltyPointsCard: React.FC<LoyaltyPointsCardProps> = ({
  loyalty,
  onRedeemFreeHaircut,
  onOpenBooking,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const points = loyalty.points;
  const threshold = loyalty.freeHaircutThreshold || 1000;
  const progressPercent = Math.min(100, Math.round((points / threshold) * 100));
  const remainingPoints = Math.max(0, threshold - points);
  const remainingCuts = Math.ceil(remainingPoints / 100);
  const canRedeem = points >= threshold;

  // 10 selos virtuais do cartão de fidelidade
  const totalStamps = 10;
  const completedStamps = Math.min(totalStamps, Math.floor(points / 100));

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Card Principal de Destaque do Clube de Fidelidade */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1F1F27] via-[#1A1A22] to-[#141419] border border-[#D4AF37]/40 p-6 sm:p-7 shadow-2xl">
        {/* Glow decorativo de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2D2D3A]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Clube de Fidelidade Navalha & Honra</span>
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-[#F4F4EE]">
              Rumo ao Corte Grátis
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Cada atendimento concluído rende 100 pontos. Acumule 1.000 pontos e ganhe um corte gratuito!
            </p>
          </div>

          {/* Saldo de Pontos & Tier */}
          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs text-[#8E8E98] uppercase font-semibold">Seus Pontos Atuais</div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-[#D4AF37] tabular-nums mt-0.5">
              {points}{' '}
              <span className="text-xs font-sans text-[#A1A1AA] font-normal">/ {threshold} pts</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 mt-1">
              {loyalty.tier || 'Membro Prata'}
            </div>
          </div>
        </div>

        {/* Barra de Progresso com Marcadores */}
        <div className="py-6 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1AA]">
              Progresso para o Corte Grátis: <strong className="text-[#F4F4EE] font-mono">{progressPercent}%</strong>
            </span>
            <span className="font-semibold text-xs text-[#D4AF37]">
              {canRedeem ? (
                '🎉 Meta atingida! Resgate disponível'
              ) : (
                `Faltam ${remainingPoints} pts (~${remainingCuts} corte${remainingCuts > 1 ? 's' : ''})`
              )}
            </span>
          </div>

          <div className="h-3 w-full bg-[#141419] rounded-full overflow-hidden border border-[#2D2D3A] p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8E7422] via-[#C5A059] to-[#D4AF37] transition-all duration-700 shadow-sm shadow-[#D4AF37]/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Cartão de Selos Virtual (10 carimbos estilo barbearia) */}
          <div className="pt-2">
            <div className="text-[11px] text-[#8E8E98] uppercase tracking-wider font-semibold mb-2">
              Cartão de Carimbos ({completedStamps} de {totalStamps} cortes)
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: totalStamps }).map((_, index) => {
                const isStamped = index < completedStamps;
                const isNext = index === completedStamps;
                const isFreeCut = index === totalStamps - 1;

                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 border transition-all text-center relative ${
                      isStamped
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                        : isNext
                        ? 'bg-[#22222E] border-[#D4AF37]/50 text-[#F4F4EE] animate-pulse'
                        : 'bg-[#16161D] border-[#272734] text-[#4F4F60]'
                    }`}
                    title={`Corte ${index + 1} (${isFreeCut ? 'Corte Grátis!' : '100 pts'})`}
                  >
                    {isFreeCut ? (
                      <Gift className={`w-4 h-4 ${isStamped ? 'text-[#D4AF37]' : ''}`} />
                    ) : (
                      <Scissors
                        className={`w-4 h-4 transform -rotate-45 ${
                          isStamped ? 'text-[#D4AF37]' : ''
                        }`}
                      />
                    )}
                    <span className="text-[9px] font-mono mt-0.5 font-bold">
                      {isFreeCut ? 'FREE' : index + 1}
                    </span>
                    {isStamped && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D4AF37] text-[#121215] flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ação de Resgate ou Agendamento para Pontuar */}
        <div className="pt-4 border-t border-[#2D2D3A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#A1A1AA] text-center sm:text-left">
            {canRedeem ? (
              <span className="text-emerald-400 font-semibold">
                Parabéns! Você já tem pontos suficientes para resgatar 1 Corte Grátis.
              </span>
            ) : (
              <span>
                Agende seu próximo corte e acumule mais <strong>+100 pontos</strong> na sua conta.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {canRedeem ? (
              <button
                onClick={onRedeemFreeHaircut}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C058] text-[#121215] font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>Resgatar Corte Grátis Agora</span>
              </button>
            ) : (
              <button
                onClick={onOpenBooking}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#121215] font-semibold text-xs sm:text-sm hover:bg-[#E5C058] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4" />
                <span>Agendar e Ganhar +100 Pts</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vouchers e Recompensas Resgatadas */}
      {loyalty.vouchers && loyalty.vouchers.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#17171E] border border-[#262632] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
            <Gift className="w-4 h-4" />
            <span>Seus Cupons de Recompensa Ativos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loyalty.vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="p-3.5 rounded-xl bg-[#20202A] border border-[#2D2D3E] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[#F4F4EE]">{voucher.title}</div>
                  <div className="text-[11px] text-[#8E8E98] mt-0.5">
                    Código: <span className="font-mono font-bold text-[#D4AF37]">{voucher.code}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyCode(voucher.code)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#272734] border border-[#3A3A4A] text-[11px] font-semibold text-[#E4E4E7] hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
                >
                  {copiedCode === voucher.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de Vantagens e Níveis do Clube */}
      <div className="p-5 rounded-2xl bg-[#17171E] border border-[#262632] space-y-3">
        <div className="text-xs font-semibold text-[#8E8E98] uppercase tracking-wider">
          Benefícios do Programa de Pontos
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#1B1B24] border border-[#272734]">
            <div className="text-[#C5A059] font-bold">500 Pontos (5 cortes)</div>
            <p className="text-[#A1A1AA] text-[11px] mt-1">
              50% de desconto na Barboterapia com Toalha Quente.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#1B1B24] border border-[#272734]">
            <div className="text-[#D4AF37] font-bold">750 Pontos (8 cortes)</div>
            <p className="text-[#A1A1AA] text-[11px] mt-1">
              1 Pomada Modeladora Premium de presente no balcão.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#1B1B24] border border-[#D4AF37]/30">
            <div className="text-[#F3E5AB] font-bold">1.000 Pontos (10 cortes)</div>
            <p className="text-[#A1A1AA] text-[11px] mt-1">
              Corte Tradicional ou Fade 100% Grátis na sua próxima visita!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
