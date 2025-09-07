import {
  formatCurrency,
  saveHistory,
  getHistory,
  clearHistory,
  isValidAmount,
  convertAmount,
  updateCurrencyImages,
} from "./utils.js";

// ELEMENTOS DEL HTML
const fromSelect = document.getElementById("fromCurrency");
const toSelect = document.getElementById("toCurrency");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convertBtn");
const resultDiv = document.getElementById("result");
const historyList = document.getElementById("history");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const balanceDiv = document.getElementById("balanceDisplay");
const addBalanceBtn = document.getElementById("addBalanceBtn");

const history = [];
let rates = {};
const initialBalanceUSD = 5000;
let balances = {};

// FUNCION PARA ACTUALIZAR EL SALDO EN LA INTERFAZ
function updateBalanceDisplay() {
  balanceDiv.innerHTML = Object.entries(balances)
    .map(
      ([currency, amount]) => `${currency}: ${formatCurrency(amount, currency)}`
    )
    .join("<br>");
}

// FUNCION PARA LLENAR LOS SELECTS CON MONEDAS
function populateCurrencies() {
  const currencies = Object.keys(rates);

  fromSelect.innerHTML = currencies
    .map(
      (currency) =>
        `<option value="${currency}" data-img="${rates[currency].img}">${currency}</option>`
    )
    .join("");

  toSelect.innerHTML = currencies
    .map(
      (currency) =>
        `<option value="${currency}" data-img="${rates[currency].img}">${currency}</option>`
    )
    .join("");

  updateCurrencyImages(
    fromSelect,
    toSelect,
    document.getElementById("fromCurrencyImg"),
    document.getElementById("toCurrencyImg")
  );

  fromSelect.addEventListener("change", () =>
    updateCurrencyImages(
      fromSelect,
      toSelect,
      document.getElementById("fromCurrencyImg"),
      document.getElementById("toCurrencyImg")
    )
  );
  toSelect.addEventListener("change", () =>
    updateCurrencyImages(
      fromSelect,
      toSelect,
      document.getElementById("fromCurrencyImg"),
      document.getElementById("toCurrencyImg")
    )
  );
}

// FUNCION PARA CONVERTIR MONEDAS Y ACUMULAR SALDOS
function convert() {
  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = parseFloat(amountInput.value);

  if (!isValidAmount(amount)) {
    Swal.fire("ERROR", "INGRESE UN MONTO VALIDO", "error");
    return;
  }

  // VERIFICAR SALDO EN LA MONEDA DE ORIGEN
  if (amount > balances[from]) {
    Swal.fire("ERROR", "SALDO INSUFICIENTE", "error");
    return;
  }

  // RESTAR DEL SALDO DE LA MONEDA DE ORIGEN
  balances[from] -= amount;

  // CONVERTIR MONEDA
  const converted = convertAmount(amount, rates[from].rate, rates[to].rate);

  // SUMAR AL BALANCE DE LA MONEDA DESTINO
  balances[to] = (balances[to] || 0) + converted;

  // MOSTRAR RESULTADO
  resultDiv.textContent = `${formatCurrency(amount, from)} = ${formatCurrency(
    converted,
    to
  )}`;

  // GUARDAR EN HISTORIAL
  const entry = {
    id: Date.now(),
    from,
    to,
    amount: formatCurrency(amount, from),
    converted: formatCurrency(converted, to),
    rateUsed: (rates[to].rate / rates[from].rate).toFixed(6),
    date: new Date().toLocaleString(),
  };

  history.push(entry);
  saveHistory(entry);
  updateHistory();

  // ACTUALIZAR DISPLAY DE SALDOS
  updateBalanceDisplay();
}

// FUNCION PARA ACTUALIZAR EL HISTORIAL EN EL HTML
function updateHistory() {
  const storedHistory = getHistory();
  historyList.innerHTML = storedHistory
    .map(
      (item) =>
        `<li>ID:${item.id} [${item.date}] ${item.amount} → ${item.converted} (T.C: ${item.rateUsed})</li>`
    )
    .join("");
}

// FUNCION PARA LIMPIAR HISTORIAL Y REINICIAR SALDOS
function handleClearHistory() {
  clearHistory();
  history.length = 0;

  // REINICIAR SALDOS
  balances = { USD: initialBalanceUSD };
  Object.keys(rates).forEach((r) => {
    if (!balances[r]) balances[r] = 0;
  });

  updateHistory();
  updateBalanceDisplay();
  Swal.fire("EXITO", "HISTORIAL Y SALDOS REINICIADOS", "success");
}

// FUNCION PARA AGREGAR SALDO EXTRA
function handleAddBalance() {
  balances["USD"] += 5000;
  updateBalanceDisplay();
  Swal.fire("EXITO", "SE AGREGARON 5000 USD AL SALDO", "success");
}

// FUNCION PARA CARGAR RATES DESDE JSON
async function loadRates() {
  try {
    const url = new URL("../../data/rates.json", import.meta.url);
    let response = await fetch(url.href);

    if (!response.ok) {
      response = await fetch("./data/rates.json");
    }

    if (!response.ok) {
      Swal.fire(
        "ERROR",
        `NO SE PUDO CARGAR rates.json (status ${response.status})`,
        "error"
      );
      return;
    }

    rates = await response.json();

    // INICIALIZAR BALANCES POR MONEDA
    balances = { USD: initialBalanceUSD };
    Object.keys(rates).forEach((r) => {
      if (!balances[r]) balances[r] = 0;
    });

    populateCurrencies();
    updateHistory();
    updateBalanceDisplay();
  } catch (err) {
    Swal.fire(
      "ERROR",
      "NO SE PUDO CARGAR LAS MONEDAS. VERIFIQUE EL JSON Y QUE USE SERVIDOR LOCAL",
      "error"
    );
  }
}

// EVENTOS
convertBtn.addEventListener("click", convert);
clearHistoryBtn.addEventListener("click", handleClearHistory);
addBalanceBtn.addEventListener("click", handleAddBalance);

// CARGAR RATES AL INICIAR
loadRates();
