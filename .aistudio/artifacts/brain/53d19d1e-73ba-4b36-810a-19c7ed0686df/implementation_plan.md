# Sistema Web de Agendamento, Catálogo, Galeria e Blog para Barbearia

Sistema web moderno e responsivo para barbearia com agendamento autônomo em tempo real, prevenção contra conflitos de horários, catálogo de serviços com durações e valores, galeria de estilos com compartilhamento em redes sociais, seção interativa de avaliações de clientes, blog integrado com artigos de cuidados masculinos, painel administrativo para barbeiros e sincronização com Google Calendar e Google Tasks.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisões Centrais de Arquitetura e Integrações**:
> - **Google Workspace (Google Calendar & Google Tasks)**: Sincronização direta de agendamentos no Google Calendar do cliente/barbeiro e criação de tarefas no Google Tasks para lembretes de atendimento sem riscos de no-show.
> - **Experiência de Agendamento Autônomo**: Conforme o documento de concepção (Fase 1), o cliente escolhe serviço, barbeiro de preferência, data e horário livre em tempo real, com validação instantânea contra horários duplicados.
> - **Avaliações com Avaliação de Barbeiro e Serviço**: Seção interativa com score 1 a 5 estrelas, distribuição percentual de notas, depoimentos detalhados e formulário para novos clientes enviarem avaliações.
> - **Integração com Redes Sociais & Compartilhamento**: Feed visual estilo Instagram dos cortes recentes e botões de compartilhamento direto (WhatsApp, Telegram, X/Twitter, link direto).
> - **Blog Editorial Masculino Integrado**: Aba/seção de blog com os 3 artigos iniciais solicitados (*"Os melhores cortes para o verão"*, *"Dicas de como manter a barba hidratada"*, *"Cuidados essenciais com o cabelo masculino"*), modal de leitura imersiva e atalho direto para agendar o serviço mencionado no artigo.

---

### 1. Overview & Core Concept

- **O que faz**: Plataforma digital completa e premium para a barbearia: os clientes podem explorar o catálogo com valores e tempos, navegar pela galeria de cortes filtráveis, ler e postar avaliações com nota e comentário, ler artigos informativos de estilo e cuidados no blog, e realizar agendamentos 24/7 sem necessidade de ligações ou trocas manuais de mensagem no WhatsApp. Inclui painel administrativo dedicado para barbeiros e gestores acompanharem a agenda do dia e semana.
- **Público-alvo**: Homens modernos que valorizam pontualidade, atendimento profissional e facilidade digital; barbeiros e gestores que precisam de fluxo de trabalho organizado e redução drástica do absenteísmo.
- **Proposta de Valor**: Automatização ponta a ponta do agendamento, fidelização através de conteúdo educativo de barbearia (blog) e prova social (avaliações e fotos reais).

---

### 2. User Experience & Visual Design

#### Fluxos Principais do Usuário
1. **Exploração & Catálogo de Serviços**:
   - Serviços categorizados: Cortes, Barba, Acabamento e Combos VIP.
   - Cada card exibe duração média em minutos, valor em R$ e botão direto "Agendar este serviço".
2. **Galeria de Inspirações & Compartilhamento Social**:
   - Grid visual de estilos (Fade clássico, Degradê navalhado, Pompadour, Barboterapia, Barba alinhada).
   - Filtros por estilo e botão de compartilhamento com URL/WhatsApp.
3. **Fluxo de Agendamento em 4 Passos**:
   - *Passo 1*: Seleção do serviço ou combo.
   - *Passo 2*: Seleção do profissional barbeiro (ou escolha automática do primeiro disponível).
   - *Passo 3*: Seleção da data e horário (slots ocupados são bloqueados para evitar conflito).
   - *Passo 4*: Dados do cliente (Nome, WhatsApp, E-mail) com opção de sincronizar no Google Calendar e Google Tasks.
4. **Seção de Avaliações de Clientes**:
   - Painel com nota média (ex: 4.9/5 estrelas) e total de avaliações.
   - Lista de depoimentos com estrelas, nome do cliente, serviço feito e barbeiro avaliado.
   - Modal com formulário para envio de nova nota (1 a 5 estrelas) e comentário.
5. **Blog Editorial de Estilo & Cuidados**:
   - 3 artigos completos iniciais:
     1. *"Os melhores cortes para o verão"* (cortes frescos, texturizados, low fade e manutenção no calor).
     2. *"Dicas de como manter a barba hidratada"* (óleos essenciais, balms, higienização correta e esfoliação).
     3. *"Cuidados essenciais com o cabelo masculino"* (shampoo correto, hidratação semanal e uso de pomadas modeladoras).
   - Modal de leitura fluida com tempo de leitura, autor e botão "Agendar Horário" no final do texto.
6. **Feed Social & Conexões**:
   - Grid estilo Instagram com fotos reais de cortes, contagem de curtidas e link para as redes oficiais.
7. **Painel do Barbeiro / Gestor (Admin)**:
   - Alternância rápida para modo Barbeiro/Admin no topo.
   - Visualização da agenda por dia e semana, lista de clientes do dia, status do agendamento (Confirmado, Concluído, Cancelado) e faturamento estimado do período.

#### Identidade Visual & Tema
- **Aesthetic Direction**: Vintage Gentleman & Barbearia Contemporânea de Alto Padrão.
- **Paleta de Cores (60-30-10)**:
  - *60% Neutral Canvas*: Tons escuros refinados (`#111113` e `#19191D`).
  - *30% Superfícies & Texto*: Marfim suave (`#F4F4EE`), cinza neutro (`#9CA3AF`) e divisórias sutis.
  - *10% Dourado Nobre / Latão*: Dourado clássico (`#D4AF37` e `#E5C058`) para botões de ação principal, estrelas, seleções ativas e badges discretos.
- **Tipografia**:
  - Títulos: `Playfair Display` com elegância e tradição.
  - Corpo da Interface: `Plus Jakarta Sans` para clareza e rapidez de leitura.
  - Horários e Moeda: `font-mono tabular-nums` para alinhamento numérico impecável.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Sincronização com Google Workspace (Calendar & Tasks)**:
  - *Abordagem*: Preparado para integração cliente-side via Google Workspace OAuth skill. Permite criar eventos no Google Calendar com duração e local da barbearia, e tarefas no Google Tasks com lembrete de comparecimento.
- **Decisão 2: Prevenção Automática de Conflitos de Agenda**:
  - *Abordagem*: Validação de colisão de horários considerando o barbeiro e o tempo de duração de cada serviço.
- **Decisão 3: Blog Integrado no Mesmo SPA com Navegação Instantânea**:
  - *Abordagem*: O blog faz parte da aplicação de forma contígua (com filtro e modal de leitura detalhada), permitindo que o cliente passe da leitura de uma dica diretamente para a marcação do serviço sem recarregar a página.
- **Decisão 4: Persistência Local Reativa para Avaliações e Agendamentos**:
  - *Abordagem*: Utilização de estado reativo em React sincronizado com `localStorage`, permitindo que novos agendamentos e novas avaliações fiquem salvos imediatamente entre recarregamentos da página.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BARBEARIA WEB PLATFORM                          │
├────────────────────────────────────────────────────────────────────────┤
│  TopBar (Wordmark · Links de Seções · Blog · Agendar · Alternar Admin) │
├────────────────────────────────────────────────────────────────────────┤
│  Hero Showcase (Slogan Nobre · Prova Social · Botão de Ação Imediata)  │
├────────────────────────────────────────────────────────────────────────┤
│  Catálogo de Serviços (Preços · Duração em min · Agendamento Rápido)   │
├────────────────────────────────────────────────────────────────────────┤
│  Galeria de Cortes (Filtros por Tipo de Corte · Compartilhar)         │
├────────────────────────────────────────────────────────────────────────┤
│  Feed Social & Instagram (Grid de Estilo · Redes Sociais)              │
├────────────────────────────────────────────────────────────────────────┤
│  Avaliações de Clientes (Score 4.9★ · Lista · Avaliar Barbeiro/Serviço)│
├────────────────────────────────────────────────────────────────────────┤
│  Blog & Dicas Masculinas (3 Artigos Iniciais · Leitor de Matérias)    │
├────────────────────────────────────────────────────────────────────────┤
│  Sobre a Barbearia & Barbeiros (Especialidades · Anos de Experiência)  │
├────────────────────────────────────────────────────────────────────────┤
│  Rodapé Completo (Horários de Funcionamento · Endereço · Contato)      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┼────────────────────────┐
           ▼                         ▼                        ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│ MODAL DE AGENDAMENTO │  │ PAINEL ADMIN/BARBEIRO│  │ LEITOR DO BLOG   │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────┤
│ 1. Serviço e Preço   │  │ • Agenda do Dia      │  │ • Conteúdo rico  │
│ 2. Barbeiro          │  │ • Gestão de Status   │  │ • Dicas práticas │
│ 3. Data & Horário    │  │ • Cancelamento       │  │ • Produtos rec.  │
│ 4. Dados + Workspace │  │ • Métricas da Semana │  │ • CTA Agendar    │
└──────────────────────┘  └──────────────────────┘  └──────────────────┘
```

#### Entidades Principais
- `BarberService`: `id`, `name`, `category`, `price`, `durationMinutes`, `description`, `popular`
- `Barber`: `id`, `name`, `role`, `experience`, `avatarUrl`, `specialties`, `bio`
- `Appointment`: `id`, `serviceId`, `barberId`, `clientName`, `clientPhone`, `clientEmail`, `date`, `time`, `durationMinutes`, `status`
- `Review`: `id`, `clientName`, `barberId`, `serviceName`, `rating`, `comment`, `date`
- `BlogPost`: `id`, `title`, `slug`, `excerpt`, `content`, `author`, `category`, `readTime`, `coverImage`, `relatedServiceId`
- `SocialPost`: `id`, `imageUrl`, `caption`, `likes`, `shares`, `timestamp`

---

### Verificação do Plano
- **Compilação**: Validada via `compile_applet`.
- **Requisitos Cobertos**:
  - Documento de concepção (Fase 1): agendamento autônomo 24/7, catálogo completo, seleção de profissional, prevenção de horários conflitantes e painel administrativo.
  - Avaliações completas (1 a 5 estrelas, barbeiro e serviço).
  - Redes sociais (botões de compartilhamento e feed Instagram).
  - Blog com os 3 artigos iniciais sugeridos e leitor de artigos.
  - Integração com Google Calendar e Google Tasks.
