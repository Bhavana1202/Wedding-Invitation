<script>
  import { onMount } from 'svelte';
  import emailjs from '@emailjs/browser';

  // Vite supplies the correct asset prefix locally and on GitHub Pages.
  const ASSET_BASE = import.meta.env.BASE_URL;

  let opened = $state(false);
  let opening = $state(false);
  let openingTimer;
  // Swipeable wedding invitation booklet
  let bookletPage = $state(0);
  let pageDirection = $state('next');
  let swipeStartX = 0;
  let swipeStartY = 0;
  const LOOP_START = 9; // Start repeat playback at 0:09
   
  function handleMusicEnded() {
    if (!audio) return;

    audio.currentTime = LOOP_START;
    audio.play().catch(() => {
      musicOn = false;
    });
  }
  const totalBookletPages = 5;

  function changeBookletPage(nextPage) {
    if (nextPage < 0 || nextPage >= totalBookletPages) return;

    pageDirection = nextPage > bookletPage ? 'next' : 'previous';
    bookletPage = nextPage;
  }

  function nextBookletPage() {
    changeBookletPage(bookletPage + 1);
  }

  function previousBookletPage() {
    changeBookletPage(bookletPage - 1);
  }

  function bookletPointerDown(event) {
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
  }
  function startWeddingMusic() {
  if (!audio) return;

  audio.currentTime = 0;

  audio.play()
    .then(() => {
      musicOn = true;
    })
    .catch((error) => {
      console.log('Music playback could not start:', error);
      musicOn = false;
    });
  }
  function bookletPointerUp(event) {
    const differenceX = event.clientX - swipeStartX;
    const differenceY = event.clientY - swipeStartY;

    if (
      Math.abs(differenceX) > 55 &&
      Math.abs(differenceX) > Math.abs(differenceY)
    ) {
      if (differenceX < 0) {
        nextBookletPage();
      } else {
        previousBookletPage();
      }
    }
  }

  function openInvitation() {
    if (opening || opened) return;

    // Start music immediately when the visitor taps the envelope
    startWeddingMusic();

    opening = true;

    // Reveal the wedding website after the envelope opens
    openingTimer = setTimeout(() => {
      opened = true;
    }, 1700);
  }
  let menuOpen = $state(false);
  let musicOn = $state(false);
  let guestName = $state('');
  let guestMessage = $state('');
  let wishes = $state([]);
  let wishSending = $state(false);
  let wishSent = $state(false);
  let wishError = $state('');

  // RSVP form
  let rsvpName = $state('');
  let rsvpPhone = $state('');
  let rsvpAttendance = $state('yes');
  let rsvpGuests = $state('1');
  let rsvpMessage = $state('');
  let rsvpSubmitted = $state(false);
  let rsvpSending = $state(false);
  let rsvpError = $state('');

  // EmailJS configuration for wedding notifications
  const emailJsServiceId = 'service_t7txtzi';
  const emailJsPublicKey = 'OW47eKwYPATFWI72m';
  const rsvpTemplateId = 'template_0ycvxyo';
  const wishesTemplateId = 'template_uqbdvmo';

  async function submitRsvp() {
    if (!rsvpName.trim() || !rsvpPhone.trim() || rsvpSending) return;

    rsvpSending = true;
    rsvpError = '';

    const submittedAt = new Date();
    const response = {
      name: rsvpName.trim(),
      phone: rsvpPhone.trim(),
      attendance: rsvpAttendance === 'yes' ? 'Joyfully accept' : 'Regretfully decline',
      guests: rsvpAttendance === 'yes' ? Number(rsvpGuests) : 0,
      message: rsvpMessage.trim(),
      date: submittedAt.toLocaleString('en-IN')
    };

    try {
      await emailjs.send(
        emailJsServiceId,
        rsvpTemplateId,
        {
          guest_name: response.name,
          guest_phone: response.phone,
          attendance: response.attendance,
          guest_count: String(response.guests),
          guest_message: response.message || 'No additional message',
          submission_date: response.date
        },
        { publicKey: emailJsPublicKey }
      );

      try {
        const savedResponses = JSON.parse(localStorage.getItem('ml-wedding-rsvps') || '[]');
        savedResponses.unshift(response);
        localStorage.setItem('ml-wedding-rsvps', JSON.stringify(savedResponses));
      } catch (storageError) {
        console.warn('RSVP email sent, but local copy could not be saved:', storageError);
      }

      rsvpSubmitted = true;
    } catch (error) {
      console.error('RSVP email could not be sent:', error);
      rsvpError = 'We could not send your RSVP just now. Please try again in a moment.';
    } finally {
      rsvpSending = false;
    }
  }

  let now = $state(new Date());
  let lightbox = $state('');
  let audio;

  const weddingDate = new Date('2026-12-03T08:10:00+05:30');
  const receptionDate = new Date('2026-12-02T19:00:00+05:30');
  const familyDate = new Date('2026-12-13T12:00:00+05:30');
  const receptionMap = 'https://www.google.com/maps/search/?api=1&query=Sri+Sai+Kalyana+Mantapa+Bagalagunte+Bengaluru';
  const familyMap = 'https://www.google.com/maps/search/?api=1&query=Sri+Ravinandan+Palace+Magadi+Main+Road+Bedarahalli+Bengaluru';
  const dateText = (d) => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const calendarUrl = (title, start, end, location, details) => {
    const fmt = d => d.toISOString().replaceAll('-', '').replaceAll(':', '').replace(/\.\d{3}/, '');
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE'); url.searchParams.set('text', title);
    url.searchParams.set('dates', `${fmt(start)}/${fmt(end)}`); url.searchParams.set('location', location); url.searchParams.set('details', details);
    return url.toString();
  };
  const receptionCalendar = calendarUrl('Reception | Manoj & Lavanya', receptionDate, new Date('2026-12-02T22:00:00+05:30'), 'Sri Sai Kalyana Mantapa, Opp. Bagalagunte Bus Stand, Hesaraghatta Main Road, Bengaluru', 'Reception celebration for Manoj & Lavanya. 7:00 PM onwards.');
  const weddingCalendar = calendarUrl('Muhurtha | Manoj & Lavanya', weddingDate, new Date('2026-12-03T10:00:00+05:30'), 'Sri Sai Kalyana Mantapa, Opp. Bagalagunte Bus Stand, Hesaraghatta Main Road, Bengaluru', 'Muhurtha: 8:10 AM to 9:15 AM. Lagna: Dhanur.');
  const familyCalendar = calendarUrl('Family gathering | Manoj & Lavanya', familyDate, new Date('2026-12-13T15:00:00+05:30'), 'Sri Ravinandan Palace, No. 162, Magadi Main Road, Bedarahalli, Bengaluru', 'Bhojana from 12:00 noon onwards.');

  
onMount(() => {
  try {
    wishes = JSON.parse(localStorage.getItem('ml-wedding-wishes') || '[]');
  } catch {
    wishes = [];
  }

  const timer = setInterval(() => now = new Date(), 1000);

  // Separate decorative layers: neither layer blocks clicks.
  const petalLayer = document.createElement('div');
  petalLayer.className = 'petal-layer';

  const sparkleLayer = document.createElement('div');
  sparkleLayer.className = 'sparkle-layer';

  document.body.append(petalLayer, sparkleLayer);

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  let lastSparkleTime = 0;

  // Small sparkles follow the mouse on desktop devices.
  
function createSparkle(event) {
  // Keep the main sparkle fixed to the pointer at all times.
  const mainCursor = document.querySelector('.custom-sparkle-cursor');
  if (mainCursor) {
    mainCursor.style.left = `${event.clientX}px`;
    mainCursor.style.top = `${event.clientY}px`;
    mainCursor.classList.add('is-visible');
  }

  // Keep the existing smaller trailing sparkles after the invitation opens.
  if (!opened || prefersReducedMotion) return;

  const sparkle = document.createElement('span');
  sparkle.className = 'cursor-sparkle';
  sparkle.textContent = '✦';

  sparkle.style.left = `${event.clientX}px`;
  sparkle.style.top = `${event.clientY}px`;
  sparkle.style.setProperty(
    '--sparkle-size',
    `${10 + Math.random() * 10}px`
  );

  sparkleLayer.appendChild(sparkle);

  sparkle.addEventListener('animationend', () => sparkle.remove(), {
    once: true
  });
}

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', createSparkle, {
      passive: true
    });
  }

  // Soft petals drift down at slightly different speeds.
  const petalCharacters = ['❀', '✿', '❁', '❋'];
  
  const petalColours = [
    // Soft ivory
    '#FBF8EF',
    '#FFFDF8',
    '#F5EFE3',

    // Warm cream
    '#EEE5D5',
    '#E8DDCA',

    // Muted antique gold
    '#D8C49E',
    '#BFA477',
    '#9E8355'
  ];

function createPetal() {
  if (!opened || prefersReducedMotion) return;

  const petal = document.createElement('span');

  const isFabricPetal = Math.random() < 0.65;

  petal.className = isFabricPetal
    ? 'falling-petal fabric-petal'
    : 'falling-petal flower-petal';

  if (!isFabricPetal) {
    petal.textContent =
      petalCharacters[
        Math.floor(Math.random() * petalCharacters.length)
      ];
  }

  petal.style.left = `${Math.random() * 100}%`;

  petal.style.setProperty(
    '--petal-colour',
    petalColours[Math.floor(Math.random() * petalColours.length)]
  );

  petal.style.setProperty(
    '--petal-size',
    `${30 + Math.random() * 22}px`
  );

  petal.style.setProperty(
    '--petal-width',
    `${30 + Math.random() * 20}px`
  );

  petal.style.setProperty(
    '--petal-duration',
    `${12 + Math.random() * 9}s`
  );

  petal.style.setProperty(
    '--petal-drift',
    `${-75 + Math.random() * 150}px`
  );

  petal.style.setProperty(
    '--petal-rotation',
    `${180 + Math.random() * 360}deg`
  );

  petalLayer.appendChild(petal);

  petal.addEventListener('animationend', () => petal.remove(), {
    once: true
  });
}

  const petalTimer = setInterval(createPetal, 900);

  return () => {
    clearInterval(timer);
    clearInterval(petalTimer);
    window.removeEventListener('pointermove', createSparkle);
    petalLayer.remove();
    sparkleLayer.remove();
  };
});

  let remaining = $derived(Math.max(0, weddingDate.getTime() - now.getTime()));
  let days = $derived(Math.floor(remaining / 86400000));
  let hours = $derived(Math.floor((remaining % 86400000) / 3600000));
  let minutes = $derived(Math.floor((remaining % 3600000) / 60000));
  let seconds = $derived(Math.floor((remaining % 60000) / 1000));

  function toggleMusic() {
    if (!audio) return;
    if (musicOn) { audio.pause(); musicOn = false; }
    else { audio.play().then(() => musicOn = true).catch(() => musicOn = false); }
  }
  async function addWish() {
    if (!guestName.trim() || !guestMessage.trim() || wishSending) return;

    wishSending = true;
    wishSent = false;
    wishError = '';

    const name = guestName.trim();
    const message = guestMessage.trim();
    const date = new Date().toLocaleDateString('en-IN');

    try {
      await emailjs.send(
        emailJsServiceId,
        wishesTemplateId,
        {
          guest_name: name,
          guest_message: message
        },
        { publicKey: emailJsPublicKey }
      );

      wishes = [{ name, message, date }, ...wishes].slice(0, 30);
      try {
        localStorage.setItem('ml-wedding-wishes', JSON.stringify(wishes));
      } catch (storageError) {
        console.warn('Wish email sent, but local copy could not be saved:', storageError);
      }

      guestName = '';
      guestMessage = '';
      wishSent = true;
    } catch (error) {
      console.error('Wedding wish email could not be sent:', error);
      wishError = 'Your message could not be sent just now. Please try again in a moment.';
    } finally {
      wishSending = false;
    }
  }

  // Subtle scroll reveal for invitation sections
  function reveal(node) {
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible');
        observer.unobserve(node);
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return { destroy() { observer.disconnect(); } };
  }

  // Touch- and mouse-friendly scratch layer
  

function scratch(node) {
  const ctx = node.getContext('2d');
  let drawing = false;
  let width = 0;
  let height = 0;
  let revealed = false;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function flowerPath() {
    const p = new Path2D();
    p.moveTo(width * 0.50, height * 0.045);
    p.bezierCurveTo(width * 0.615, height * 0.045, width * 0.68, height * 0.145, width * 0.665, height * 0.265);
    p.bezierCurveTo(width * 0.79, height * 0.20, width * 0.93, height * 0.265, width * 0.965, height * 0.39);
    p.bezierCurveTo(width, height * 0.52, width * 0.925, height * 0.625, width * 0.83, height * 0.645);
    p.bezierCurveTo(width * 0.91, height * 0.765, width * 0.86, height * 0.91, width * 0.73, height * 0.95);
    p.bezierCurveTo(width * 0.61, height * 0.985, width * 0.535, height * 0.90, width * 0.50, height * 0.82);
    p.bezierCurveTo(width * 0.465, height * 0.90, width * 0.39, height * 0.985, width * 0.27, height * 0.95);
    p.bezierCurveTo(width * 0.14, height * 0.91, width * 0.09, height * 0.765, width * 0.17, height * 0.645);
    p.bezierCurveTo(width * 0.075, height * 0.625, 0, height * 0.52, width * 0.035, height * 0.39);
    p.bezierCurveTo(width * 0.07, height * 0.265, width * 0.21, height * 0.20, width * 0.335, height * 0.265);
    p.bezierCurveTo(width * 0.32, height * 0.145, width * 0.385, height * 0.045, width * 0.50, height * 0.045);
    p.closePath();
    return p;
  }

  function paintCover() {
    const rect = node.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    if (!width || !height || revealed) return;
    node.width = Math.round(width * dpr);
    node.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const flower = flowerPath();
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0dfbb');
    gradient.addColorStop(.48, '#b99b68');
    gradient.addColorStop(1, '#e8d5ad');
    ctx.save();
    ctx.clip(flower);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#987849';
    ctx.lineWidth = 1.4;
    ctx.stroke(flower);
    ctx.restore();

  }

  function getPoint(event) {
    const rect = node.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }
  function erase(event) {
    if (!drawing || revealed) return;
    const point = getPoint(event);
    ctx.save();
    ctx.clip(flowerPath());
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function start(event) {
    if (revealed) return;
    const point = getPoint(event);
    if (!ctx.isPointInPath(flowerPath(), point.x, point.y)) return;
    drawing = true;
    node.setPointerCapture?.(event.pointerId);
    erase(event);
  }
  function stop() { drawing = false; }

  paintCover();
  node.addEventListener('pointerdown', start);
  node.addEventListener('pointermove', erase);
  node.addEventListener('pointerup', stop);
  node.addEventListener('pointercancel', stop);
  const observer = new ResizeObserver(paintCover);
  observer.observe(node.parentElement);

  return {
    destroy() {
      node.removeEventListener('pointerdown', start);
      node.removeEventListener('pointermove', erase);
      node.removeEventListener('pointerup', stop);
      node.removeEventListener('pointercancel', stop);
      observer.disconnect();
    }
  };
}
</script>

<svelte:head>
  <title>Manoj & Lavanya — Wedding Invitation</title>
</svelte:head>

<audio
  bind:this={audio}
  src={`${ASSET_BASE}music/wedding-music.m4a`}
  preload="auto"
  onended={handleMusicEnded}
></audio>

<!-- Persistent custom mouse cursor -->
<div class="custom-sparkle-cursor" aria-hidden="true">✦</div>


{#if !opened}
  <main
    class="opening-screen"
    class:opening={opening}
    style={`--asset-envelope-image: url("${ASSET_BASE}images/Tap_to_Open_Botanical_Wax_Seal.png")`}
  >
    <div class="opening-panel opening-panel-left"></div>
    <div class="opening-panel opening-panel-right"></div>

    <button
      class="opening-seal-button"
      onclick={openInvitation}
      disabled={opening}
      aria-label="Tap to open the wedding invitation"
    >
      <span class="visually-hidden"></span>
    </button>

    <p class="opening-hint">A beautiful celebration awaits</p>
  </main>
{:else}

  <header class="site-header">
    <a class="brand" href="#home" onclick={() => menuOpen = false}>
      <img src={`${ASSET_BASE}images/ml-rose-monogram.png`} alt="Manoj and Lavanya monogram" />
    </a>
    <button class="menu-toggle" onclick={() => menuOpen = !menuOpen} aria-label="Toggle navigation">{menuOpen ? '×' : '☰'}</button>
    <nav class:show={menuOpen}>
      <a href="#story" onclick={() => menuOpen = false}>Our celebration</a>
      <a href="#events" onclick={() => menuOpen = false}>Events</a>
      <a href="#family" onclick={() => menuOpen = false}>Families</a>
      <a href="#gallery" onclick={() => menuOpen = false}>Gallery</a>
      <a href="#wishes" onclick={() => menuOpen = false}>Wishes</a>
    </nav>
    <button class="music-button" onclick={toggleMusic} aria-label="Toggle background music">{musicOn ? '♫ Music on' : '♫ Music off'}</button>
  </header>

  <main style={`--asset-paper-image: url("${ASSET_BASE}images/Background_02.jpeg")`}>
    <section class="hero" id="home">
      <div class="hero-ganesha">
        <img src={`${ASSET_BASE}images/ganesha.png`} alt="Lord Ganesha" />
      </div>
      <p class="eyebrow">
      || Sri Beteraya Swamy Prasanna ||<br />
      || Sri Kempamma (Udusalamma) Devi Krupe ||
      </p>
      <div class="hero-emblem image-emblem">
        <img src={`${ASSET_BASE}images/ml-rose-monogram.png`} alt="Manoj and Lavanya monogram" />
      </div>
      <p class="script-line">Together with our families</p>
      <h1>Manoj <i>&</i> Lavanya</h1>
      <p class="hero-subtitle">#Manvanya's wedding, We invite you with hearts full of love to celebrate our wedding.</p>

      <a class="text-link" href="#events">Explore the celebration ↓</a>
    </section>
   <section class="couple-section reveal-section" use:reveal>
  <div class="section-heading">
    <p class="eyebrow">The happy couple</p>
    <h2>Made for each other</h2>
  </div>

  <div class="couple-layout">
    <div class="couple-photo">
      <img
        src={`${ASSET_BASE}images/couple-hero.jpg`}
        alt="Manoj and Lavanya together"
        loading="lazy"
      />
    </div>

    <div class="couple-copy">
      <p>
        <strong>A new journey begins, surrounded by love and cherished blessings.</strong>
      </p>

      <p>
        With the blessings of our loved ones, we begin a journey filled with
        love, laughter and togetherness.
      </p>

      <p>
        Your presence would make this celebration even more meaningful.
      </p>
    </div>
  </div>
</section>

    <section class="scratch-section" use:reveal>
      <svg class="flower-clip-defs" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="flowerClip" clipPathUnits="objectBoundingBox">
            <path d="
              M .50 .045
              C .615 .045 .68 .145 .665 .265
              C .79 .20 .93 .265 .965 .39
              C 1.00 .52 .925 .625 .83 .645
              C .91 .765 .86 .91 .73 .95
              C .61 .985 .535 .90 .50 .82
              C .465 .90 .39 .985 .27 .95
              C .14 .91 .09 .765 .17 .645
              C .075 .625 0 .52 .035 .39
              C .07 .265 .21 .20 .335 .265
              C .32 .145 .385 .045 .50 .045 Z
            " />
          </clipPath>
        </defs>
      </svg>
      <div class="flower-reveal-wrap">
        <div class="section-heading">
          <p class="eyebrow">A little something to discover</p>
          <h2>Reveal Our Big Day</h2>
          <p class="section-intro">Scratch each flower to uncover the dates of our celebration.</p>
        </div>

        <div class="flower-reveal-grid">
          <article class="flower-reveal-card">
            <div class="flower-date">
              <p class="flower-event">Reception</p>
              <p class="flower-day">02</p>
              <p class="flower-month">DECEMBER 2026</p>
              <p class="flower-weekday">Wednesday · 7:00 PM onwards</p>
            </div>
            <div class="flower-cover">
              <canvas class="flower-scratch-layer" use:scratch aria-label="Scratch to reveal the Reception date"></canvas>
              <span class="flower-tap-hint">Scratch to reveal</span>
            </div>
          </article>

          <article class="flower-reveal-card">
            <div class="flower-date">
              <p class="flower-event">Muhurtha</p>
              <p class="flower-day">03</p>
              <p class="flower-month">DECEMBER 2026</p>
              <p class="flower-weekday">Thursday · 8:10 AM – 9:15 AM</p>
            </div>
            <div class="flower-cover">
              <canvas class="flower-scratch-layer" use:scratch aria-label="Scratch to reveal the Muhurtha date"></canvas>
              <span class="flower-tap-hint">Scratch to reveal</span>
            </div>
          </article>

          <article class="flower-reveal-card">
            <div class="flower-date">
              <p class="flower-event">Beegara Oota</p>
              <p class="flower-day">13</p>
              <p class="flower-month">DECEMBER 2026</p>
              <p class="flower-weekday">Sunday · 12:00 noon onwards</p>
            </div>
            <div class="flower-cover">
              <canvas class="flower-scratch-layer" use:scratch aria-label="Scratch to reveal the Beegara Oota date"></canvas>
              <span class="flower-tap-hint">Scratch to reveal</span>
            </div>
          </article>

        </div>
      </div>
    </section>
    
<section class="countdown-section reveal-section" id="story" use:reveal>
  <div class="section-heading">
    <p class="eyebrow">The day we've been waiting for</p>
    <h2>A new chapter begins</h2>
    <p class="section-intro">
      Counting down to the beautiful beginning of our journey.
    </p>
  </div>

  <div class="countdown">
    <div>
      <strong>{days}</strong>
      <span>Days</span>
    </div>
    <b>:</b>
    <div>
      <strong>{hours}</strong>
      <span>Hours</span>
    </div>
    <b>:</b>
    <div>
      <strong>{minutes}</strong>
      <span>Minutes</span>
    </div>
    <b>:</b>
    <div>
      <strong>{seconds}</strong>
      <span>Seconds</span>
    </div>
  </div>

  <p class="blessing-quote">
    Two hearts, one beautiful journey, forever together.
  </p>
</section>

    <section class="events-section reveal-section" id="events" use:reveal>
      <div class="section-heading"><p class="eyebrow">Save the dates</p><h2>Wedding celebrations</h2><p class="section-intro">We would be delighted to celebrate these special moments with you.</p></div>
      <div class="event-grid">
        <article class="event-card"><div class="event-number">01</div><p class="eyebrow">The evening celebration</p><h3>Reception</h3><div class="event-date">02 <span>DEC</span></div><p class="event-day">Wednesday · 7:00 PM onwards</p><div class="event-divider"></div><h4>Sri Sai Kalyana Mantapa</h4><p>Opp. Bagalagunte Bus Stand,<br/>Hesaraghatta Main Road, Bengaluru</p><div class="event-actions"><a href={receptionMap} target="_blank" rel="noreferrer">Get directions ↗</a><a href={receptionCalendar} target="_blank" rel="noreferrer">Add to calendar +</a></div></article>
        <article class="event-card featured"><div class="event-number">02</div><p class="eyebrow">The auspicious moment</p><h3>Muhurtha</h3><div class="event-date">03 <span>DEC</span></div><p class="event-day">Thursday · 8:10 AM – 9:15 AM</p><div class="event-divider"></div><h4>Sri Sai Kalyana Mantapa</h4><p>Opp. Bagalagunte Bus Stand,<br/>Hesaraghatta Main Road, Bengaluru</p><p class="lagna">Lagna · Dhanur</p><div class="event-actions"><a href={receptionMap} target="_blank" rel="noreferrer">Get directions ↗</a><a href={weddingCalendar} target="_blank" rel="noreferrer">Add to calendar +</a></div></article>
        <article class="event-card"><div class="event-number">03</div><p class="eyebrow">A family gathering</p><h3>Beegara Oota</h3><div class="event-date">13 <span>DEC</span></div><p class="event-day">Sunday · 12:00 noon onwards</p><div class="event-divider"></div><h4>Sri Ravinandan Palace</h4><p>No. 162, Magadi Main Road,<br/>Kempegowdanagar, Bedarahalli,<br/>Bengaluru – 560091</p><div class="event-actions"><a href={familyMap} target="_blank" rel="noreferrer">Get directions ↗</a><a href={familyCalendar} target="_blank" rel="noreferrer">Add to calendar +</a></div></article>
      </div>
    </section>

    <section class="family-section reveal-section" id="family" use:reveal>
      <div class="section-heading"><p class="eyebrow">Blessed by our families</p><h2>Two families, one celebration</h2></div>
      <div class="family-grid">
        <article class="family-card">
          <span class="family-flower" aria-hidden="true">
            <svg viewBox="0 0 1 1" role="presentation" focusable="false">
              <path d="M .50 .045 C .615 .045 .68 .145 .665 .265 C .79 .20 .93 .265 .965 .39 C 1 .52 .925 .625 .83 .645 C .91 .765 .86 .91 .73 .95 C .61 .985 .535 .90 .50 .82 C .465 .90 .39 .985 .27 .95 C .14 .91 .09 .765 .17 .645 C .075 .625 0 .52 .035 .39 C .07 .265 .21 .20 .335 .265 C .32 .145 .385 .045 .50 .045 Z" />
            </svg>
          </span>
          <div class="family-card-content">
            <p class="eyebrow">Groom's Family</p>
            <p class="family-names">Smt. Bharathi P.<br/><span>&</span><br/>Sri Krishna K.</p>
            <p class="family-address">No. 42, Belaku Nilaya, 4th Cross,<br/>Kalidasa Layout, Sringar,<br/>Bengaluru – 560050</p>
          </div>
        </article>

        <article class="family-card">
          <span class="family-flower" aria-hidden="true">
            <svg viewBox="0 0 1 1" role="presentation" focusable="false">
              <path d="M .50 .045 C .615 .045 .68 .145 .665 .265 C .79 .20 .93 .265 .965 .39 C 1 .52 .925 .625 .83 .645 C .91 .765 .86 .91 .73 .95 C .61 .985 .535 .90 .50 .82 C .465 .90 .39 .985 .27 .95 C .14 .91 .09 .765 .17 .645 C .075 .625 0 .52 .035 .39 C .07 .265 .21 .20 .335 .265 C .32 .145 .385 .045 .50 .045 Z" />
            </svg>
          </span>
          <div class="family-card-content">
            <p class="eyebrow">Bride's Family</p>
            <p class="family-names">Smt. Mahalakshmi<br/><span>&</span><br/>Sri Melegowda</p>
            <p class="family-address">No. 19, Sri Lakshmivenkateshwara Nilaya,<br/>2nd Main Road, T. Dasarahalli,<br/>Bengaluru – 560057</p>
          </div>
        </article>
      </div>
      <p class="family-note">We solicit your gracious presence and blessings along with your family and friends on this auspicious occasion.</p>
    </section>

    <section class="gallery-section reveal-section" id="gallery" use:reveal>
      <div class="section-heading"><p class="eyebrow">Moments to remember</p><h2>A glimpse of our story</h2><p class="section-intro">A few favourite frames, soon to be filled with memories.</p></div>
      <div class="gallery-grid">
        {#each [
          {src:`${ASSET_BASE}images/couple-portrait-1.jpg`, alt:'Manoj and Lavanya smiling together'},
          {src:`${ASSET_BASE}images/couple-portrait-2.jpg`, alt:'Manoj and Lavanya sharing a moment'},
          {src:`${ASSET_BASE}images/couple-portrait-3.jpg`, alt:'Manoj and Lavanya in traditional attire'}
        ] as photo, i}
          <button class="gallery-photo gallery-{i+1}" onclick={() => lightbox = photo.src} aria-label="View couple photograph {i+1}">
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </button>
        {/each}
      </div>
      {#if lightbox}<div class="lightbox" role="presentation" onclick={() => lightbox = ''}><button aria-label="Close" onclick={() => lightbox = ''}>×</button><img src={lightbox} alt="Manoj and Lavanya" /></div>{/if}
    </section>

      <section class="rsvp-section reveal-section" id="rsvp" use:reveal>
        <div class="section-heading">
          <p class="eyebrow">Celebrate With Us</p>

          <p class="section-intro">
            Your presence is our present.
          </p>

          <p class="rsvp-note">
            <em><strong>Little Words, Lasting Memories</strong></em>
          </p>

          <h2>A Keepsake of Love</h2>
        </div>

        {#if !rsvpSubmitted}
          <form class="rsvp-form" onsubmit={(e) => { e.preventDefault(); submitRsvp(); }}>
            <div class="rsvp-field">
              <label for="rsvp-name">Your name</label>
              <input id="rsvp-name" type="text" placeholder="Enter your full name" bind:value={rsvpName} maxlength="60" required />
            </div>

            <div class="rsvp-field">
              <label for="rsvp-message">A little note</label>
              <textarea id="rsvp-message" placeholder="Write your wishes..." bind:value={rsvpMessage} maxlength="300" rows="4"></textarea>
            </div>

            {#if rsvpError}<p class="rsvp-error" role="alert">{rsvpError}</p>{/if}
            <button class="rsvp-submit" type="submit" disabled={rsvpSending}>
              {rsvpSending ? 'Sending...' : 'Submit wishes ♡'}
            </button>
          </form>
          <p class="rsvp-note">
            We look forward to celebrating with you. Thank you for responding!
          </p>
        {:else}
          <div class="rsvp-success">
            <div class="rsvp-success-icon">❦</div>
            <p class="eyebrow">Response received</p>
            <h3>Thank you, {rsvpName}!</h3>
            <p>
              {rsvpAttendance === 'yes'
                ? 'We are delighted that you will be joining our celebration.'
                : 'Thank you for letting us know. You will be missed!'}
            </p>
            <p class="rsvp-success-signature">With love, Manoj & Lavanya</p>
          </div>
        {/if}
      </section>

    <section class="closing-section reveal-section" use:reveal><div class="closing-logo"><img src={`${ASSET_BASE}images/ml-rose-monogram.png`} alt="Manoj and Lavanya floral monogram" /></div><p class="eyebrow">Your presence is our present</p><h2>We can't wait to celebrate with you.</h2><p>With love, Manoj & Lavanya</p><a href="#home">Back to top ↑</a></section>
  </main>
  <footer><span>Manoj & Lavanya · 03.12.2026</span><span>Made with love ♡</span></footer>
{/if}
