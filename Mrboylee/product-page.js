/* ═══════════════════════════════════════════════════════════════ */
/*  VANILLA JS — No external libraries                            */
/* ═══════════════════════════════════════════════════════════════ */

// FAQ Accordion
function ppToggleFaq(button) {
  const item = button.parentElement;
  const isActive = item.classList.contains('active');
  
  // Close all others (optional — remove this block to allow multiple open)
  document.querySelectorAll('#pp-sales-page .pp-faq-item.active').forEach(el => {
    if (el !== item) el.classList.remove('active');
  });
  
  item.classList.toggle('active');
}

// Lightbox
function ppOpenLightbox(src) {
  const lb = document.getElementById('pp-lightbox');
  const img = document.getElementById('pp-lightbox-img');
  img.src = src;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function ppCloseLightbox() {
  const lb = document.getElementById('pp-lightbox');
  lb.classList.remove('active');
  document.body.style.overflow = '';
}

// Close lightbox with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') ppCloseLightbox();
});

// Smooth scroll for anchor links inside the page
document.querySelectorAll('#pp-sales-page a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
