document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = navMenu.querySelectorAll('a');

  // Mobile nav
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Scroll spy
  const sections = document.querySelectorAll('section, footer, header');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => sectionObserver.observe(s));

  // Reveal
  const revealEls = document.querySelectorAll('.scene-panel, .flow-step, .feature-card, .unit-card, .mode-card, .gallery-main, .thumb, .timeline-item, .platform-card, .changelog-item');
  revealEls.forEach(el => el.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObserver.observe(el));

  // Biomes gallery
  const biomes = [
    { name: '春', src: 'assets/images/biome-spring-v3.png' },
    { name: '夏', src: 'assets/images/biome-summer-v3.png' },
    { name: '秋', src: 'assets/images/biome-autumn-v3.png' },
    { name: '冬', src: 'assets/images/biome-winter-v3.png' },
    { name: '荒漠', src: 'assets/images/biome-desert.png' },
    { name: '戈壁', src: 'assets/images/biome-gobi.png' },
    { name: '沼泽', src: 'assets/images/biome-swamp.png' }
  ];
  let currentIndex = 0;

  const galleryImage = document.getElementById('galleryImage');
  const gallerySeason = document.getElementById('gallerySeason');
  const galleryMain = document.getElementById('galleryMain');
  const thumbs = Array.from(document.querySelectorAll('.thumb'));

  function showBiome(index, animate = true) {
    currentIndex = (index + biomes.length) % biomes.length;
    const biome = biomes[currentIndex];
    if (animate) {
      galleryImage.style.opacity = '0';
      setTimeout(() => {
        galleryImage.src = biome.src;
        galleryImage.alt = biome.name;
        galleryImage.style.opacity = '1';
      }, 180);
    } else {
      galleryImage.src = biome.src;
      galleryImage.alt = biome.name;
    }
    gallerySeason.textContent = biome.name;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
  }

  document.getElementById('galleryPrev').addEventListener('click', () => showBiome(currentIndex - 1));
  document.getElementById('galleryNext').addEventListener('click', () => showBiome(currentIndex + 1));
  thumbs.forEach(t => t.addEventListener('click', () => showBiome(Number(t.dataset.index))));

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  let lightboxOpen = false;

  function openLightbox() {
    lightboxOpen = true;
    updateLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightboxOpen = false;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function updateLightbox() {
    const biome = biomes[currentIndex];
    lightboxImage.src = biome.src;
    lightboxImage.alt = biome.name;
    lightboxCaption.textContent = `${biome.name} · ${currentIndex + 1} / ${biomes.length}`;
  }
  function lightboxNavigate(dir) {
    if (!lightboxOpen) return;
    showBiome(currentIndex + dir);
    updateLightbox();
  }

  galleryMain.addEventListener('click', openLightbox);
  galleryMain.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
  });
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => lightboxNavigate(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => lightboxNavigate(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNavigate(-1);
    if (e.key === 'ArrowRight') lightboxNavigate(1);
  });

  // Cursor glow
  const cursorGlow = document.getElementById('cursorGlow');
  let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
  });
  function animateGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    cursorGlow.style.left = `${glowX}px`;
    cursorGlow.style.top = `${glowY}px`;
    requestAnimationFrame(animateGlow);
  }
  if (window.matchMedia('(hover: hover)').matches) animateGlow();

  // Floating spores / fireflies
  const particleLayer = document.querySelector('.particles');
  const particleCount = window.innerWidth < 768 ? 18 : 36;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('span');
    const size = 2 + Math.random() * 3;
    p.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      background: ${Math.random() > 0.5 ? 'rgba(69,217,221,0.75)' : 'rgba(227,185,107,0.6)'};
      box-shadow: 0 0 ${size * 4}px ${Math.random() > 0.5 ? 'rgba(69,217,221,0.8)' : 'rgba(227,185,107,0.7)'};
      animation: floatUp ${12 + Math.random() * 18}s linear ${-Math.random() * 20}s infinite;
      opacity: 0;
    `;
    particleLayer.appendChild(p);
  }

  // Subtle pointer tilt on cards
  const tiltCards = document.querySelectorAll('.unit-card, .mode-card, .feature-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Parallax + scroll progress
  const body = document.body;
  const progress = document.getElementById('scrollProgress');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
        body.style.backgroundPosition = `center ${y * 0.12}px`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
});
