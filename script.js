// Year stamp
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Active nav link
// (GitHub Pages: az oldalak "nev.html" vagy "nev" alakban is elérhetők, alútvonal alatt)
const pageName = (s) => (s.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
const current = pageName(location.pathname);
document.querySelectorAll('.nav-links a').forEach((a) => {
  if (pageName(a.getAttribute('href') || '') === current) a.classList.add('is-active');
});

// Smooth scroll
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

// Reveal on scroll
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }),
    { rootMargin: '0px 0px -40px 0px', threshold: 0.08 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
}
