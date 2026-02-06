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

    window.location.href = "./cart.html";
  });
});

// === Contact form ===
const form = document.getElementById('contactForm');
if (form) {
  const statusEl = form.querySelector('.form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    // додаємо маркер, щоб Apps Script знав що це відгук
    formData.append("formType", "feedback");

    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbzF-2iOelhAztpWBjfmcBmq37mYxubRj8c4zr3_7PKIFfdbSghsKCEFd9chdtwBBJNH/exec", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        statusEl.textContent = 'Дякуємо за ваш відгук!';
        statusEl.style.color = 'var(--success)';
        form.reset();
      } else {
        statusEl.textContent = 'Помилка при надсиланні.';
        statusEl.style.color = 'var(--danger)';
      }
    } catch (err) {
      statusEl.textContent = 'Мережна помилка.';
      statusEl.style.color = 'var(--danger)';
    }
  });
}

// === Carousel slider ===
const track = document.querySelector('.track'); 
const items = document.querySelectorAll('.track blockquote'); 
let index = 0; 

function getVisibleCount() {
  const width = window.innerWidth;
  if (width >= 1024) return 3; // десктоп
  if (width >= 768) return 2;  // планшет
  return 1;                    // мобільний
}

function slide() { 
  if (!track || items.length === 0) return;

  const visibleCount = getVisibleCount();
  const itemWidth = track.clientWidth / visibleCount; // ширина однієї картки
  index++; 

  track.style.transition = "transform 0.8s ease"; 
  track.style.transform = `translateX(-${index * itemWidth}px)`;

  // коли дійшли до кінця — скидаємо
  if (index >= items.length - visibleCount + 1) { 
    setTimeout(() => { 
      track.style.transition = "none"; 
      track.style.transform = "translateX(0)"; 
      index = 0; 
    }, 850); 
  }
}

setInterval(slide, 4000);

// важливо: при ресайзі перераховувати
window.addEventListener('resize', () => {
  track.style.transition = "none";
  track.style.transform = "translateX(0)";
  index = 0;
});

setInterval(slide, 4000);
