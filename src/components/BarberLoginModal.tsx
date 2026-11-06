import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, X, AlertCircle } from 'lucide-react';

interface BarberLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const BarberLoginModal: React.FC<BarberLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Aceita com ou sem espaço inicial e indiferente a maiúsculas no usuário
      const isUserValid = username.trim().toLowerCase() === 'navalha & honra';
      const isPassValid = password === ' N&H1234' || password.trim() === 'N&H1234';

      if (isUserValid && isPassValid) {
        setIsLoading(false);
        setUsername('');
        setPassword('');
        setError(null);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Usuário ou senha incorretos. Verifique as credenciais de acesso da barbearia.');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-md bg-[#17171C] border border-[#2D2D38] rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-barber-login-title"
      >
        {/* Faixa decorativa dourada no topo */}
        <div className="h-1 bg-gradient-to-r from-[#8E793E] via-[#D4AF37] to-[#8E793E]" />

        {/* Header do Modal */}
        <div className="px-6 pt-6 pb-4 border-b border-[#25252E] flex items-center justify-between bg-[#131317]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-barber-login-title" className="font-serif-display text-lg font-bold text-[#F4F4EE]">
                Painel do Barbeiro
              </h3>
              <p className="text-xs text-[#8E8E98]">
                Acesso Restrito à Gestão e Agenda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E98] hover:text-[#F4F4EE] hover:bg-[#25252E] transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário de Autenticação */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
              Usuário da Barbearia
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E98]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Ex: Navalha & Honra'
                className="w-full bg-[#121216] border border-[#2A2A35] rounded-xl pl-10 pr-3 py-2.5 text-sm text-[#F4F4EE] placeholder-[#5A5A66] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E8E98]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full bg-[#121216] border border-[#2A2A35] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#F4F4EE] placeholder-[#5A5A66] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E8E98] hover:text-[#F4F4EE] cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#2A2A35] text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4EE] hover:bg-[#1E1E26] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#E5C058] active:scale-[0.98] text-[#121215] text-xs font-bold transition-all shadow-md shadow-[#D4AF37]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Autenticando...' : 'Entrar no Painel'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
