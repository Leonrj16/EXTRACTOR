// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal], [data-reveal-delay]').forEach(el => {
  revealObserver.observe(el);
});

// Card stagger reveal
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, entry.target.dataset.delay || 0);
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.service-card, .testimonial-card, .info-item').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.55s cubic-bezier(0.4,0,0.2,1)';
  el.dataset.delay = i * 90;
  cardObserver.observe(el);
});

// Contact form
const form = document.getElementById('contactForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  setTimeout(() => {
    form.innerHTML = `
      <div style="text-align:center;padding:32px 0;display:flex;flex-direction:column;align-items:center;gap:16px;">
        <div style="font-size:3.5rem;filter:drop-shadow(0 0 20px rgba(167,139,250,0.6));">✅</div>
        <h3 style="color:white;font-size:1.4rem;">¡Solicitud enviada!</h3>
        <p style="color:rgba(255,255,255,0.6);font-size:0.94rem;max-width:320px;line-height:1.6;">
          Gracias por contactarnos. Te responderemos en menos de 24 horas para confirmar tu cita.
        </p>
      </div>
    `;
  }, 1200);
});

// Ensure navbar is visible on dark hero
navbar.classList.add('scrolled');
window.addEventListener('scroll', () => {
  if (window.scrollY < 40) navbar.classList.add('scrolled');
}, { passive: true });
