// === Mobile nav toggle ===
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// === Smooth scroll with easing ===
function smoothScrollTo(targetY, duration = 1000) {
  const startY = window.scrollY;
  const diff = targetY - startY;
  let start;

  function step(timestamp) {
    if (!start) start = timestamp;
    const time = timestamp - start;
    const percent = Math.min(time / duration, 1);

    // easeInOutQuad
    const ease = percent < 0.5
      ? 2 * percent * percent
      : -1 + (4 - 2 * percent) * percent;

    window.scrollTo(0, startY + diff * ease);

    if (time < duration) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const targetId = a.getAttribute('href').slice(1);
    const el = document.getElementById(targetId);
    if (el) {
      e.preventDefault();
      const targetY = el.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(targetY, 1200);

      if (navList && navList.classList.contains('open')) {
        navList.classList.remove('open');
        navToggle.setAttribute('aria-expanded','false');
      }
    }
  });
});

// === Buy buttons handler (cards + CTA) ===
document.querySelectorAll('button[data-product]').forEach(btn => {
  btn.addEventListener('click', () => {
    const sku   = btn.dataset.product;
    let name, image, price;

    const card = btn.closest('.product-card');
    if (card) {
      // кнопка всередині картки
      const imgEl = card.querySelector('img');
      name  = card.querySelector('h3')?.textContent.trim();
      image = imgEl?.src || '';
      price = card.querySelector('.price')?.textContent.trim() || '';
    } else {
      // кнопка в CTA-блоці
      name  = btn.dataset.name || sku;
      image = btn.dataset.image || '';
      price = btn.dataset.price || '';
    }

    const product = { sku, name, image, price, qty: 1 };
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));

    window.location.href = "/cart.html";
  });
});

// === Contact form ===
const form = document.getElementById('contactForm');
if (form) {
  const statusEl = form.querySelector('.form-status');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const message = formData.get('message')?.toString().trim();

    if (!name || !email || !message) {
      statusEl.textContent = 'Будь ласка, заповніть усі поля.';
      statusEl.style.color = 'var(--danger)';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      statusEl.textContent = 'Некоректний email.';
      statusEl.style.color = 'var(--danger)';
      return;
    }

    await fetch('/api/contact', { method:'POST', body: formData });
    await new Promise(r=>setTimeout(r,700));
    statusEl.textContent = 'Дякуємо! Ми зв’яжемося з вами найближчим часом.';
    statusEl.style.color = 'var(--success)';
    form.reset();
  });
}

// === Carousel slider ===
const track = document.querySelector('.track'); 
const items = document.querySelectorAll('.track blockquote'); 
let index = 0; 

function slide() { 
  if (!track || items.length === 0) return;

  index++; 
  track.style.transition = "transform 0.8s ease"; 
  track.style.transform = `translateX(-${index * 330}px)`;

  if (index >= items.length - 3) { 
    setTimeout(() => { 
      track.style.transition = "none"; 
      track.style.transform = "translateX(0)"; 
      index = 0; 
    }, 850); 
  }
}

setInterval(slide, 4000);
