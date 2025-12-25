const form = document.getElementById('checkoutForm');
const statusEl = document.querySelector('.form-status');
const summaryEl = document.getElementById('orderSummary');

const cart = JSON.parse(localStorage.getItem('cart')) || [];

// === Показ замовлення ===
function renderSummary() {
  if (cart.length === 0) {
    summaryEl.innerHTML = '<p>Ваш кошик порожній.</p>';
    return;
  }

  const total = cart.reduce((sum, item) => {
    const priceNum = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
    return sum + priceNum * item.qty;
  }, 0);

  summaryEl.innerHTML = `
    <h2>Ваше замовлення</h2>
    <ul>
      ${cart.map(item => `
        <li>
          <img src="${item.image}" alt="${item.name}" style="width:40px">
          ${item.name} — ${item.qty} шт. (${item.price})
        </li>
      `).join('')}
    </ul>
    <p><strong>Загальна сума: ${total} грн</strong></p>
    <p>Доставка: Згідно тарифів перевізника</p>
  `;
}
renderSummary();

// === Обробка форми ===
form.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(form);

  // тут буде інтеграція з оплатою
  await new Promise(r => setTimeout(r, 700));

  statusEl.textContent = 'Дякуємо! Ваше замовлення прийнято.';
  statusEl.style.color = 'var(--success)';
  localStorage.removeItem('cart');
});

// === API НП ===
const apiKey = "69e41bba3912f51631a358d2ec25e371";

async function getCities(query) {
  const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      modelName: "Address",
      calledMethod: "getCities",
      methodProperties: { FindByString: query }
    })
  });
  const data = await res.json();
  return data.data || [];
}

async function getWarehouses(cityName) {
  const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      modelName: "Address",
      calledMethod: "getWarehouses",
      methodProperties: { CityName: cityName }
    })
  });
  const data = await res.json();
  return data.data || [];
}

// === Автопідказки ===
const cityInput = document.getElementById("cityInput");
const citySuggestions = document.getElementById("citySuggestions");
const warehouseSelect = document.getElementById("warehouseSelect");

cityInput.addEventListener("input", async () => {
  const query = cityInput.value.trim();
  if (query.length < 2) {
    citySuggestions.innerHTML = "";
    return;
  }
  const cities = await getCities(query);
  if (!cities.length) {
    citySuggestions.innerHTML = "<li>Місто не знайдено</li>";
    return;
  }
  citySuggestions.innerHTML = cities.map(c =>
    `<li data-city="${c.Description}">${c.Description}</li>`
  ).join("");
});

// вибір міста → завантаження відділень
citySuggestions.addEventListener("click", async e => {
  const li = e.target.closest("li[data-city]");
  if (!li) return;

  const cityName = li.dataset.city;
  cityInput.value = cityName;
  citySuggestions.innerHTML = "";

  const warehouses = await getWarehouses(cityName.toUpperCase());
  warehouseSelect.innerHTML = warehouses.map(w =>
    `<option value="${w.Description}">${w.Description}</option>`
  ).join("");
});
