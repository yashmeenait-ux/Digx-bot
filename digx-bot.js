(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Logo fallback
  $$('[data-logo]').forEach(img => {
    const fallback = img.nextElementSibling;
    const fail = () => { img.hidden = true; if (fallback) fallback.hidden = false; };
    img.addEventListener('error', fail, { once: true });
    if (img.complete && !img.naturalWidth) fail();
  });

  // Mobile navigation
  const burger = $('#burger'), menu = $('#menu');
  if (burger && menu) {
    const closeMenu = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); };
    burger.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('click', e => { if (menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  // Scroll reveal
  const revealTargets = $$(' .process-card, .industry-grid article, .integration-grid > div, .quality-features article, .security-grid article, .section-heading, .voice-card, .voice-core');
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
    revealTargets.forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  }

  // Animated wave bars
  $$('.wave').forEach(wave => {
    wave.innerHTML = '<i></i>'.repeat(Number(wave.dataset.n) || 20);
    [...wave.children].forEach((bar, i) => { bar.style.animationDelay = `${(i % 7) * -0.13}s`; });
  });

  // Customer journey tabs
  const journeys = {
    acquire: [
      ['Lead qualification', 'Contact new leads, ask relevant questions and identify prospects ready for a sales conversation.'],
      ['Inbound enquiries', 'Respond to product, pricing and eligibility questions using approved business information.'],
      ['Appointment booking', 'Help customers request, confirm or reschedule appointments when calendar integration is available.'],
      ['Campaign outreach', 'Support personalised outbound campaigns at scale, subject to consent and contact policies.']
    ],
    engage: [
      ['Onboarding and KYC reminders', 'Guide customers through activation steps and required information.'],
      ['Renewals and upsell', 'Remind customers about upcoming renewals and explain relevant upgrade options.'],
      ['Feedback and NPS surveys', 'Collect customer feedback through a natural spoken conversation.'],
      ['Win-back conversations', 'Reconnect with inactive customers using relevant, approved offers.']
    ],
    support: [
      ['L0/L1 query resolution', 'Answer routine questions such as order status, account information and frequently asked questions.'],
      ['Complaint registration', 'Capture issue details and create a service request when connected to the relevant system.'],
      ['Smart routing', 'Identify conversations that need specialist attention and route them to a human team.'],
      ['After-hours assistance', 'Provide an automated first point of contact outside regular service hours.']
    ],
    recover: [
      ['Payment reminders', 'Support approved pre-due and post-due payment reminder journeys.'],
      ['Collections conversations', 'Capture customer responses and agreed next steps within approved policies.'],
      ['COD confirmation', 'Confirm cash-on-delivery orders before dispatch where connected to the commerce workflow.'],
      ['Verification calls', 'Help verify delivery details or other information using approved processes.']
    ]
  };
  const journeyPanel = $('#journeyPanel');
  const renderJourney = key => {
    if (!journeyPanel || !journeys[key]) return;
    journeyPanel.innerHTML = journeys[key].map((item, i) => `<article class="journey-card"><span>0${i + 1}</span><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('');
    $$('.journey-tabs .tab').forEach(btn => { const active = btn.dataset.journey === key; btn.classList.toggle('active', active); btn.setAttribute('aria-selected', String(active)); });
  };
  $$('.journey-tabs [data-journey]').forEach(btn => btn.addEventListener('click', () => renderJourney(btn.dataset.journey)));
  renderJourney('acquire');

  // Local browser-only demo. No API and no outbound calls.
  const scenarios = {
    support: { label: 'Customer support', lines: [['bot', 'Hello! You are speaking with the sample DigX Voice Bot. How can I help?'], ['user', 'I want to check my order.'], ['bot', 'Certainly. In a connected solution, I could look up your order details. This is a sample interaction.']] },
    appointment: { label: 'Appointment booking', lines: [['bot', 'Hello! Would you like help with an appointment?'], ['user', 'I would like to book a visit.'], ['bot', 'I can help collect your preferred date and time. A live booking would require a calendar connection.']] },
    payment: { label: 'Payment reminder', lines: [['bot', 'Hello. This is a sample payment reminder conversation.'], ['user', 'Can I make the payment tomorrow?'], ['bot', 'I can record your response in this demonstration. A live workflow would follow your approved payment process.']] },
    lead: { label: 'Lead qualification', lines: [['bot', 'Hello! Thank you for your interest. What are you looking for today?'], ['user', 'I want to learn about voice automation.'], ['bot', 'Thank you. A connected solution could capture your requirements and arrange a follow-up.']] }
  };
  const tabs = $('#demoTabs'), conversation = $('#conversation'), playBtn = $('#playBtn'), stopBtn = $('#stopBtn'), wave = $('#demoWave');
  let selected = 'support', playbackId = 0;
  if (tabs) {
    tabs.innerHTML = Object.entries(scenarios).map(([key, value]) => `<button type="button" class="tab ${key === selected ? 'active' : ''}" role="tab" aria-selected="${key === selected}" data-scenario="${key}">${value.label}</button>`).join('');
    tabs.addEventListener('click', e => { const btn = e.target.closest('[data-scenario]'); if (btn) { selected = btn.dataset.scenario; stopPlayback(); updateTabs(); if (conversation) conversation.innerHTML = '<div class="conversation-empty">Press “Play sample conversation” to hear this scenario.</div>'; } });
  }
  const updateTabs = () => $$('#demoTabs [data-scenario]').forEach(btn => { const active = btn.dataset.scenario === selected; btn.classList.toggle('active', active); btn.setAttribute('aria-selected', String(active)); });
  const addLine = (who, text) => {
    const row = document.createElement('div'); row.className = `chat-line ${who}`;
    const label = document.createElement('small'); label.textContent = who === 'bot' ? 'DIGX VOICE BOT · SAMPLE' : 'CUSTOMER · SAMPLE';
    const bubble = document.createElement('p'); bubble.textContent = text;
    row.append(label, bubble); conversation.appendChild(row); conversation.scrollTop = conversation.scrollHeight;
  };
  const speak = text => new Promise(resolve => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { window.setTimeout(resolve, Math.min(2200, 450 + text.length * 24)); return; }
    const utterance = new SpeechSynthesisUtterance(text); utterance.rate = 0.96; utterance.pitch = 1.02;
    utterance.onend = resolve; utterance.onerror = resolve; window.speechSynthesis.speak(utterance);
  });
  function stopPlayback() { playbackId++; if ('speechSynthesis' in window) window.speechSynthesis.cancel(); if (wave) wave.classList.remove('playing'); if (playBtn) playBtn.disabled = false; }
  if (playBtn) playBtn.addEventListener('click', async () => {
    stopPlayback(); const thisRun = ++playbackId; if (conversation) conversation.innerHTML = '';
    if (wave) wave.classList.add('playing'); playBtn.disabled = true;
    for (const [who, text] of scenarios[selected].lines) {
      if (thisRun !== playbackId) return;
      addLine(who, text); if (who === 'bot') await speak(text); else await new Promise(resolve => window.setTimeout(resolve, 450));
    }
    if (thisRun === playbackId) { if (wave) wave.classList.remove('playing'); playBtn.disabled = false; }
  });
  if (stopBtn) stopBtn.addEventListener('click', stopPlayback);
  window.addEventListener('pagehide', stopPlayback);
})();
/* DigX Voice Bot — ICCS motion add-on. Load AFTER digx-bot.js (both with defer).
   Additive only: no existing listener, ID or form behaviour is touched. */
   (() => {
    'use strict';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = document.getElementById('nav');
  
    // Sticky header: compact + shadow after scrolling
    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  
    // Active nav link for the section in view
    const links = [...document.querySelectorAll('#menu a[href^="#"]')];
    if ('IntersectionObserver' in window && links.length) {
      const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
      const spy = new IntersectionObserver(entries => entries.forEach(e => {
        const link = map.get(e.target.id);
        if (!link || !e.isIntersecting) return;
        links.forEach(a => { a.classList.remove('active'); a.removeAttribute('aria-current'); });
        link.classList.add('active'); link.setAttribute('aria-current', 'true');
      }), { rootMargin: '-40% 0px -55% 0px' });
      map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
    }
  
    // Stagger sibling reveals (uses the .reveal elements created by digx-bot.js)
    if (!reduced) {
      const seen = new Map();
      document.querySelectorAll('.reveal').forEach(el => {
        const n = seen.get(el.parentElement) || 0;
        seen.set(el.parentElement, n + 1);
        if (n) {
          el.style.transitionDelay = Math.min(n * 70, 350) + 'ms';
          el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
        }
      });
    }
  })();