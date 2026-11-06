import { Calendar, Scissors, ShieldCheck, User as UserIcon, LogOut, Crown, Bell, Lock } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  onOpenBooking: () => void;
  isAdminView: boolean;
  onToggleAdminView: () => void;
  currentUser: User | null;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  isLoggingIn: boolean;
  onOpenProfile: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  isAdminView,
  onToggleAdminView,
  currentUser,
  onGoogleLogin,
  onGoogleLogout,
  isLoggingIn,
  onOpenProfile,
  onOpenNotifications,
  unreadNotificationsCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#121215]/95 backdrop-blur-md border-b border-[#26262B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8E7422] p-0.5 flex items-center justify-center shadow-lg shadow-[#D4AF37]/10 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#121215] rounded-[7px] flex items-center justify-center">
                <Scissors className="w-5 h-5 text-[#D4AF37] transform -rotate-45" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif-display text-xl font-bold tracking-tight text-[#F4F4EE] whitespace-nowrap">
                Navalha & Honra
              </span>
              <span className="text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
                Barbearia Clássica
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
          <a href="#servicos" className="hover:text-[#F4F4EE] transition-colors whitespace-nowrap">
            Catálogo
          </a>
          <a href="#galeria" className="hover:text-[#F4F4EE] transition-colors whitespace-nowrap">
            Galeria de Cortes
          </a>
          <a href="#avaliacoes" className="hover:text-[#F4F4EE] transition-colors whitespace-nowrap">
            Avaliações
          </a>
          <a href="#blog" className="hover:text-[#F4F4EE] transition-colors whitespace-nowrap">
            Blog & Dicas
          </a>
          <a href="#equipe" className="hover:text-[#F4F4EE] transition-colors whitespace-nowrap">
            Barbeiros
          </a>
          <a href="#faq" className="hover:text-[#F4F4EE] transition-colors whitespace-nowrap">
            FAQ
          </a>
          <a href="#contato" className="hover:text-[#F4F4EE] transition-colors whitespace-nowrap">
            Localização
          </a>
        </nav>

        {/* Zone 3: Actions (Google Account + Admin Toggle + CTA) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Botão Central de Notificações Push */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-[#1C1C22] hover:bg-[#23232C] border border-[#2A2A32] hover:border-[#D4AF37]/50 text-[#E4E4E7] transition-all cursor-pointer group"
              title="Central de Notificações Push (Horários e Atualizações)"
            >
              <Bell className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#D4AF37] transition-colors" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4AF37] text-[#121215] text-[10px] font-bold flex items-center justify-center border-2 border-[#121215] animate-pulse">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Alternar visão Cliente / Painel do Barbeiro */}
          <button
            onClick={onToggleAdminView}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isAdminView
                ? 'bg-[#D4AF37] text-[#121215] border-[#D4AF37]'
                : 'bg-[#1C1C22] text-[#A1A1AA] border-[#2A2A32] hover:text-[#F4F4EE] hover:border-[#3E3E48]'
            }`}
            title={isAdminView ? 'Retornar para a visão pública do cliente' : 'Acessar painel do barbeiro (Requer login: usuário e senha)'}
          >
            {isAdminView ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />}
            <span>{isAdminView ? 'Modo Cliente' : 'Painel Barbeiro'}</span>
          </button>

          {/* Botão Google Workspace / Perfil & Clube de Fidelidade */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 bg-[#1C1C22] hover:bg-[#23232C] border border-[#2E2E36] hover:border-[#D4AF37]/60 rounded-lg px-2.5 py-1.5 text-xs text-[#E4E4E7] transition-all cursor-pointer"
                title="Abrir Meu Perfil e Clube de Fidelidade"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google'}
                    className="w-5 h-5 rounded-full object-cover border border-[#D4AF37]"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                )}
                <span className="hidden xl:inline max-w-[85px] truncate font-medium">
                  {currentUser.displayName?.split(' ')[0]}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#D4AF37] font-semibold bg-[#D4AF37]/15 px-1.5 py-0.5 rounded">
                  <Crown className="w-3 h-3" />
                  <span>Pontos</span>
                </span>
              </button>
              <button
                onClick={onGoogleLogout}
                className="text-[#71717A] hover:text-red-400 p-1.5 rounded-lg hover:bg-[#22222A] transition-colors"
                title="Desconectar do Google"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleLogin}
              disabled={isLoggingIn}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1C1C22] border border-[#2E2E36] hover:border-[#D4AF37]/50 text-[#D4AF37] rounded-lg transition-colors"
              title="Conecte para sincronizar compromissos com seu Google Calendar e Google Tasks"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? 'Conectando...' : 'Google Calendar'}</span>
            </button>
          )}

          {/* Primary CTA */}
          <button
            onClick={onOpenBooking}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#D4AF37] text-[#121215] hover:bg-[#E5C058] active:scale-[0.98] transition-all shadow-md shadow-[#D4AF37]/20 whitespace-nowrap shrink-0"
          >
            <Scissors className="w-4 h-4" />
            <span>Agendar Horário</span>
          </button>
        </div>
      </div>
    </header>
  );
};
