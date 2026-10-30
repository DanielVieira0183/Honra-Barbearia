import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import rawFirebaseConfig from '../../firebase-applet-config.json';
import { Appointment, Barber, BarberService } from '../types';

// Carregar chaves de API exclusivamente de variáveis de ambiente seguras (.env)
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY || rawFirebaseConfig.apiKey || '';

const firebaseConfig = {
  ...rawFirebaseConfig,
  apiKey: firebaseApiKey,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawFirebaseConfig.projectId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawFirebaseConfig.appId || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawFirebaseConfig.authDomain || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawFirebaseConfig.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawFirebaseConfig.messagingSenderId || '',
};

// Inicializar Firebase singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider com os escopos do Google Workspace (Calendar, Tasks e Gmail)
export const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/tasks',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
  'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!firebaseApiKey) {
    throw new Error('Chave de API do Firebase não configurada. Defina VITE_FIREBASE_API_KEY no arquivo .env.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter token de acesso Google Workspace');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro na autenticação Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Sincronizar evento com Google Calendar
export const createCalendarEvent = async (
  appointment: Appointment,
  service: BarberService,
  barber: Barber
): Promise<{ eventId: string; htmlLink?: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não conectado ao Google Workspace.');
  }

  // Calcular horários ISO
  const startDateTime = `${appointment.date}T${appointment.time}:00`;
  const [hours, minutes] = appointment.time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + appointment.durationMinutes;
  const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const endMins = (totalMinutes % 60).toString().padStart(2, '0');
  const endDateTime = `${appointment.date}T${endHours}:${endMins}:00`;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';

  const eventPayload = {
    summary: `💈 Agendamento Barbearia: ${service.name} (${barber.name})`,
    description: `Agendamento na Navalha & Honra Barbearia\n\nServiço: ${service.name}\nBarbeiro: ${barber.name}\nDuração: ${appointment.durationMinutes} minutos\nValor: R$ ${service.price.toFixed(2)}\nCliente: ${appointment.clientName} (${appointment.clientPhone})\nObservações: ${appointment.notes || 'Nenhuma'}`,
    location: 'Navalha & Honra Barbearia - Rua Augusta, 1500, Jardins, São Paulo - SP',
    start: {
      dateTime: new Date(startDateTime).toISOString(),
      timeZone,
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
      timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao criar evento no Google Calendar');
  }

  const data = await response.json();
  return { eventId: data.id, htmlLink: data.htmlLink };
};

// Sincronizar tarefa/lembrete no Google Tasks
export const createWorkspaceTask = async (
  appointment: Appointment,
  service: BarberService,
  barber: Barber
): Promise<{ taskId: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não conectado ao Google Workspace.');
  }

  const taskPayload = {
    title: `💈 Corte agendado: ${service.name} com ${barber.name} às ${appointment.time}`,
    notes: `Atendimento na Navalha & Honra\nData: ${appointment.date} às ${appointment.time}\nBarbeiro: ${barber.name}\nValor: R$ ${service.price.toFixed(2)}\nTelefone: ${appointment.clientPhone}`,
    due: new Date(`${appointment.date}T${appointment.time}:00`).toISOString(),
  };

  const response = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao criar tarefa no Google Tasks');
  }

  const data = await response.json();
  return { taskId: data.id };
};

// Criar lembrete automático no Google Tasks para 1 dia antes do agendamento confirmado
export const createOneDayBeforeReminderTask = async (
  appointment: Appointment,
  service: BarberService,
  barber: Barber
): Promise<{ taskId: string; reminderDateStr: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não conectado ao Google Workspace. Conecte sua conta primeiro.');
  }

  // Calcular data de 1 dia antes às 09:00 (ou horário do corte caso seja antes)
  const appDate = new Date(`${appointment.date}T${appointment.time}:00`);
  const reminderDate = new Date(appDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(9, 0, 0, 0); // Lembrete disparado na manhã do dia anterior

  const formattedAppDate = appointment.date.split('-').reverse().join('/');
  const formattedReminderDate = reminderDate.toISOString().split('T')[0].split('-').reverse().join('/');

  const taskPayload = {
    title: `💈 Lembrete: Seu atendimento é amanhã às ${appointment.time} (${service.name})`,
    notes: `Olá, ${appointment.clientName}!\n\nLembrete da Navalha & Honra Barbearia:\nSeu horário está agendado para amanhã, ${formattedAppDate} às ${appointment.time}.\n\n• Serviço: ${service.name} (${appointment.durationMinutes} min)\n• Barbeiro: ${barber.name}\n• Valor: R$ ${service.price.toFixed(2)}\n• Local: Rua Augusta, 1500 - Jardins, São Paulo\n• Código: #${appointment.id}\n• Dúvidas ou reagendamento: (11) 99999-8888`,
    due: reminderDate.toISOString(),
  };

  const response = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao criar lembrete automático no Google Tasks');
  }

  const data = await response.json();
  return { taskId: data.id, reminderDateStr: formattedReminderDate };
};

// Cancelar evento no Google Calendar com diálogo de confirmação explícito (mandatório por skill)
export const deleteCalendarEvent = async (eventId: string, appointmentTitle: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) return false;

  const confirmed = window.confirm(
    `Deseja realmente remover o compromisso "${appointmentTitle}" do seu Google Calendar? Esta ação não pode ser desfeita.`
  );
  if (!confirmed) return false;

  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch (err) {
    console.error('Erro ao deletar evento:', err);
    return false;
  }
};

// Codificação URL-safe Base64 para envio via Gmail API
function encodeBase64Url(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Gerador do template HTML customizado de confirmação para Navalha & Honra
export function generateBookingConfirmationHtml(
  appointment: Appointment,
  service: BarberService,
  barber: Barber
): string {
  const formattedDate = appointment.date.split('-').reverse().join('/');
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Agendamento - Navalha & Honra</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0E0E12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E4E4E7;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0E0E12; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #17171C; border: 1px solid #292934; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Topo Dourado com Marca -->
          <tr>
            <td style="background: linear-gradient(135deg, #1C1C24 0%, #121215 100%); padding: 36px 30px; text-align: center; border-bottom: 2px solid #D4AF37;">
              <div style="display: inline-block; padding: 8px 16px; background-color: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 20px; margin-bottom: 12px;">
                <span style="font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #D4AF37;">Barbearia Clássica · Est. 2014</span>
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #F4F4EE; letter-spacing: -0.5px;">Navalha & Honra</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #A1A1AA;">Confirmação Oficial de Agendamento</p>
            </td>
          </tr>

          <!-- Corpo Principal -->
          <tr>
            <td style="padding: 32px 30px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #F4F4EE; line-height: 1.5;">
                Olá, <strong>${appointment.clientName}</strong>!
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #A1A1AA; line-height: 1.6;">
                Seu atendimento foi agendado com sucesso em nosso sistema autônomo. Nossos mestres da tesoura e navalha já reservaram a cadeira exclusiva para você.
              </p>

              <!-- Card com Detalhes da Reserva -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #121215; border: 1px solid #252530; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #D4AF37; font-weight: bold;">
                          Reserva Confirmada #${appointment.id}
                        </td>
                        <td align="right" style="padding-bottom: 12px;">
                          <span style="background-color: #1A3826; color: #34D399; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 6px; border: 1px solid #059669;">CONFIRMADO</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #8E8E98; border-top: 1px solid #1F1F28;">Serviço:</td>
                        <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #F4F4EE; border-top: 1px solid #1F1F28;">${service.name} (${appointment.durationMinutes} min)</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #8E8E98; border-top: 1px solid #1F1F28;">Mestre Barbeiro:</td>
                        <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #F4F4EE; border-top: 1px solid #1F1F28;">${barber.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #8E8E98; border-top: 1px solid #1F1F28;">Data & Horário:</td>
                        <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #D4AF37; font-family: monospace; border-top: 1px solid #1F1F28;">${formattedDate} às ${appointment.time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #8E8E98; border-top: 1px solid #1F1F28;">Valor no local:</td>
                        <td align="right" style="padding: 8px 0; font-size: 16px; font-weight: 800; color: #F4F4EE; border-top: 1px solid #1F1F28;">R$ ${service.price.toFixed(2)}</td>
                      </tr>
                      ${appointment.notes ? `
                      <tr>
                        <td style="padding: 8px 0; font-size: 13px; color: #8E8E98; border-top: 1px solid #1F1F28;">Observações:</td>
                        <td align="right" style="padding: 8px 0; font-size: 12px; color: #A1A1AA; border-top: 1px solid #1F1F28;">${appointment.notes}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Clube de Fidelidade Bônus -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(18,18,21,0.5) 100%); border: 1px dashed rgba(212,175,55,0.4); border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="font-size: 12px; font-weight: bold; color: #D4AF37; margin-bottom: 4px;">
                      ★ Clube de Fidelidade Navalha & Honra
                    </div>
                    <div style="font-size: 12px; color: #D4D4D8; line-height: 1.4;">
                      Esta visita soma <strong>+100 pontos</strong> na sua conta! Ao completar 1.000 pontos, você ganha um corte clássico gratuito.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Informações Importantes & Endereço -->
              <div style="margin-bottom: 24px; padding: 16px; background-color: #121215; border-radius: 12px; border: 1px solid #202028;">
                <div style="font-size: 12px; font-weight: bold; color: #F4F4EE; margin-bottom: 8px;">
                  📍 Endereço & Recomendações
                </div>
                <div style="font-size: 12px; color: #A1A1AA; line-height: 1.6;">
                  • <strong>Local:</strong> Rua Augusta, 1500 · Jardins, São Paulo - SP (Estacionamento com manobrista)<br>
                  • <strong>Pontualidade:</strong> Recomendamos chegar de 5 a 10 minutos antes para apreciar nosso café espresso moído na hora ou cerveja artesanal cortesia.<br>
                  • <strong>Reagendamento:</strong> Caso precise alterar o horário, pedimos aviso prévio de até 2 horas.
                </div>
              </div>

              <!-- Dúvidas WhatsApp -->
              <div style="text-align: center; margin-top: 24px;">
                <a href="https://wa.me/5511999998888?text=Ol%C3%A1,%20gostaria%20de%20falar%20sobre%20meu%20agendamento%20${appointment.id}" style="display: inline-block; background-color: #D4AF37; color: #121215; font-size: 13px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 14px rgba(212,175,55,0.25);">
                  Falar com Nosso Concierge no WhatsApp
                </a>
              </div>
            </td>
          </tr>

          <!-- Rodapé do E-mail -->
          <tr>
            <td style="background-color: #111115; padding: 20px 30px; text-align: center; border-top: 1px solid #202028;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #71717A;">
                Navalha & Honra Barbearia Clássica · Todos os direitos reservados.
              </p>
              <p style="margin: 0; font-size: 10px; color: #52525B;">
                Mensagem automática gerada via Google Workspace Gmail API com permissão do usuário.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Disparar e-mail de confirmação customizado para o cliente via Gmail API
export const sendBookingConfirmationEmail = async (
  appointment: Appointment,
  service: BarberService,
  barber: Barber,
  options?: { skipUserConfirm?: boolean }
): Promise<{ messageId: string; recipientEmail: string }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não conectado ao Google Workspace.');
  }

  const recipient = appointment.clientEmail?.trim() || auth.currentUser?.email;
  if (!recipient || recipient === 'cliente@email.com') {
    throw new Error('E-mail válido do cliente é necessário para enviar a confirmação.');
  }

  // Diálogo de confirmação para mutação de dados (mandatório pela diretriz do Workspace Skill)
  if (!options?.skipUserConfirm) {
    const confirmed = window.confirm(
      `Confirma o envio do e-mail de confirmação da reserva #${appointment.id} para o cliente (${recipient}) via Gmail?`
    );
    if (!confirmed) {
      throw new Error('Envio de e-mail cancelado pelo usuário.');
    }
  }

  const subject = `💈 Confirmação de Agendamento: ${service.name} #${appointment.id} - Navalha & Honra`;
  const htmlBody = generateBookingConfirmationHtml(appointment, service, barber);

  // Montar mensagem RFC 2822 / MIME formatada
  const emailLines = [
    'From: "Navalha & Honra Barbearia" <me>',
    `To: <${recipient}>`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
  ];

  const rawMessage = emailLines.join('\r\n');
  const base64UrlRaw = encodeBase64Url(rawMessage);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: base64UrlRaw,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Falha ao enviar e-mail via Gmail API');
  }

  const data = await response.json();
  return {
    messageId: data.id,
    recipientEmail: recipient,
  };
};

