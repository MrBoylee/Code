// FAQ Accordion
function ppToggleFaq(button) {
  const item = button.parentElement;

  document
    .querySelectorAll('#pp-sales-page .pp-faq-item.active')
    .forEach((el) => {
      if (el !== item) el.classList.remove('active');
    });

  item.classList.toggle('active');
}

// Lightbox — safely does nothing while the modal HTML is commented out
function ppOpenLightbox(src) {
  const lb = document.getElementById('pp-lightbox');
  const img = document.getElementById('pp-lightbox-img');

  if (!lb || !img) return;

  img.src = src;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function ppCloseLightbox() {
  const lb = document.getElementById('pp-lightbox');

  if (!lb) return;

  lb.classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') ppCloseLightbox();
});

// Smooth scrolling for links inside the product page
document
  .querySelectorAll('#pp-sales-page a[href^="#"]')
  .forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));

      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
