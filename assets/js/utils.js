// FUNCION PARA DAR FORMATO DE MONEDA
export function formatCurrency(value, currency) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency,
  }).format(value);
}

// FUNCION PARA GUARDAR HISTORIAL EN LOCALSTORAGE
export function saveHistory(item) {
  const history = JSON.parse(localStorage.getItem("conversionHistory")) || [];
  history.push(item);
  localStorage.setItem("conversionHistory", JSON.stringify(history));
}

// FUNCION PARA OBTENER HISTORIAL
export function getHistory() {
  return JSON.parse(localStorage.getItem("conversionHistory")) || [];
}

// FUNCION PARA LIMPIAR HISTORIAL
export function clearHistory() {
  localStorage.removeItem("conversionHistory");
}

// FUNCION PARA VALIDAR MONTO
export function isValidAmount(amount) {
  return amount && amount > 0;
}

// FUNCION PARA CONVERTIR MONEDAS
export function convertAmount(amount, fromRate, toRate) {
  return (amount / fromRate) * toRate;
}

// FUNCION PARA ACTUALIZAR IMAGENES DE LOS SELECTS
export function updateCurrencyImages(fromSelect, toSelect, fromImg, toImg) {
  fromImg.src = fromSelect.options[fromSelect.selectedIndex].dataset.img;
  toImg.src = toSelect.options[toSelect.selectedIndex].dataset.img;
}
