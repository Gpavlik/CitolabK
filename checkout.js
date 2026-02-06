const summaryEl = document.getElementById('orderSummary');

// === Дані кошика ===
const cart = JSON.parse(localStorage.getItem('cart')) || [];

// список товарів у форматі "Назва — кількість шт."
const products = cart.map(item => `${item.name} — ${item.qty} шт.`).join('; ');

// загальна кількість упаковок
const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

// загальна сума
const total = cart.reduce((sum, item) => {
  const priceNum = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
  return sum + priceNum * item.qty;
}, 0);

// === Показ замовлення ===
function renderSummary() {
  if (cart.length === 0) {
    summaryEl.innerHTML = '<p>Ваш кошик порожній.</p>';
    return;
  }

  summaryEl.innerHTML = `
    <h2>Ваше замовлення</h2>
    <ul>
      ${cart.map(item => `
        <li style="font-size:1.1rem">
          <img src="${item.image}" alt="${item.name}" style="width:200px">
          ${item.name} — ${item.qty} шт. (${item.price})
        </li>
      `).join('')}
    </ul>
    <p><strong>Загальна кількість: ${totalQty} шт.</strong></p>
    <p><strong>Загальна сума: ${total} грн</strong></p>
    <p>Доставка: Згідно тарифів перевізника</p>
  `;
}
renderSummary();

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

// === Обробка форми ===
const form = document.getElementById('checkoutForm');
const statusEl = form.querySelector('.form-status');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(form);

  const orderReference = Date.now().toString();
  formData.append("orderReference", orderReference);

  // товари та сума
  formData.append("products", products);
  formData.append("totalQty", totalQty);
  formData.append("total", total);

  // місто та поштомат
  formData.append("cityInput", cityInput.value);
  formData.append("branch", warehouseSelect.value);


  try {
    // 1. Відправка у Google Apps Script
    const res = await fetch("https://script.google.com/macros/s/AKfycbzF-2iOelhAztpWBjfmcBmq37mYxubRj8c4zr3_7PKIFfdbSghsKCEFd9chdtwBBJNH/exec", {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Помилка запису");

    // 2. Повідомлення користувачу
    if (statusEl) {
      statusEl.textContent = '✅ Дякуємо! Ваше замовлення прийнято.';
      statusEl.style.color = 'var(--success)';
    }

    // 3. Редирект на WayForPay
    const order = {
      merchantAccount: "ВАШ_MERCHANT",
      merchantDomainName: "ваш_сайт.com",
      orderReference: orderReference,
      orderDate: Math.floor(Date.now()/1000),
      amount: total, // реальна сума замовлення
      currency: "UAH",
      productName: "Замовлення Cytolab",
      clientEmail: formData.get("email"),
      clientPhone: formData.get("phone")
    };

    // ⚠️ У реальному проекті треба згенерувати merchantSignature на бекенді!
    const payForm = document.createElement("form");
    payForm.method = "POST";
    payForm.action = "https://secure.wayforpay.com/pay";

    for (const key in order) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = order[key];
      payForm.appendChild(input);
    }

    document.body.appendChild(payForm);
    payForm.submit();

    localStorage.removeItem('cart');
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = '❌ Помилка при оформленні замовлення.';
      statusEl.style.color = 'var(--danger)';
    }
  }
});
