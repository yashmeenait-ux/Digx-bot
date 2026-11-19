
/* DigX Voice Bot — Website interactions */
(() => {
  'use strict';

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  // =====================================
  // 1. MOBILE NAVIGATION
  // =====================================

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
      const isOpen =
        burger.getAttribute('aria-expanded') !== 'true';

      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute(
        'aria-label',
        isOpen ? 'Close menu' : 'Open menu'
      );

      menu.classList.toggle('open', isOpen);
    });

    $$('a', menu).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', event => {
      if (
        !menu.contains(event.target) &&
        !burger.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  // =====================================
  // 2. HEADER SCROLL EFFECT
  // =====================================

  const nav = $('#nav');

  const navLinks = $$('#menu a[href^="#"]');

  const sections = navLinks
    .map(link => $(link.getAttribute('href')))
    .filter(Boolean);

  const updateHeader = () => {
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    }
  };

  updateHeader();

  window.addEventListener('scroll', updateHeader, {
    passive: true
  });

  // Active navigation section

  if (
    'IntersectionObserver' in window &&
    sections.length
  ) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          navLinks.forEach(link => {
            const active =
              link.getAttribute('href') ===
              `#${entry.target.id}`;

            link.classList.toggle('active', active);
          });
        });
      },
      {
        rootMargin: '-25% 0px -65% 0px',
        threshold: 0
      }
    );

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // =====================================
  // 3. LOGO FALLBACK
  // =====================================

  $$('img[data-logo]').forEach(img => {
    img.addEventListener(
      'error',
      () => {
        img.hidden = true;

        const fallback =
          img.parentElement?.querySelector('.logo-fallback');

        if (fallback) fallback.hidden = false;
      },
      { once: true }
    );
  });

  // =====================================
  // 4. SCROLL REVEAL ANIMATIONS
  // =====================================

  const revealTargets = $$(
    '.section-heading, .journey-card, .process-card, ' +
    '.industry-grid article, .integration-grid > div, ' +
    '.security-grid article, .quality-features article, ' +
    '.faq-list details'
  );

  if ('IntersectionObserver' in window) {
    revealTargets.forEach(element => {
      element.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach(element => {
      revealObserver.observe(element);
    });
  }

  // =====================================
  // 5. CUSTOMER JOURNEY TABS
  // =====================================

  const journeyContent = {
    acquire: {
      title: 'Acquire new customers',

      intro:
        'Start useful conversations with prospective customers and help them take the next step.',

      cards: [
        [
          'Lead qualification',
          'Ask relevant questions, understand customer needs and identify qualified leads.'
        ],
        [
          'Enquiry handling',
          'Answer common product and service questions with approved information.'
        ],
        [
          'Appointment booking',
          'Help customers request a callback, consultation or appointment.'
        ]
      ]
    },

    engage: {
      title: 'Engage every customer',

      intro:
        'Keep customers informed with timely, helpful conversations across their journey.',

      cards: [
        [
          'Welcome journeys',
          'Introduce services and guide customers through their first steps.'
        ],
        [
          'Reminders and updates',
          'Share relevant reminders and status updates through configured workflows.'
        ],
        [
          'Feedback collection',
          'Gather customer feedback and route important responses for review.'
        ]
      ]
    },

    support: {
      title: 'Support customers faster',

      intro:
        'Make common support journeys easier while keeping a path open to human assistance.',

      cards: [
        [
          'Frequently asked questions',
          'Respond to common questions using approved knowledge.'
        ],
        [
          'Service requests',
          'Capture request details and pass them to the appropriate support workflow.'
        ],
        [
          'Human escalation',
          'Identify conversations that need a person and support a handoff where configured.'
        ]
      ]
    },

    recover: {
      title: 'Recover and reconnect',

      intro:
        'Use thoughtful follow-ups to help resolve pending actions and reconnect with customers.',

      cards: [
        [
          'Payment reminders',
          'Remind customers about pending payments using approved scripts and timing.'
        ],
        [
          'Renewal outreach',
          'Support renewal reminders and capture a customer’s response.'
        ],
        [
          'Service recovery',
          'Collect concerns and direct unresolved issues to the right team.'
        ]
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

        item.setAttribute(
          'aria-selected',
          String(active)
        );
      });

      renderJourney(key);
    });
  });

  if (journeyTabs.length) {
    const initialJourney =
      journeyTabs.find(tab =>
        tab.classList.contains('active')
      )?.dataset.journey || 'acquire';

    renderJourney(initialJourney);
  }

  // Part 2 continues below.

  // =====================================
  // 6. SAMPLE CONVERSATIONS
  // =====================================

  const scenarios = [
    {
      label: 'Order status',

      lines: [
        [
          'DigX Voice Bot',
          'Hello! I am the automated assistant. How can I help you today?'
        ],
        [
          'Customer',
          'I would like to check the status of my order.'
        ],
        [
          'DigX Voice Bot',
          'Certainly. I can help with that. May I have your order reference?'
        ],
        [
          'Customer',
          'It is order one two three four.'
        ],
        [
          'DigX Voice Bot',
          'Thank you. In a connected deployment, I would check the order system and share the latest status.'
        ]
      ]
    },

    {
      label: 'Appointment',

      lines: [
        [
          'DigX Voice Bot',
          'Welcome to the appointment desk. How may I assist you?'
        ],
        [
          'Customer',
          'I want to book an appointment.'
        ],
        [
          'DigX Voice Bot',
          'I can help capture your preferred date and time. Which day works best for you?'
        ],
        [
          'Customer',
          'Friday afternoon.'
        ],
        [
          'DigX Voice Bot',
          'Thank you. A connected scheduling system can check availability and confirm the appointment.'
        ]
      ]
    },

    {
      label: 'Payment reminder',

      lines: [
        [
          'DigX Voice Bot',
          'Hello. This is an automated reminder. Is now a good time to talk?'
        ],
        [
          'Customer',
          'Yes, please go ahead.'
        ],
        [
          'DigX Voice Bot',
          'This is a reminder about a pending payment. Please use only the official payment channel shared by your provider.'
        ],
        [
          'Customer',
          'Can I speak to someone?'
        ],
        [
          'DigX Voice Bot',
          'Of course. A configured workflow can connect you to the support team.'
        ]
      ]
    }
  ];

  const demoTabs = $('#demoTabs');
  const conversation = $('#conversation');
  const playBtn = $('#playBtn');
  const stopBtn = $('#stopBtn');

  let activeScenario = 0;
  let utteranceQueue = [];
  let playbackId = 0;

  // =====================================
  // 7. STOP SPEECH PLAYBACK
  // =====================================

  const stopSpeech = () => {
    playbackId++;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    utteranceQueue = [];

    if (playBtn) {
      playBtn.disabled = false;
    }
  };

  // =====================================
  // 8. DISPLAY CONVERSATION
  // =====================================

  const renderConversation = scenario => {
    if (!conversation) return;

    conversation.replaceChildren();

    scenario.lines.forEach(([speaker, words]) => {
      const line = document.createElement('div');

      line.className =
        `chat-line ${speaker === 'Customer' ? 'user' : ''}`.trim();

      const name = document.createElement('small');
      name.textContent = speaker.toUpperCase();

      const message = document.createElement('p');
      message.textContent = words;

      line.append(name, message);

      conversation.append(line);
    });
  };

  // =====================================
  // 9. CREATE SCENARIO TABS
  // =====================================

  if (demoTabs) {
    scenarios.forEach((scenario, index) => {
      const button = document.createElement('button');

      button.type = 'button';

      button.className =
        `tab${index === 0 ? ' active' : ''}`;

      button.setAttribute('role', 'tab');

      button.setAttribute(
        'aria-selected',
        String(index === 0)
      );

      button.setAttribute(
        'tabindex',
        index === 0 ? '0' : '-1'
      );

      button.textContent = scenario.label;

      button.addEventListener('click', () => {
        stopSpeech();

        activeScenario = index;

        $$('.tab', demoTabs).forEach((tab, tabIndex) => {
          const selected = tabIndex === index;

          tab.classList.toggle('active', selected);

          tab.setAttribute(
            'aria-selected',
            String(selected)
          );

          tab.setAttribute(
            'tabindex',
            selected ? '0' : '-1'
          );
        });

        if (conversation) {
          conversation.replaceChildren();

          const message = document.createElement('div');

          message.className = 'conversation-empty';

          message.textContent =
            'Press “Play sample conversation” to hear this scenario.';

          conversation.append(message);
        }
      });

      demoTabs.append(button);
    });
  }

  // =====================================
  // 10. PLAY SAMPLE CONVERSATION
  // =====================================

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      stopSpeech();

      const scenario = scenarios[activeScenario];

      renderConversation(scenario);

      // Check browser speech support

      if (
        !('speechSynthesis' in window) ||
        !('SpeechSynthesisUtterance' in window)
      ) {
        if (conversation) {
          const note = document.createElement('p');

          note.className = 'fineprint';

          note.textContent =
            'Speech playback is not available in this browser. The sample transcript is shown above.';

          conversation.append(note);
        }

        return;
      }

      const currentPlayback = playbackId;

      playBtn.disabled = true;

      utteranceQueue = scenario.lines.map(
        ([speaker, words], index) => {
          const utterance = new SpeechSynthesisUtterance(
            `${speaker}: ${words}`
          );

          utterance.lang = 'en-IN';
          utterance.rate = 0.96;
          utterance.pitch = 1;

          utterance.onend = () => {
            if (currentPlayback !== playbackId) return;

            if (utteranceQueue[index] === utterance) {
              utteranceQueue[index] = null;
            }

            if (
              index === scenario.lines.length - 1
            ) {
              utteranceQueue = [];

              playBtn.disabled = false;
            }
          };

          utterance.onerror = () => {
            if (currentPlayback !== playbackId) return;

            stopSpeech();
          };

          return utterance;
        }
      );

      utteranceQueue.forEach(utterance => {
        window.speechSynthesis.speak(utterance);
      });
    });
  }

  // =====================================
  // 11. STOP BUTTON
  // =====================================

  if (stopBtn) {
    stopBtn.addEventListener('click', stopSpeech);
  }

  // Stop speech when leaving the page

  window.addEventListener('beforeunload', stopSpeech);

  // Part 3 continues below.

  // =====================================
  // 12. CLOSE WEBSITE INTERACTIONS
  // =====================================

})();


/*
 * DigX Voice Bot — browser-only demo request form.
 * No backend, API, database or actual phone call.
 * Daily limit is stored in this browser only.
 */

(() => {
  'use strict';

  // =====================================
  // 13. SELECT FORM ELEMENTS
  // =====================================

  const form = document.getElementById('callRequestForm');

  if (!form) return;

  const country = document.getElementById('countryCode');
  const phone = document.getElementById('phoneNumber');
  const consent = document.getElementById('callConsent');
  const button = document.getElementById('callSubmit');
  const feedback = document.getElementById('callFeedback');

  if (!country || !phone || !consent || !button || !feedback) {
    return;
  }

  const buttonText = button.querySelector('.call-button-text');

  const LIMIT = 2;

  const STORAGE_KEY = 'digx_frontend_demo_requests_v1';

  const originalButtonText =
    buttonText?.textContent || 'Try Our Agent';

  let submitting = false;

  // =====================================
  // 14. GET TODAY'S DATE IN INDIA
  // =====================================

  const todayInIndia = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());

    const values = Object.fromEntries(
      parts.map(part => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}`;
  };

  // =====================================
  // 15. HASH PHONE NUMBER FOR STORAGE KEY
  // =====================================

  const numberKey = value => {
    let hash = 2166136261;

    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);

      hash = Math.imul(hash, 16777619);
    }

    return (hash >>> 0).toString(16);
  };

  // =====================================
  // 16. READ LOCAL STORAGE
  // =====================================

  const readUsage = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || 'null'
      );

      if (
        saved &&
        saved.date === todayInIndia() &&
        saved.numbers &&
        typeof saved.numbers === 'object' &&
        !Array.isArray(saved.numbers)
      ) {
        return saved;
      }
    } catch (error) {
      console.warn('Could not read demo request storage:', error);
    }

    return {
      date: todayInIndia(),
      numbers: {}
    };
  };

  // =====================================
  // 17. SAVE LOCAL STORAGE
  // =====================================

  const saveUsage = usage => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(usage)
      );

      return true;
    } catch (error) {
      console.error('Could not save demo request:', error);

      return false;
    }
  };

  // =====================================
  // 18. VALIDATE INDIAN MOBILE NUMBER
  // =====================================

  const cleanIndianMobile = raw => {
    let digits = String(raw || '').replace(/\D/g, '');

    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }

    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    return /^[6-9]\d{9}$/.test(digits)
      ? digits
      : null;
  };

  // =====================================
// 19. SHOW TEMPORARY POPUP MESSAGE
// =====================================

const showPopup = message => {
  let popup = document.getElementById('thankYouPopup');

  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'thankYouPopup';
    popup.className = 'thank-you-popup';
    document.body.appendChild(popup);
  }

  popup.textContent = message;
  popup.classList.add('show');

  clearTimeout(popup.hideTimer);

  popup.hideTimer = setTimeout(() => {
    popup.classList.remove('show');
  }, 3500);
};

  // =====================================
  // 20. FIELD VALIDATION STYLE
  // =====================================

  const setInvalid = (element, invalid) => {
    if (invalid) {
      element.setAttribute('aria-invalid', 'true');
    } else {
      element.removeAttribute('aria-invalid');
    }
  };

  // =====================================
  // 21. BUTTON LOADING STATE
  // =====================================

  const setBusy = busy => {
    submitting = busy;

    button.disabled = busy;

    button.classList.toggle('loading', busy);

    if (busy) {
      button.setAttribute('aria-busy', 'true');
    } else {
      button.removeAttribute('aria-busy');
    }

    if (buttonText) {
      buttonText.textContent = busy
        ? 'Saving request…'
        : originalButtonText;
    }
  };

  // =====================================
  // 22. PHONE INPUT EVENT
  // =====================================

  phone.addEventListener('input', () => {
    // Allow digits only and maximum 10 digits
    phone.value = phone.value.replace(/\D/g, '').slice(0, 10);
  
    // First digit cannot be 0
    if (phone.value.startsWith('0')) {
      phone.value = phone.value.slice(1);
    }
  
    setInvalid(phone, false);
  });
  // =====================================
  // 23. COUNTRY CODE EVENT
  // =====================================

  country.addEventListener('change', () => {
    const valid = country.value === '+91';

    setInvalid(country, !valid);

    if (!valid) {
      show(
        'This form currently accepts Indian mobile numbers only (+91).',
        'error'
      );
    } else {
      show('');
    }
  });

  // =====================================
  // 24. FORM SUBMISSION
  // =====================================

 // =====================================
// 24. FORM SUBMISSION
// =====================================

form.addEventListener('submit', event => {
  event.preventDefault();

  if (submitting) return;

  setInvalid(country, false);
  setInvalid(phone, false);

  // Validate country code

  if (country.value !== '+91') {
    setInvalid(country, true);
    show('Please select India (+91).', 'error');
    country.focus();
    return;
  }

  // Validate mobile number

  const mobile = cleanIndianMobile(phone.value);

  if (!mobile) {
    setInvalid(phone, true);

    show(
      'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.',
      'error'
    );

    phone.focus();
    return;
  }

  // Validate consent

  if (!consent.checked) {
    show('Please provide consent before continuing.', 'error');
    consent.focus();
    return;
  }

  // Prepare number and usage record

  const fullNumber = `+91${mobile}`;
  const key = numberKey(fullNumber);
  const usage = readUsage();

  const used = Number(usage.numbers[key] || 0);

  // Third request: show temporary message

  if (used >= LIMIT) {
    showPopup('Please try again tomorrow.');
    return;
  }

  // Save request count

  setBusy(true);

  usage.numbers[key] = used + 1;

  const saved = saveUsage(usage);

  setBusy(false);

  if (!saved) {
    show(
      'Unable to save your request. Please try again.',
      'error'
    );
    return;
  }

  // First and second requests: success popup

  showPopup('Demo request submitted successfully.');

  phone.value = '';
  setInvalid(phone, false);
});
    
  // =====================================
  // 24. FORM SUBMISSION
  // =====================================

  form.addEventListener('submit', event => {
    event.preventDefault();

    if (submitting) return;

    setInvalid(country, false);
    setInvalid(phone, false);

    // Validate country code
    if (country.value !== '+91') {
      setInvalid(country, true);
      show('Please select India (+91).', 'error');
      country.focus();
      return;
    }

    // Validate mobile number
    const mobile = cleanIndianMobile(phone.value);

    if (!mobile) {
      setInvalid(phone, true);
      show(
        'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.',
        'error'
      );
      phone.focus();
      return;
    }

    // Validate consent
    if (!consent.checked) {
      show('Please provide consent before continuing.', 'error');
      consent.focus();
      return;
    }

    // Get request usage
    const fullNumber = `+91${mobile}`;
    const key = numberKey(fullNumber);
    const usage = readUsage();

    const used = Number(usage.numbers[key] || 0);

    // Third request and onwards
    if (used >= LIMIT) {
      showPopup('Please try again tomorrow.');
      return;
    }

    // Save request count
    setBusy(true);

    usage.numbers[key] = used + 1;

    const saved = saveUsage(usage);

    setBusy(false);

    if (!saved) {
      show('Unable to save your request. Please try again.', 'error');
      return;
    }

    // First and second requests
    showPopup('Demo request submitted successfully.');

    phone.value = '';
    setInvalid(phone, false);
  });

})();
