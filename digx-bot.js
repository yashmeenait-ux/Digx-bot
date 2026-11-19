/* DigX Voice Bot site interactions — vanilla JavaScript only. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Mobile navigation
  const burger = $('#burger');
  const menu = $('#menu');
  const closeMenu = () => {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    menu.classList.remove('open');
  };
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('open', open);
    });
    $$('a', menu).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target) && !burger.contains(event.target)) closeMenu();
    });
  }

  // Header scroll state and active section navigation
  const nav = $('#nav');
  const navLinks = $$('#menu a[href^="#"]');
  const sections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  const updateHeader = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          if (active) link.classList.add('active');
          else link.classList.remove('active');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Logo fallback if the remote logo cannot be loaded
  $$('img[data-logo]').forEach(img => {
    img.addEventListener('error', () => {
      img.hidden = true;
      const fallback = img.parentElement?.querySelector('.logo-fallback');
      if (fallback) fallback.hidden = false;
    }, { once: true });
  });

  // Subtle reveal effect, with a no-observer fallback that leaves content visible
  const revealTargets = $$('.section-heading, .journey-card, .process-card, .industry-grid article, .integration-grid > div, .security-grid article, .quality-features article, .faq-list details');
  if ('IntersectionObserver' in window) {
    revealTargets.forEach(element => element.classList.add('reveal'));
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(element => revealObserver.observe(element));
  }

  // Customer journey tabs
  const journeyContent = {
    acquire: {
      title: 'Acquire new customers',
      intro: 'Start useful conversations with prospective customers and help them take the next step.',
      cards: [
        ['Lead qualification', 'Ask relevant questions, understand customer needs and identify qualified leads.'],
        ['Enquiry handling', 'Answer common product and service questions with approved information.'],
        ['Appointment booking', 'Help customers request a callback, consultation or appointment.']
      ]
    },
    engage: {
      title: 'Engage every customer',
      intro: 'Keep customers informed with timely, helpful conversations across their journey.',
      cards: [
        ['Welcome journeys', 'Introduce services and guide customers through their first steps.'],
        ['Reminders and updates', 'Share relevant reminders and status updates through configured workflows.'],
        ['Feedback collection', 'Gather customer feedback and route important responses for review.']
      ]
    },
    support: {
      title: 'Support customers faster',
      intro: 'Make common support journeys easier while keeping a path open to human assistance.',
      cards: [
        ['Frequently asked questions', 'Respond to common questions using approved knowledge.'],
        ['Service requests', 'Capture request details and pass them to the appropriate support workflow.'],
        ['Human escalation', 'Identify conversations that need a person and support a handoff where configured.']
      ]
    },
    recover: {
      title: 'Recover and reconnect',
      intro: 'Use thoughtful follow-ups to help resolve pending actions and reconnect with customers.',
      cards: [
        ['Payment reminders', 'Remind customers about pending payments using approved scripts and timing.'],
        ['Renewal outreach', 'Support renewal reminders and capture a customer’s response.'],
        ['Service recovery', 'Collect concerns and direct unresolved issues to the right team.']
      ]
    }
  };
  const journeyPanel = $('#journeyPanel');
  const journeyTabs = $$('[data-journey]');
  const renderJourney = key => {
    if (!journeyPanel || !journeyContent[key]) return;
    const data = journeyContent[key];
    journeyPanel.replaceChildren();
    const heading = document.createElement('div');
    heading.className = 'journey-panel-heading';
    const h3 = document.createElement('h3');
    h3.textContent = data.title;
    const p = document.createElement('p');
    p.textContent = data.intro;
    heading.append(h3, p);
    const grid = document.createElement('div');
    grid.className = 'journey-grid';
    data.cards.forEach(([title, description], index) => {
      const article = document.createElement('article');
      article.className = 'journey-card';
      const number = document.createElement('span');
      number.className = 'journey-number';
      number.textContent = `0${index + 1}`;
      const cardTitle = document.createElement('h3');
      cardTitle.textContent = title;
      const cardText = document.createElement('p');
      cardText.textContent = description;
      article.append(number, cardTitle, cardText);
      grid.append(article);
    });
    journeyPanel.append(heading, grid);
  };
  journeyTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.journey;
      journeyTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      renderJourney(key);
    });
  });
  if (journeyTabs.length) renderJourney(journeyTabs.find(tab => tab.classList.contains('active'))?.dataset.journey || 'acquire');

  // Sample conversations use the browser's built-in speech synthesis (not a real call).
  const scenarios = [
    {
      label: 'Order status',
      lines: [
        ['DigX Voice Bot', 'Hello! I am the automated assistant. How can I help you today?'],
        ['Customer', 'I would like to check the status of my order.'],
        ['DigX Voice Bot', 'Certainly. I can help with that. May I have your order reference?'],
        ['Customer', 'It is order one two three four.'],
        ['DigX Voice Bot', 'Thank you. In a connected deployment, I would check the order system and share the latest status.']
      ]
    },
    {
      label: 'Appointment',
      lines: [
        ['DigX Voice Bot', 'Welcome to the appointment desk. How may I assist you?'],
        ['Customer', 'I want to book an appointment.'],
        ['DigX Voice Bot', 'I can help capture your preferred date and time. Which day works best for you?'],
        ['Customer', 'Friday afternoon.'],
        ['DigX Voice Bot', 'Thank you. A connected scheduling system can check availability and confirm the appointment.']
      ]
    },
    {
      label: 'Payment reminder',
      lines: [
        ['DigX Voice Bot', 'Hello. This is an automated reminder. Is now a good time to talk?'],
        ['Customer', 'Yes, please go ahead.'],
        ['DigX Voice Bot', 'This is a reminder about a pending payment. Please use only the official payment channel shared by your provider.'],
        ['Customer', 'Can I speak to someone?'],
        ['DigX Voice Bot', 'Of course. A configured workflow can connect you to the support team.']
      ]
    }
  ];
  const demoTabs = $('#demoTabs');
  const conversation = $('#conversation');
  const playBtn = $('#playBtn');
  const stopBtn = $('#stopBtn');
  let activeScenario = 0;
  let utteranceQueue = [];
  const stopSpeech = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    utteranceQueue = [];
    if (playBtn) playBtn.disabled = false;
  };
  const renderConversation = scenario => {
    if (!conversation) return;
    conversation.replaceChildren();
    scenario.lines.forEach(([speaker, words]) => {
      const line = document.createElement('div');
      line.className = `chat-line ${speaker === 'Customer' ? 'user' : ''}`.trim();
      const name = document.createElement('small');
      name.textContent = speaker.toUpperCase();
      const message = document.createElement('p');
      message.textContent = words;
      line.append(name, message);
      conversation.append(line);
    });
  };
  if (demoTabs) {
    scenarios.forEach((scenario, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `tab${index === 0 ? ' active' : ''}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', String(index === 0));
      button.textContent = scenario.label;
      button.addEventListener('click', () => {
        stopSpeech();
        activeScenario = index;
        $$('.tab', demoTabs).forEach((tab, tabIndex) => {
          tab.classList.toggle('active', tabIndex === index);
          tab.setAttribute('aria-selected', String(tabIndex === index));
        });
        if (conversation) conversation.innerHTML = '<div class="conversation-empty">Press “Play sample conversation” to hear this scenario.</div>';
      });
      demoTabs.append(button);
    });
  }
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      stopSpeech();
      const scenario = scenarios[activeScenario];
      renderConversation(scenario);
      if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
        if (conversation) {
          const note = document.createElement('p');
          note.className = 'fineprint';
          note.textContent = 'Speech playback is not available in this browser. The sample transcript is shown above.';
          conversation.append(note);
        }
        return;
      }
      playBtn.disabled = true;
      utteranceQueue = scenario.lines.map(([speaker, words]) => {
        const utterance = new SpeechSynthesisUtterance(`${speaker}: ${words}`);
        utterance.lang = 'en-IN';
        utterance.rate = 0.96;
        utterance.onend = () => {
          if (utteranceQueue[0] === utterance) utteranceQueue.shift();
          if (!utteranceQueue.length && playBtn) playBtn.disabled = false;
        };
        utterance.onerror = () => { stopSpeech(); };
        return utterance;
      });
      utteranceQueue.forEach(utterance => window.speechSynthesis.speak(utterance));
    });
  }
  if (stopBtn) stopBtn.addEventListener('click', stopSpeech);
  window.addEventListener('beforeunload', stopSpeech);
})();

/*
 * DigX Voice Bot — browser-only demo request form.
 * No API, backend, Node.js, database, or real phone call is used.
 * The daily limit is a convenience restriction in this browser only.
 */
(() => {
  'use strict';

  const form = document.getElementById('callRequestForm');
  if (!form) return;

  const country = document.getElementById('countryCode');
  const phone = document.getElementById('phoneNumber');
  const consent = document.getElementById('callConsent');
  const button = document.getElementById('callSubmit');
  const buttonText = button?.querySelector('.call-button-text');
  const feedback = document.getElementById('callFeedback');
  if (!country || !phone || !consent || !button || !feedback) return;

  const LIMIT = 2;
  const STORAGE_KEY = 'digx_frontend_demo_requests_v1';
  const originalButtonText = buttonText?.textContent || 'Save Demo Request';
  let submitting = false;

  const todayInIndia = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };

  // This is a local lookup key, not a security feature or encryption.
  const numberKey = value => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  };

  const readUsage = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && saved.date === todayInIndia() && saved.numbers && typeof saved.numbers === 'object') return saved;
    } catch (_) { /* Storage can be disabled or unavailable. */ }
    return { date: todayInIndia(), numbers: {} };
  };

  const saveUsage = usage => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
      return true;
    } catch (_) {
      return false;
    }
  };

  const cleanIndianMobile = raw => {
    let digits = String(raw || '').replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return /^[6-9]\d{9}$/.test(digits) ? digits : null;
  };

  const show = (message, type = '') => {
    feedback.textContent = message;
    feedback.className = `call-feedback ${type}`.trim();
    if (type) feedback.dataset.state = type;
    else delete feedback.dataset.state;
  };

  const setInvalid = (element, invalid) => {
    if (invalid) element.setAttribute('aria-invalid', 'true');
    else element.removeAttribute('aria-invalid');
  };

  const setBusy = busy => {
    submitting = busy;
    button.disabled = busy;
    button.classList.toggle('loading', busy);
    if (busy) button.setAttribute('aria-busy', 'true');
    else button.removeAttribute('aria-busy');
    if (buttonText) buttonText.textContent = busy ? 'Saving request…' : originalButtonText;
  };

  const currentCount = fullNumber => {
    const usage = readUsage();
    return Number(usage.numbers[numberKey(fullNumber)] || 0);
  };

  phone.addEventListener('input', () => {
    phone.value = phone.value.replace(/[^\d\s+().-]/g, '');
    setInvalid(phone, false);
    if (feedback.dataset.state === 'error') show('');
  });

  country.addEventListener('change', () => {
    setInvalid(country, country.value !== '+91');
    if (country.value !== '+91') show('This demo request form currently accepts Indian mobile numbers only (+91).', 'error');
    else show('');
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (submitting) return;
    setInvalid(country, false);
    setInvalid(phone, false);

    if (country.value !== '+91') {
      setInvalid(country, true);
      show('Please select India (+91).', 'error');
      country.focus();
      return;
    }

    const mobile = cleanIndianMobile(phone.value);
    if (!mobile) {
      setInvalid(phone, true);
      show('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.', 'error');
      phone.focus();
      return;
    }

    if (!consent.checked) {
      show('Please provide consent before saving your demo request.', 'error');
      consent.focus();
      return;
    }

    const fullNumber = `+91${mobile}`;
    const key = numberKey(fullNumber);
    const usage = readUsage();
    const used = Number(usage.numbers[key] || 0);
    if (used >= LIMIT) {
      setInvalid(phone, true);
      show('This browser has already saved 2 demo requests for this number today. Please try again after midnight India time.', 'error');
      return;
    }

    setBusy(true);
    usage.numbers[key] = used + 1;
    const saved = saveUsage(usage);
    setBusy(false);

    if (!saved) {
      show('Your browser could not save this request. Please enable site storage and try again. No phone call was placed.', 'error');
      return;
    }

    const remaining = LIMIT - usage.numbers[key];
    show(`Your demo request was recorded in this browser. ${remaining} request${remaining === 1 ? '' : 's'} remaining for this number today. No phone call was placed because no calling service is connected.`, 'success');
    phone.value = '';
    consent.checked = false;
  });
})();
