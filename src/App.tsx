import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  INITIAL_SERVICES,
  INITIAL_BARBERS,
  INITIAL_BLOG_POSTS,
  INITIAL_REVIEWS,
  GALLERY_ITEMS,
  SOCIAL_POSTS,
} from './data/mockData';
import { Appointment, Barber, BarberService, GalleryItem, Review, LoyaltyAccount } from './types';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  createOneDayBeforeReminderTask,
} from './services/workspace';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesCatalog } from './components/ServicesCatalog';
import { HaircutGallery } from './components/HaircutGallery';
import { ReviewsSection } from './components/ReviewsSection';
import { BlogSection } from './components/BlogSection';
import { SocialFeedSection } from './components/SocialFeedSection';
import { TeamSection } from './components/TeamSection';
import { FAQSection } from './components/FAQSection';
import { BarberAdminDashboard } from './components/BarberAdminDashboard';
import { BookingModal } from './components/BookingModal';
import { UserProfileModal } from './components/UserProfileModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationPushToast } from './components/NotificationPushToast';
import { Footer } from './components/Footer';
import {
  registerServiceWorker,
  getNotificationHistory,
  triggerUpcomingAppointmentAlert,
  triggerScheduleChangeAlert,
  triggerStatusChangeAlert,
} from './services/notificationService';

export default function App() {
  // Estado de serviços e barbeiros
  const [services] = useState<BarberService[]>(INITIAL_SERVICES);
  const [barbers] = useState<Barber[]>(INITIAL_BARBERS);

  // Estado de avaliações com persistência
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('nh_barber_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  // Estado de agendamentos com semente inicial realista e persistência
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('nh_barber_appointments');
      if (saved) return JSON.parse(saved);

      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      return [
        {
          id: 'NH-1021',
          serviceId: 'srv-fade-moderno',
          barberId: 'barber-diego',
          clientName: 'Lucas Ferreira',
          clientPhone: '(11) 98123-4567',
          clientEmail: 'lucas@email.com',
          date: today,
          time: '10:30',
          durationMinutes: 50,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'NH-1022',
          serviceId: 'srv-combo-vip',
          barberId: 'barber-marcos',
          clientName: 'Henrique Prado',
          clientPhone: '(11) 99876-5432',
          clientEmail: 'henrique@email.com',
          date: today,
          time: '14:30',
          durationMinutes: 80,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'NH-1023',
          serviceId: 'srv-barboterapia',
          barberId: 'barber-andre',
          clientName: 'Renato Siqueira',
          clientPhone: '(11) 97654-3210',
          clientEmail: 'renato@email.com',
          date: tomorrow,
          time: '16:00',
          durationMinutes: 40,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  // Autenticação Google Workspace (Firebase Auth)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Modais e navegação
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(() => {
    try {
      const list = getNotificationHistory();
      return list.filter((n) => !n.read).length;
    } catch {
      return 0;
    }
  });
  const [selectedServiceToBook, setSelectedServiceToBook] = useState<BarberService | null>(null);
  const [selectedBarberToBook, setSelectedBarberToBook] = useState<Barber | null>(null);
  const [favoriteBarberIds, setFavoriteBarberIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nh_barber_favorites');
      return saved ? JSON.parse(saved) : ['barber-marcos'];
    } catch {
      return ['barber-marcos'];
    }
  });
  const [isAdminView, setIsAdminView] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleFavoriteBarber = (barberId: string) => {
    const barber = barbers.find((b) => b.id === barberId);
    const isFav = favoriteBarberIds.includes(barberId);
    const next = isFav
      ? favoriteBarberIds.filter((id) => id !== barberId)
      : [...favoriteBarberIds, barberId];
    setFavoriteBarberIds(next);
    try {
      localStorage.setItem('nh_barber_favorites', JSON.stringify(next));
    } catch (e) {
      console.warn('Erro ao salvar favoritos:', e);
    }
    const firstName = barber?.name.split(' ')[0] || 'Barbeiro';
    setToastMessage(
      isFav
        ? `${firstName} foi removido dos seus favoritos.`
        : `⭐ ${firstName} agora é seu barbeiro favorito!`
    );
  };

  // Clube de Fidelidade com persistência
  const [loyalty, setLoyalty] = useState<LoyaltyAccount>(() => {
    try {
      const saved = localStorage.getItem('nh_barber_loyalty');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      points: 750,
      totalVisits: 7,
      freeHaircutThreshold: 1000,
      tier: 'Prata',
      vouchers: [
        {
          id: 'vouch-1',
          title: '50% OFF em Barboterapia',
          code: 'BARBA-50-VIP',
          createdAt: '15 Out 2026',
          used: false,
        },
      ],
    };
  });

  // Persistir reviews, agendamentos e fidelidade sempre que alterados
  useEffect(() => {
    try {
      localStorage.setItem('nh_barber_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.warn('Erro ao salvar reviews:', e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem('nh_barber_appointments', JSON.stringify(appointments));
    } catch (e) {
      console.warn('Erro ao salvar agendamentos:', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('nh_barber_loyalty', JSON.stringify(loyalty));
    } catch (e) {
      console.warn('Erro ao salvar fidelidade:', e);
    }
  }, [loyalty]);

  // Inicializar listener de autenticação Google
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Registrar Service Worker e monitorar contagem de notificações não lidas
  useEffect(() => {
    registerServiceWorker();

    const updateCount = () => {
      const list = getNotificationHistory();
      setUnreadNotificationsCount(list.filter((n) => !n.read).length);
    };

    updateCount();

    window.addEventListener('nh:new-notification', updateCount);
    window.addEventListener('nh:notifications-updated', updateCount);
    return () => {
      window.removeEventListener('nh:new-notification', updateCount);
      window.removeEventListener('nh:notifications-updated', updateCount);
    };
  }, []);

  // Verificador automático de horários de agendamento próximos
  useEffect(() => {
    const alertedSet = new Set<string>();

    const checkUpcoming = () => {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

      appointments.forEach((app) => {
        if (app.status !== 'confirmed') return;
        if (app.date !== today) return;

        const [hStr, mStr] = app.time.split(':');
        const appH = parseInt(hStr, 10);
        const appM = parseInt(mStr, 10);
        if (isNaN(appH) || isNaN(appM)) return;

        const appTotalMinutes = appH * 60 + appM;
        const diffMinutes = appTotalMinutes - currentTotalMinutes;

        // Se estiver entre 0 e 50 minutos para acontecer e ainda não foi alertado nesta sessão
        if (diffMinutes >= 0 && diffMinutes <= 50 && !alertedSet.has(app.id)) {
          alertedSet.add(app.id);
          const brb = barbers.find((b) => b.id === app.barberId);
          const svc = services.find((s) => s.id === app.serviceId);
          triggerUpcomingAppointmentAlert(
            app,
            svc?.name || 'Serviço Barbearia',
            brb?.name || 'Barbeiro',
            diffMinutes
          );
        }
      });
    };

    checkUpcoming();
    const interval = setInterval(checkUpcoming, 30000); // Executa a cada 30 segundos
    return () => clearInterval(interval);
  }, [appointments, barbers, services]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        showToast(`Bem-vindo, ${res.user.displayName || 'Cliente'}! Google Workspace conectado.`);
      }
    } catch (err: any) {
      console.error('Falha no login Google:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    showToast('Conta desconectada do Google.');
  };

  const handleOpenBooking = (service?: BarberService, barber?: Barber) => {
    setSelectedServiceToBook(service || null);
    setSelectedBarberToBook(barber || null);
    setIsBookingOpen(true);
  };

  const handleAddAppointment = (newApp: Appointment) => {
    setAppointments((prev) => [newApp, ...prev]);
    showToast(`Agendamento #${newApp.id} confirmado com sucesso!`);
  };

  const handleUpdateStatus = (
    appointmentId: string,
    newStatus: 'confirmed' | 'completed' | 'cancelled'
  ) => {
    let targetApp: Appointment | undefined;
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === appointmentId) {
          targetApp = { ...a, status: newStatus };
          return targetApp;
        }
        return a;
      })
    );

    // Disparar notificação push ao usuário
    if (targetApp) {
      const brb = barbers.find((b) => b.id === (targetApp as Appointment).barberId);
      const svc = services.find((s) => s.id === (targetApp as Appointment).serviceId);
      triggerStatusChangeAlert(
        targetApp,
        brb?.name || 'Barbeiro',
        svc?.name || 'Serviço',
        newStatus
      );
    }

    if (newStatus === 'completed') {
      setLoyalty((prev) => {
        const nextPts = prev.points + 100;
        const nextVisits = prev.totalVisits + 1;
        const nextTier = nextPts >= 1000 ? 'Ouro VIP' : nextPts >= 500 ? 'Prata' : 'Bronze';
        return {
          ...prev,
          points: nextPts,
          totalVisits: nextVisits,
          tier: nextTier,
        };
      });
      showToast(`Agendamento #${appointmentId} concluído! +100 pontos creditados no Clube de Fidelidade.`);
    } else {
      const label =
        newStatus === 'cancelled'
          ? 'cancelado'
          : 'reativado';
      showToast(`Agendamento #${appointmentId} ${label}. Notificação enviada ao cliente.`);
    }
  };

  // Reagendamento / alteração de horário confirmada pelo barbeiro com push imediato
  const handleRescheduleAppointment = (
    appointmentId: string,
    newDate: string,
    newTime: string,
    reason?: string
  ) => {
    let oldTime = '';
    let targetApp: Appointment | undefined;

    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === appointmentId) {
          oldTime = a.time;
          targetApp = { ...a, date: newDate, time: newTime, status: 'confirmed' };
          return targetApp;
        }
        return a;
      })
    );

    if (targetApp) {
      const brb = barbers.find((b) => b.id === (targetApp as Appointment).barberId);
      const svc = services.find((s) => s.id === (targetApp as Appointment).serviceId);

      triggerScheduleChangeAlert(
        targetApp,
        brb?.name || 'Barbeiro Navalha & Honra',
        svc?.name || 'Serviço',
        oldTime,
        newTime,
        newDate
      );

      showToast(
        `Horário de #${appointmentId} atualizado para ${newDate.split('-').reverse().join('/')} às ${newTime}. Notificação push emitida!`
      );
    }
  };

  const handleRedeemFreeHaircut = () => {
    if (loyalty.points < loyalty.freeHaircutThreshold) {
      showToast(`Você possui ${loyalty.points} pontos. São necessários ${loyalty.freeHaircutThreshold} pontos para o corte grátis.`);
      return;
    }
    const code = `CORTE-FREE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newVoucher = {
      id: `vouch-${Date.now()}`,
      title: '1x Corte de Cabelo Grátis (1000 pts)',
      code,
      createdAt: 'Hoje',
      used: false,
    };
    setLoyalty((prev) => {
      const remaining = prev.points - prev.freeHaircutThreshold;
      const nextTier = remaining >= 1000 ? 'Ouro VIP' : remaining >= 500 ? 'Prata' : 'Bronze';
      return {
        ...prev,
        points: remaining,
        tier: nextTier,
        vouchers: [newVoucher, ...prev.vouchers],
      };
    });
    showToast(`Voucher gerado com sucesso: ${code}! Apresente ao barbeiro.`);
  };

  const handleAddReview = (newRev: Review) => {
    setReviews((prev) => [newRev, ...prev]);
    showToast('Obrigado! Sua avaliação foi publicada com sucesso.');
  };

  const handleShareService = (svc: BarberService) => {
    const text = `Confira o serviço "${svc.name}" (R$ ${svc.price.toFixed(
      2
    )}) na barbearia Navalha & Honra!`;
    if (navigator.share) {
      navigator.share({ title: svc.name, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      showToast('Link do serviço copiado para a área de transferência!');
    }
  };

  const handleBookFromStyle = (item: GalleryItem) => {
    const related = services.find((s) =>
      s.name.toLowerCase().includes(item.style.toLowerCase().split(' ')[0])
    ) || services[0];
    handleOpenBooking(related);
  };

  const handleBookFromArticle = (serviceId: string) => {
    const targetService = services.find((s) => s.id === serviceId) || services[0];
    handleOpenBooking(targetService);
  };

  // Agendar lembrete D-1 no Google Tasks para um agendamento específico
  const handleScheduleOneDayReminder = async (appointmentId: string) => {
    const targetApp = appointments.find((a) => a.id === appointmentId);
    if (!targetApp) return;

    const targetService = services.find((s) => s.id === targetApp.serviceId) || services[0];
    const targetBarber = barbers.find((b) => b.id === targetApp.barberId) || barbers[0];

    try {
      const result = await createOneDayBeforeReminderTask(targetApp, targetService, targetBarber);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? { ...a, googleReminderTaskId: result.taskId, reminderScheduled: true }
            : a
        )
      );
      showToast(`Lembrete D-1 agendado no Google Tasks para a véspera (${result.reminderDateStr})!`);
    } catch (err: any) {
      console.error('Erro ao agendar lembrete Google Tasks:', err);
      showToast(err.message || 'Falha ao criar lembrete. Conecte sua conta Google primeiro.');
    }
  };

  // Agendar lembretes D-1 no Google Tasks para todos os agendamentos confirmados pendentes
  const handleScheduleAllReminders = async () => {
    const pendingApps = appointments.filter(
      (a) => a.status === 'confirmed' && !a.googleReminderTaskId && !a.reminderScheduled
    );

    if (pendingApps.length === 0) {
      showToast('Todos os agendamentos confirmados já possuem lembrete D-1 configurado.');
      return;
    }

    let successCount = 0;
    const updated = [...appointments];

    for (const app of pendingApps) {
      const targetService = services.find((s) => s.id === app.serviceId) || services[0];
      const targetBarber = barbers.find((b) => b.id === app.barberId) || barbers[0];

      try {
        const res = await createOneDayBeforeReminderTask(app, targetService, targetBarber);
        const idx = updated.findIndex((a) => a.id === app.id);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            googleReminderTaskId: res.taskId,
            reminderScheduled: true,
          };
        }
        successCount++;
      } catch (e: any) {
        console.warn('Erro ao criar lembrete para:', app.id, e);
      }
    }

    if (successCount > 0) {
      setAppointments(updated);
      showToast(`${successCount} lembrete(s) automático(s) de véspera criado(s) no Google Tasks!`);
    } else {
      showToast('Não foi possível sincronizar. Certifique-se de estar conectado com o Google.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121215] text-[#F3F3EE] flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#F3F3EE]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A22] border border-[#D4AF37]/40 text-[#F4F4EE] px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra de Navegação */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        isAdminView={isAdminView}
        onToggleAdminView={() => setIsAdminView(!isAdminView)}
        currentUser={currentUser}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
        isLoggingIn={isLoggingIn}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Conteúdo Principal: Alternância entre Site e Painel Administrativo */}
      <main className="flex-1">
        {isAdminView ? (
          <BarberAdminDashboard
            appointments={appointments}
            barbers={barbers}
            services={services}
            onUpdateStatus={handleUpdateStatus}
            onOpenManualBooking={() => handleOpenBooking()}
            onCloseAdminView={() => setIsAdminView(false)}
            onScheduleOneDayReminder={handleScheduleOneDayReminder}
            onScheduleAllReminders={handleScheduleAllReminders}
            onRescheduleAppointment={handleRescheduleAppointment}
          />
        ) : (
          <>
            {/* 1. Hero com Proposta de Valor e CTA */}
            <HeroSection
              onOpenBooking={() => handleOpenBooking()}
              onExploreServices={() => {
                const el = document.getElementById('servicos');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 2. Catálogo de Serviços com Valores e Duração */}
            <ServicesCatalog
              services={services}
              onSelectServiceToBook={handleOpenBooking}
              onShareService={handleShareService}
            />

            {/* 3. Galeria de Cortes com Compartilhamento Social */}
            <HaircutGallery
              galleryItems={GALLERY_ITEMS}
              onBookWithStyle={handleBookFromStyle}
            />

            {/* 4. Avaliações dos Clientes (1-5 estrelas e avaliação de barbeiro) */}
            <ReviewsSection
              reviews={reviews}
              barbers={barbers}
              services={services}
              onAddReview={handleAddReview}
            />

            {/* 5. Blog com Artigos de Cuidados Masculinos */}
            <BlogSection
              posts={INITIAL_BLOG_POSTS}
              onBookFromArticle={handleBookFromArticle}
            />

            {/* 6. Equipe de Barbeiros Especialistas */}
            <TeamSection
              barbers={barbers}
              favoriteBarberIds={favoriteBarberIds}
              onToggleFavorite={handleToggleFavoriteBarber}
              onSelectBarberToBook={(barber) => {
                handleOpenBooking(services[0], barber);
              }}
            />

            {/* 7. Perguntas Frequentes (FAQ Accordion) */}
            <FAQSection
              onOpenBooking={() => handleOpenBooking()}
              onOpenProfile={() => setIsProfileOpen(true)}
            />

            {/* 8. Feed Social & Instagram */}
            <SocialFeedSection posts={SOCIAL_POSTS} />
          </>
        )}
      </main>

      {/* Rodapé Completo */}
      <Footer onOpenBooking={() => handleOpenBooking()} />

      {/* Modal de Agendamento Autônomo com Prevenção de Conflito e Google Workspace */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedServiceToBook(null);
          setSelectedBarberToBook(null);
        }}
        services={services}
        barbers={barbers}
        existingAppointments={appointments}
        onAddAppointment={handleAddAppointment}
        initialSelectedService={selectedServiceToBook}
        initialSelectedBarber={selectedBarberToBook}
        favoriteBarberIds={favoriteBarberIds}
        currentUser={currentUser}
        onGoogleLogin={handleGoogleLogin}
        isLoggingIn={isLoggingIn}
      />

      {/* Modal do Perfil do Usuário e Clube de Fidelidade */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        loyalty={loyalty}
        onRedeemFreeHaircut={handleRedeemFreeHaircut}
        onOpenBooking={() => {
          setIsProfileOpen(false);
          handleOpenBooking();
        }}
        onGoogleLogout={handleGoogleLogout}
        appointments={appointments}
        barbers={barbers}
        services={services}
        onCancelAppointment={(id) => handleUpdateStatus(id, 'cancelled')}
      />

      {/* Toast flutuante de Notificação Push com Som e Prévia */}
      <NotificationPushToast onOpenCenter={() => setIsNotificationsOpen(true)} />

      {/* Central de Notificações Push com Gestão de Permissões e Histórico */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        appointments={appointments}
        barbers={barbers}
        services={services}
        onOpenBooking={() => {
          setIsNotificationsOpen(false);
          handleOpenBooking();
        }}
      />
    </div>
  );
}
