const cartItemsEl = document.getElementById('cartItems');
const checkoutBtn = document.getElementById('checkoutBtn');
const summaryEl = document.getElementById('cartSummary');
const addMoreBtn = document.getElementById('addMoreBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p>Кошик порожній.</p>';
    summaryEl.textContent = '';
    return;
  }

  cartItemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-thumb">
      <h3>${item.name}</h3>
      <p>${item.price}</p>
      <label>
        Кількість:
        <input class="qty-input input" type="number" min="1" value="${item.qty}" 
               data-index="${i}" class="qty-input">
      </label>
    </div>
  `).join('');

  // слухачі на інпути кількості
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('input', e => {
      const idx = e.target.dataset.index;
      cart[idx].qty = parseInt(e.target.value, 10) || 1;
      localStorage.setItem('cart', JSON.stringify(cart));
      updateSummary();
    });
  });

  updateSummary();
}

function updateSummary() {
  const total = cart.reduce((sum, item) => {
    const priceNum = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    return sum + priceNum * item.qty;
  }, 0);

  summaryEl.textContent = `Загальна сума: ${total} грн`;
}

renderCart();

// оформлення замовлення
checkoutBtn.addEventListener('click', () => {
  window.location.href = '/CitolabK/checkout.html';
});


// додати іншу упаковку
addMoreBtn.addEventListener('click', () => {
  window.location.href = 'index.html#products';
});

// очистити кошик
clearCartBtn.addEventListener('click', () => {
  localStorage.removeItem('cart');
  cart = [];
  renderCart();
});
